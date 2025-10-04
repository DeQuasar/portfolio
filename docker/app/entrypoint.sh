#!/bin/bash
set -euo pipefail

if [[ "$1" == "pnpm" || "$1" == "bash" || "$1" == "sh" ]]; then
  if [[ ! -d node_modules || -z "$(ls -A node_modules 2>/dev/null)" ]]; then
    pnpm install --frozen-lockfile
  fi
fi

exec "$@"
