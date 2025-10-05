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

for (const entry of directories) {
  const absolute = path.join(projectRoot, entry.path)
  let existed = false
  try {
    const stat = await fs.stat(absolute)
    if (stat.isDirectory()) {
      existed = true
      await fs.rm(absolute, { recursive: true, force: true })
    } else {
      // Remove non-directory artifact occupying the target name
      await fs.rm(absolute, { force: true })
    }
  } catch (error) {
    // ENOENT just means nothing to prune
    if (error.code !== 'ENOENT') {
      console.error(`Failed to prune ${entry.path}:`, error)
    }
  }

  await fs.mkdir(absolute, { recursive: true })
  for (const sub of entry.subdirs) {
    await fs.mkdir(path.join(absolute, sub), { recursive: true })
  }

  results.push({ name: entry.path, pruned: existed })
}

if (!process.env.CI) {
  for (const { name, pruned } of results) {
    const status = pruned ? 'cleared' : 'initialized'
    console.log(`[prune-artifacts] ${name}: ${status}`)
  }
}
