#!/bin/bash
set -euo pipefail

if [[ "$1" == "pnpm" || "$1" == "bash" || "$1" == "sh" ]]; then
  should_bootstrap="yes"
  if [[ "${SKIP_BOOTSTRAP:-0}" == "1" ]]; then
    if [[ -d node_modules && -n "$(ls -A node_modules 2>/dev/null)" ]]; then
      should_bootstrap="no"
    fi
  fi

  if [[ "$should_bootstrap" == "yes" ]]; then
    if [[ ! -d node_modules || -z "$(ls -A node_modules 2>/dev/null)" ]]; then
      pnpm install --frozen-lockfile
    fi

    if [[ -d node_modules ]]; then
      pnpm rebuild better-sqlite3 >/dev/null 2>&1 || pnpm rebuild better-sqlite3
    fi
  fi
fi

exec "$@"
