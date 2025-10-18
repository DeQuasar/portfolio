#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'

const projectRoot = process.cwd()
const reportsDir = resolve(projectRoot, 'reports', 'lighthouse')
const badgeDir = resolve(projectRoot, 'docs', 'badges')
const badgePath = join(badgeDir, 'lighthouse.json')

const pickColor = (score) => {
  if (score >= 0.95) return '4c1'
  if (score >= 0.9) return '8bc34a'
  if (score >= 0.8) return 'c0ca33'
  if (score >= 0.7) return 'ffb300'
  return 'f44336'
}

const formatPercent = (score) => `${Math.round(score * 100)}`

async function findLatestReport () {
  const entries = await fs.readdir(reportsDir, { withFileTypes: true })
  const reports = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.report.json'))
    .map((entry) => entry.name)
    .sort()
  if (reports.length === 0) {
    throw new Error('No Lighthouse report found in reports/lighthouse')
  }
  return join(reportsDir, reports[reports.length - 1])
}

async function ensureBadgeDir () {
  await fs.mkdir(badgeDir, { recursive: true })
}

async function main () {
  try {
    const reportPath = await findLatestReport()
    const raw = await fs.readFile(reportPath, 'utf8')
    const data = JSON.parse(raw)
    const categories = data?.categories ?? {}

    const perf = categories.performance?.score ?? 0
    const a11y = categories.accessibility?.score ?? 0
    const best = categories['best-practices']?.score ?? 0
    const seo = categories.seo?.score ?? 0

    const message = [
      `perf ${formatPercent(perf)}`,
      `a11y ${formatPercent(a11y)}`,
      `best ${formatPercent(best)}`,
      `seo ${formatPercent(seo)}`
    ].join(' | ')

    await ensureBadgeDir()
    await fs.writeFile(
      badgePath,
      JSON.stringify(
        {
          schemaVersion: 1,
          label: 'lighthouse',
          message,
          color: pickColor(perf)
        },
        null,
        2
      ) + '\n'
    )
    console.log(`[lighthouse-badge] Updated from ${basename(reportPath)}`)
  } catch (error) {
    console.warn('[lighthouse-badge] Unable to update badge:', error.message)
  }
}

main()
