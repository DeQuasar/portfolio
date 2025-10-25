#!/usr/bin/env node

/**
 * Ensures the Cloudflare API response reports success.
 *
 * Usage: node scripts/assert-cloudflare-success.mjs <responsePath> <contextLabel>
 */
import { readFileSync } from 'node:fs'

const [, , responsePath = 'alias-response.json', contextLabel = 'alias deployment'] = process.argv

let raw
try {
  raw = readFileSync(responsePath, 'utf8')
} catch (error) {
  console.error(`Failed to read Cloudflare response from ${responsePath}:`, error)
  process.exit(1)
}

let data
try {
  data = JSON.parse(raw)
} catch (error) {
  console.error(`Invalid JSON in ${responsePath}:`, error)
  process.exit(1)
}

if (!data?.success) {
  console.error(`Cloudflare reported failure while attempting to ${contextLabel}.`)
  console.error('Full response:', JSON.stringify(data, null, 2))
  process.exit(1)
}

process.exit(0)
