#!/bin/bash
set -euo pipefail

# Ensure we have the expected Node.js version (Nuxt 3.19 requires >=20.19, prefer 22 LTS).
DESIRED_NODE_VERSION=${PLAYWRIGHT_NODE_VERSION:-22.12.0}
NODE_INSTALL_DIR="/workspace/.playwright-tools/node-v${DESIRED_NODE_VERSION}-linux-x64"
TOOLS_ROOT=${PLAYWRIGHT_TOOLS_ROOT:-/workspace/.playwright-tools}
NPM_GLOBAL_DIR="${TOOLS_ROOT}/npm-global"
PLAYWRIGHT_RUNTIME_DIR="${TOOLS_ROOT}/playwright-runtime"

if ! command -v node >/dev/null 2>&1 || [ "$(node -v 2>/dev/null | cut -c2-)" != "${DESIRED_NODE_VERSION}" ]; then
  echo "[playwright] Installing Node.js v${DESIRED_NODE_VERSION} locally..."
  mkdir -p "${NODE_INSTALL_DIR%/*}"
  ARCHIVE="node-v${DESIRED_NODE_VERSION}-linux-x64.tar.gz"
  URL="https://nodejs.org/dist/v${DESIRED_NODE_VERSION}/${ARCHIVE}"
  TMP_TARBALL="/tmp/${ARCHIVE}"
  curl -fsSL "$URL" -o "$TMP_TARBALL"
  rm -rf "$NODE_INSTALL_DIR"
  tar -xzf "$TMP_TARBALL" -C "${NODE_INSTALL_DIR%/*}"
  rm -f "$TMP_TARBALL"
fi

mkdir -p "$NPM_GLOBAL_DIR/bin"

export NPM_CONFIG_PREFIX="$NPM_GLOBAL_DIR"
export PATH="$NPM_GLOBAL_DIR/bin:$NODE_INSTALL_DIR/bin:$PATH"

DESIRED_NPM_VERSION=${PLAYWRIGHT_NPM_VERSION:-11.6.0}
CURRENT_NPM_VERSION=$(npm -v 2>/dev/null || echo "")
if [ "$CURRENT_NPM_VERSION" != "$DESIRED_NPM_VERSION" ]; then
  echo "[playwright] Installing npm v${DESIRED_NPM_VERSION} locally..."
  npm install -g "npm@${DESIRED_NPM_VERSION}"
  hash -r
fi

# Detect package manager (pnpm preferred, fallback to npm) and lockfile.
if [ -f pnpm-lock.yaml ]; then
  PACKAGE_MANAGER="pnpm"
  LOCKFILE="pnpm-lock.yaml"
  LOCK_STAMP="node_modules/.pnpm-lock.hash"
else
  PACKAGE_MANAGER="npm"
  LOCKFILE="package-lock.json"
  LOCK_STAMP="node_modules/.package-lock.hash"
fi
ARCH_STAMP="node_modules/.playwright-arch"

PACKAGE_MANAGER_SPEC=""
PNPM_VERSION=""

if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
  PACKAGE_MANAGER_SPEC=$(node -p "require('./package.json').packageManager || ''" 2>/dev/null || echo '')
  PNPM_VERSION="${PACKAGE_MANAGER_SPEC#*@}"

  if ! command -v pnpm >/dev/null 2>&1; then
    echo "[playwright] Installing pnpm globally..."
    if [ -n "$PNPM_VERSION" ] && [ "$PNPM_VERSION" != "$PACKAGE_MANAGER_SPEC" ]; then
      npm install -g "pnpm@${PNPM_VERSION}" >/dev/null 2>&1 || npm install -g pnpm >/dev/null 2>&1
    else
      npm install -g pnpm >/dev/null 2>&1
    fi
  fi
fi

# Ensure dependencies are installed inside the container-specific node_modules
# volume and get refreshed when the lockfile changes.
if [ -f "$LOCKFILE" ]; then
  LOCK_CURRENT=$(sha256sum "$LOCKFILE" | awk '{print $1}')
else
  LOCK_CURRENT=""
fi

needs_install=false

if [ ! -d node_modules ]; then
  needs_install=true
elif [ ! -f "$LOCK_STAMP" ]; then
  needs_install=true
elif [ "$LOCK_CURRENT" != "$(cat "$LOCK_STAMP" 2>/dev/null || echo)" ]; then
  needs_install=true
fi

EXPECTED_ARCH="$(uname -m)-$(node -v 2>/dev/null | cut -c2-)"

if [ -f "$ARCH_STAMP" ]; then
  if [ "$(cat "$ARCH_STAMP" 2>/dev/null || echo '')" != "$EXPECTED_ARCH" ]; then
    needs_install=true
  fi
else
  needs_install=true
fi

if [ "$needs_install" = true ]; then
  if [ -d node_modules ]; then
    find node_modules -mindepth 1 -maxdepth 1 -exec rm -rf {} +
  fi
  if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    echo "[playwright] Installing project dependencies via pnpm install --frozen-lockfile..."
    pnpm install --frozen-lockfile
  else
    echo "[playwright] Installing project dependencies via npm ci..."
    npm ci
  fi

  if [ -n "$LOCK_CURRENT" ]; then
    mkdir -p "$(dirname "$LOCK_STAMP")"
    echo "$LOCK_CURRENT" > "$LOCK_STAMP"
  fi

  echo "$EXPECTED_ARCH" > "$ARCH_STAMP"
fi

# Install playwright-core locally when missing so UI tests can run without touching host deps.
if ! node -e "require.resolve('playwright-core/package.json')" >/dev/null 2>&1; then
  PLAYWRIGHT_VERSION=${PLAYWRIGHT_VERSION:-"1.47.0"}
  echo "[playwright] Installing playwright-core@${PLAYWRIGHT_VERSION} for test runtime..."
  mkdir -p "$PLAYWRIGHT_RUNTIME_DIR"
  npm install --prefix "$PLAYWRIGHT_RUNTIME_DIR" --no-save "playwright-core@${PLAYWRIGHT_VERSION}"
  rm -rf node_modules/playwright-core
  mkdir -p node_modules
  cp -R "$PLAYWRIGHT_RUNTIME_DIR/node_modules/playwright-core" node_modules/
fi


export NUXT_PUBLIC_TOOLTIP_PROGRESS_DURATION="${NUXT_PUBLIC_TOOLTIP_PROGRESS_DURATION:-1200}"
export NUXT_PUBLIC_TOOLTIP_REST_DELAY="${NUXT_PUBLIC_TOOLTIP_REST_DELAY:-300}"
export NUXT_PUBLIC_HERO_TOOLTIP_TRACE="${NUXT_PUBLIC_HERO_TOOLTIP_TRACE:-1}"
export DEBUG_HERO_TOOLTIP_TRACE="${DEBUG_HERO_TOOLTIP_TRACE:-1}"

echo "[playwright] Running Vitest suite with Playwright enabled (tooltip duration=${NUXT_PUBLIC_TOOLTIP_PROGRESS_DURATION}ms, rest=${NUXT_PUBLIC_TOOLTIP_REST_DELAY}ms)..."

if [ "$#" -gt 0 ]; then
  if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    exec pnpm exec vitest run "$@"
  else
    exec npm test -- "$@"
  fi
else
  if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    exec pnpm test:ci
  else
    exec npm test -- --run
  fi
fi
