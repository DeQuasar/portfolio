#!/usr/bin/env node
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const assetsDir = process.env.NUXT_BUNDLE_DIR ?? '.output/public/_nuxt'

const budgetBytes = (value, fallback) => {
  if (!value) return fallback
  const numeric = Number(value)
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric
  }
  throw new Error(`Invalid budget value "${value}"`)
}

const budgets = {
  total: budgetBytes(process.env.NUXT_BUNDLE_TOTAL_BUDGET, 3 * 1024 * 1024), // 3 MiB
  js: budgetBytes(process.env.NUXT_BUNDLE_JS_MAX, 240 * 1024), // 240 KiB per chunk
  css: budgetBytes(process.env.NUXT_BUNDLE_CSS_MAX, 120 * 1024), // 120 KiB per chunk
  wasm: budgetBytes(process.env.NUXT_BUNDLE_WASM_MAX, 950 * 1024) // 950 KiB per module
}

const sizeByExt = new Map()
const files = []

const collectFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await collectFiles(absolute)
    } else if (entry.isFile()) {
      const { size } = await stat(absolute)
      const ext = path.extname(entry.name).toLowerCase() || 'unknown'
      sizeByExt.set(ext, (sizeByExt.get(ext) ?? 0) + size)
      files.push({ path: absolute, ext, size })
    }
  }
}

const formatBytes = (bytes) => {
  const units = ['B', 'KB', 'MB']
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`
}

const assertUnderBudget = (items, limit, label) => {
  const offenders = items.filter(({ size }) => size > limit)
  if (offenders.length === 0) {
    return
  }
  const details = offenders
    .sort((a, b) => b.size - a.size)
    .map(({ path: filePath, size }) => `  • ${path.relative(root, filePath)} (${formatBytes(size)})`)
    .join('\n')
  throw new Error(`${label} budget exceeded (limit ${formatBytes(limit)}):\n${details}`)
}

const main = async () => {
  const absoluteAssetsDir = path.join(root, assetsDir)
  await collectFiles(absoluteAssetsDir)

  const totalSize = files.reduce((acc, file) => acc + file.size, 0)
  if (totalSize > budgets.total) {
    throw new Error(
      `Total client bundle exceeds budget ${formatBytes(budgets.total)} (actual ${formatBytes(totalSize)})`
    )
  }

  assertUnderBudget(files.filter((file) => file.ext === '.js'), budgets.js, 'JavaScript chunk')
  assertUnderBudget(files.filter((file) => file.ext === '.css'), budgets.css, 'CSS bundle')
  assertUnderBudget(files.filter((file) => file.ext === '.wasm'), budgets.wasm, 'WASM module')

  const summaryLines = [
    `Client bundle size OK: ${formatBytes(totalSize)}`,
    `JS total: ${formatBytes(sizeByExt.get('.js') ?? 0)}`,
    `CSS total: ${formatBytes(sizeByExt.get('.css') ?? 0)}`,
    `WASM total: ${formatBytes(sizeByExt.get('.wasm') ?? 0)}`
  ]

  for (const line of summaryLines) {
    console.log('[bundle-budget]', line)
  }
}

main().catch((error) => {
  console.error('[bundle-budget]', error.message)
  process.exit(1)
})
