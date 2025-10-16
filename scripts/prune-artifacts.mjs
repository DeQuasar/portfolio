#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()

const directories = [
  { path: 'reports', subdirs: ['lighthouse', 'playwright', 'coverage'] },
  { path: '.lighthouseci', subdirs: [] },
  { path: 'test-results', subdirs: [] }
]

const results = []

const ensureWritableDir = async (target) => {
  try {
    await fs.mkdir(target, { recursive: true })
    await fs.chmod(target, 0o777)
  } catch (error) {
    if (error.code === 'EPERM' || error.code === 'EACCES') {
      try {
        await fs.rm(target, { recursive: true, force: true })
        await fs.mkdir(target, { recursive: true })
        await fs.chmod(target, 0o777)
        return
      } catch (retryError) {
        console.warn(`[prune-artifacts] Failed to reset permissions for ${target}:`, retryError.message)
        return
      }
    }
    if (error.code !== 'ENOENT') {
      console.warn(`[prune-artifacts] Failed to prepare ${target}:`, error.message)
    }
  }
}

for (const entry of directories) {
  const absolute = path.join(projectRoot, entry.path)
  let existed = false
  try {
    const stat = await fs.stat(absolute)
    if (stat.isDirectory()) {
      existed = true
      const items = await fs.readdir(absolute)
      await Promise.all(items.map(async (item) => {
        const target = path.join(absolute, item)
        await fs.rm(target, { recursive: true, force: true })
      }))
    } else {
      await fs.rm(absolute, { force: true })
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Failed to prune ${entry.path}:`, error)
    }
  }

  await ensureWritableDir(absolute)
  for (const sub of entry.subdirs) {
    await ensureWritableDir(path.join(absolute, sub))
  }

  results.push({ name: entry.path, pruned: existed })
}

if (!process.env.CI) {
  for (const { name, pruned } of results) {
    const status = pruned ? 'cleared' : 'initialized'
    console.log(`[prune-artifacts] ${name}: ${status}`)
  }
}
