#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { chmodSync, chownSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { chromium } from '@playwright/test'
import { createRequire } from 'node:module'

const chromePath = chromium.executablePath()
const require = createRequire(import.meta.url)

const env = {
  ...process.env,
  LHCI_CHROME_PATH: chromePath,
  LHCI_CLI_CHROME_PATH: chromePath,
  LHCI_NO_LIGHTHOUSE_ERROR_REPORTING: '1'
}

const userDataDir = process.env.LHCI_CHROME_USER_DATA_DIR ?? `${tmpdir()}/lhci-user`

const defaultChromeFlags = [
  '--headless=chrome',
  '--disable-crash-reporter',
  '--disable-breakpad',
  '--no-crashpad',
  '--disable-features=Crashpad',
  '--disable-features=BackForwardCache',
  '--disable-setuid-sandbox',
  '--single-process',
  '--disable-gpu',
  `--user-data-dir=${userDataDir}`
]
if (!env.LHCI_CHROME_FLAGS) {
  env.LHCI_CHROME_FLAGS = defaultChromeFlags.join(' ')
} else {
  const combinedFlags = new Set([...env.LHCI_CHROME_FLAGS.split(/\s+/).filter(Boolean), ...defaultChromeFlags])
  env.LHCI_CHROME_FLAGS = Array.from(combinedFlags).join(' ')
}

const canQueryIds = typeof process.getuid === 'function' && typeof process.getgid === 'function'
const currentUid = canQueryIds ? process.getuid() : undefined
const currentGid = canQueryIds ? process.getgid() : undefined
const isRoot = currentUid === 0
const shouldDropPrivileges = isRoot && process.env.LHCI_DISABLE_UID_SWITCH !== '1'
const defaultUid = shouldDropPrivileges ? 1000 : currentUid ?? 1000
const defaultGid = shouldDropPrivileges ? 1000 : currentGid ?? 1000
const fallbackUid = Number(process.env.LHCI_RUNNER_UID ?? defaultUid)
const fallbackGid = Number(process.env.LHCI_RUNNER_GID ?? defaultGid)

const ensureWritableDir = (path) => {
  try {
    mkdirSync(path, { recursive: true })
    chmodSync(path, 0o777)
    if (shouldDropPrivileges) {
      try {
        chownSync(path, fallbackUid, fallbackGid)
      } catch (chownError) {
        console.warn(`[lhci] Failed to chown ${path}:`, chownError.message)
      }
    }
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.warn(`[lhci] Failed to prepare ${path}:`, error.message)
    }
  }
}

ensureWritableDir('.lighthouseci')
ensureWritableDir(userDataDir)

if (shouldDropPrivileges) {
  const safeHome = process.env.LHCI_HOME_DIR ?? `${tmpdir()}/lhci-home`
  ensureWritableDir(safeHome)
  ensureWritableDir(`${safeHome}/.cache`)
  ensureWritableDir(`${safeHome}/.config`)
  env.HOME = safeHome
  env.XDG_CACHE_HOME = env.XDG_CACHE_HOME ?? `${safeHome}/.cache`
  env.XDG_CONFIG_HOME = env.XDG_CONFIG_HOME ?? `${safeHome}/.config`
}

const args = process.argv.slice(2)

const cliPath = require.resolve('@lhci/cli/src/cli.js')

console.log('[lhci]', 'Using Chrome executable at', chromePath)
console.log('[lhci]', 'Chrome flags:', env.LHCI_CHROME_FLAGS)

const spawnOptions = {
  stdio: 'inherit',
  env
}

if (shouldDropPrivileges) {
  spawnOptions.uid = fallbackUid
  spawnOptions.gid = fallbackGid
}

const child = spawn(process.execPath, [cliPath, ...args], spawnOptions)

child.on('exit', (code) => {
  process.exit(code ?? 1)
})
