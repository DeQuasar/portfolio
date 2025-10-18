#!/usr/bin/env node
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

const targets = [
  '.nuxt',
  '.output',
  '.data',
  'test-results',
  'reports',
  '.lighthouseci'
]

for (const target of targets) {
  try {
    rmSync(resolve(process.cwd(), target), { recursive: true, force: true })
  } catch (error) {
    console.warn(`[cleanup-playwright] Failed to remove ${target}: ${error.message}`)
  }
}
