#!/bin/bash
set -euo pipefail

# Ensure npm dependencies are installed inside the container-specific node_modules volume
# and get refreshed when the lockfile changes.
LOCKFILE="package-lock.json"
LOCK_STAMP="node_modules/.package-lock.hash"
LOCK_CURRENT=$(sha256sum "$LOCKFILE" | awk '{print $1}')

needs_install=false

if [ ! -d node_modules ]; then
  needs_install=true
elif [ ! -f "$LOCK_STAMP" ]; then
  needs_install=true
elif [ "$LOCK_CURRENT" != "$(cat "$LOCK_STAMP" 2>/dev/null || echo)" ]; then
  needs_install=true
fi

if [ "$needs_install" = true ]; then
  echo "[playwright] Installing project dependencies via npm ci..."
  npm ci
  echo "$LOCK_CURRENT" > "$LOCK_STAMP"
fi

# Install playwright-core locally when missing so UI tests can run without touching host deps.
if ! node -e "require.resolve('playwright-core/package.json')" >/dev/null 2>&1; then
  PLAYWRIGHT_VERSION=${PLAYWRIGHT_VERSION:-"1.47.0"}
  echo "[playwright] Installing playwright-core@${PLAYWRIGHT_VERSION} (no-save)..."
  npm install --no-save "playwright-core@${PLAYWRIGHT_VERSION}"
fi


export NUXT_PUBLIC_TOOLTIP_PROGRESS_DURATION="${NUXT_PUBLIC_TOOLTIP_PROGRESS_DURATION:-1200}"
export NUXT_PUBLIC_TOOLTIP_REST_DELAY="${NUXT_PUBLIC_TOOLTIP_REST_DELAY:-300}"

echo "[playwright] Running Vitest suite with Playwright enabled (tooltip duration=${NUXT_PUBLIC_TOOLTIP_PROGRESS_DURATION}ms, rest=${NUXT_PUBLIC_TOOLTIP_REST_DELAY}ms)..."

if [ "$#" -gt 0 ]; then
  exec npm test -- "$@"
else
  exec npm test -- --run
fi
