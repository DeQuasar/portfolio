#!/usr/bin/env node
import { readFileSync } from 'node:fs'

const [, , filePath, contextLabel = 'Cloudflare operation'] = process.argv

if (!filePath) {
  console.error('Usage: node assert-cloudflare-success.mjs <response-path> [context]')
  process.exit(1)
}

let raw
try {
  raw = readFileSync(filePath, 'utf8')
} catch (error) {
  console.error(`Failed to read response file ${filePath}:`, error)
  process.exit(1)
}

let data
try {
  data = JSON.parse(raw)
} catch (error) {
  console.error(`Invalid JSON while processing ${contextLabel}:`, error)
  process.exit(1)
}

if (!data?.success) {
  console.error(`Cloudflare reported failure while attempting to ${contextLabel}.`)
  console.error(JSON.stringify(data, null, 2))
  process.exit(1)
}
process.exit(0)
