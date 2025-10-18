#!/usr/bin/env bash
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "[install-playwright-deps] Must run as root inside the container." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

apt-get update -y -qq
apt-get install -y --no-install-recommends \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libatspi2.0-0 \
  libcups2 \
  libdrm2 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libxshmfence1 \
  xdg-utils \
  ca-certificates

apt-get clean
rm -rf /var/lib/apt/lists/*
