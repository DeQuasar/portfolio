#!/usr/bin/env bash
set -euo pipefail

ALIAS_NAME="${1:-}"
LABEL="${2:-alias deployment}"

if [[ -z "$ALIAS_NAME" ]]; then
  echo "Usage: promote-cloudflare-alias.sh <alias> [label]" >&2
  exit 1
fi

: "${CLOUDFLARE_API_TOKEN:?Missing CLOUDFLARE_API_TOKEN environment variable}" 
: "${CLOUDFLARE_ACCOUNT_ID:?Missing CLOUDFLARE_ACCOUNT_ID environment variable}" 
: "${CLOUDFLARE_PROJECT_NAME:?Missing CLOUDFLARE_PROJECT_NAME environment variable}" 
: "${CF_PAGES_DEPLOYMENT_ID:?Missing CF_PAGES_DEPLOYMENT_ID environment variable}" 

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

ALIAS_PAYLOAD="$WORKDIR/alias.json"
cat <<JSON > "$ALIAS_PAYLOAD"
{ "alias": "$ALIAS_NAME" }
JSON

ALIAS_RESPONSE="$WORKDIR/alias-response.json"
PURGE_RESPONSE="$WORKDIR/purge-response.json"

curl -fsS -X PUT \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data @"$ALIAS_PAYLOAD" \
  "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${CLOUDFLARE_PROJECT_NAME}/deployments/${CF_PAGES_DEPLOYMENT_ID}/alias" \
  -o "$ALIAS_RESPONSE"

node .github/scripts/assert-cloudflare-success.mjs "$ALIAS_RESPONSE" "$LABEL"

curl -fsS -X POST \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_all":true}' \
  "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${CLOUDFLARE_PROJECT_NAME}/deployments/${CF_PAGES_DEPLOYMENT_ID}/purge-cache" \
  -o "$PURGE_RESPONSE"

node .github/scripts/assert-cloudflare-success.mjs "$PURGE_RESPONSE" "purge cache for ${LABEL}"

echo "Successfully completed ${LABEL}."
