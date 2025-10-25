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

BASE_URL="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${CLOUDFLARE_PROJECT_NAME}"
ALIAS_URL="${BASE_URL}/aliases/${ALIAS_NAME}"
DEPLOYMENT_ALIAS_URL="${BASE_URL}/deployments/${CF_PAGES_DEPLOYMENT_ID}/alias"
PURGE_URL="${BASE_URL}/deployments/${CF_PAGES_DEPLOYMENT_ID}/purge-cache"

HTTP_STATUS=$(curl -sS -o "$ALIAS_RESPONSE" -w '%{http_code}' -X PUT \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data @"$ALIAS_PAYLOAD" \
  "$ALIAS_URL")

if [[ "$HTTP_STATUS" = "404" || "$HTTP_STATUS" = "405" ]]; then
  HTTP_STATUS=$(curl -sS -o "$ALIAS_RESPONSE" -w '%{http_code}' -X PUT \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data @"$ALIAS_PAYLOAD" \
    "$DEPLOYMENT_ALIAS_URL")
fi

if [[ "$HTTP_STATUS" != "200" ]]; then
  echo "Alias request failed with HTTP status $HTTP_STATUS" >&2
fi

node .github/scripts/assert-cloudflare-success.mjs "$ALIAS_RESPONSE" "$LABEL"

HTTP_STATUS=$(curl -sS -o "$PURGE_RESPONSE" -w '%{http_code}' -X POST \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_all":true}' \
  "$PURGE_URL")

if [[ "$HTTP_STATUS" != "200" ]]; then
  echo "Cache purge request failed with HTTP status $HTTP_STATUS" >&2
fi

node .github/scripts/assert-cloudflare-success.mjs "$PURGE_RESPONSE" "purge cache for ${LABEL}"

echo "Successfully completed ${LABEL}."
