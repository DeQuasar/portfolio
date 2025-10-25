#!/usr/bin/env node

/**
 * Promote a Cloudflare Pages deployment alias, then purge its cache.
 *
 * Usage: node .github/scripts/promote-cloudflare-alias.mjs <alias> [label]
 */
const aliasName = process.argv[2]
const label = process.argv[3] ?? `alias ${aliasName ?? 'preview'} deployment`

const {
  CLOUDFLARE_API_TOKEN: apiToken,
  CLOUDFLARE_ACCOUNT_ID: accountId,
  CLOUDFLARE_PROJECT_NAME: projectName,
  CF_PAGES_DEPLOYMENT_ID: deploymentId
} = process.env

function requireValue(value, description) {
  if (!value) {
    console.error(`Missing ${description}.`)
    process.exit(1)
  }
}

requireValue(aliasName, 'alias name argument')
requireValue(apiToken, 'CLOUDFLARE_API_TOKEN environment variable')
requireValue(accountId, 'CLOUDFLARE_ACCOUNT_ID environment variable')
requireValue(projectName, 'CLOUDFLARE_PROJECT_NAME environment variable')
requireValue(deploymentId, 'CF_PAGES_DEPLOYMENT_ID environment variable')

const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments/${deploymentId}`
const commonHeaders = {
  Authorization: `Bearer ${apiToken}`,
  'Content-Type': 'application/json'
}

async function run() {
  const aliasPayload = JSON.stringify({ alias: aliasName })

  const aliasResponse = await fetch(`${baseUrl}/alias`, {
    method: 'PUT',
    headers: commonHeaders,
    body: aliasPayload
  })

  const aliasJson = await aliasResponse.json().catch(() => ({}))
  if (!aliasResponse.ok || !aliasJson?.success) {
    console.error(`Failed to ${label}.`, JSON.stringify(aliasJson, null, 2))
    process.exit(1)
  }

  const purgeResponse = await fetch(`${baseUrl}/purge-cache`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({ purge_all: true })
  })

  const purgeJson = await purgeResponse.json().catch(() => ({}))
  if (!purgeResponse.ok || !purgeJson?.success) {
    console.error(`Alias succeeded but cache purge failed while attempting to ${label}.`, JSON.stringify(purgeJson, null, 2))
    process.exit(1)
  }

  console.log(`Successfully completed ${label}.`)
}

run().catch((error) => {
  console.error(`Unexpected error while attempting to ${label}:`, error)
  process.exit(1)
})
