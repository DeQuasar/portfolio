#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { chmodSync, chownSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { createConnection, createServer } from 'node:net'
import { setTimeout as sleep } from 'node:timers/promises'
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
  '--no-sandbox',
  '--disable-setuid-sandbox',
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
const defaultUid = currentUid ?? 1000
const defaultGid = currentGid ?? 1000
const fallbackUid = Number(process.env.LHCI_RUNNER_UID ?? defaultUid)
const fallbackGid = Number(process.env.LHCI_RUNNER_GID ?? defaultGid)

const ensureWritableDir = (path) => {
  try {
    mkdirSync(path, { recursive: true })
    chmodSync(path, 0o777)
    if (isRoot) {
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

const args = process.argv.slice(2)

const cliPath = require.resolve('@lhci/cli/src/cli.js')

console.log('[lhci]', 'Using Chrome executable at', chromePath)
console.log('[lhci]', 'Chrome flags:', env.LHCI_CHROME_FLAGS)
if (!isRoot) {
  console.warn('[lhci]', 'Running without elevated privileges; ensure your kernel allows unprivileged user namespaces')
} else {
  console.warn('[lhci]', 'Running as root with --no-sandbox fallback')
}

const spawnOptions = {
  stdio: 'inherit',
  env
}

const parseFlags = (flags) => flags.split(/\s+/).filter(Boolean)

const findAvailablePort = async () =>
  new Promise((resolve, reject) => {
    const server = createServer()
    server.unref()
    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (address && typeof address === 'object') {
        const { port } = address
        server.close(() => resolve(port))
      } else {
        server.close(() => reject(new Error('Failed to acquire port for Chrome remote debugging')))
      }
    })
  })

const waitForDebugPort = async (port, timeoutMs = 15000) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      await new Promise((resolve, reject) => {
        const socket = createConnection(port, '127.0.0.1')
        const timer = setTimeout(() => {
          socket.destroy()
          reject(new Error('timeout'))
        }, 500)
        socket.once('connect', () => {
          clearTimeout(timer)
          socket.end()
          resolve()
        })
        socket.once('error', (error) => {
          clearTimeout(timer)
          reject(error)
        })
      })
      return
    } catch {
      await sleep(100)
    }
  }

  throw new Error(`Timed out waiting for Chrome to expose remote debugging port ${port}`)
}

const launchChrome = async () => {
  const remoteDebugPort = await findAvailablePort()
  const flagList = parseFlags(env.LHCI_CHROME_FLAGS).filter(
    (flag) => !flag.startsWith('--remote-debugging-port=')
  )
  flagList.push(`--remote-debugging-port=${remoteDebugPort}`)
  const chromeArgs = [...flagList, 'about:blank']

  console.log('[lhci]', `Launching Chrome with remote debugging port ${remoteDebugPort}`)
  const chromeProcess = spawn(chromePath, chromeArgs, {
    stdio: ['ignore', 'pipe', 'pipe'],
    env
  })

  chromeProcess.stdout.on('data', (chunk) => {
    process.stdout.write(`[chrome] ${chunk}`)
  })
  chromeProcess.stderr.on('data', (chunk) => {
    process.stderr.write(`[chrome] ${chunk}`)
  })

  let closed = false
  chromeProcess.once('exit', (code, signal) => {
    closed = true
    if (code !== 0) {
      console.error('[lhci]', `Chrome exited early (code=${code ?? 'null'}, signal=${signal ?? 'null'})`)
    }
  })

  try {
    await waitForDebugPort(remoteDebugPort)
  } catch (error) {
    if (!closed) {
      chromeProcess.kill('SIGKILL')
    }
    throw error
  }

  return { chromeProcess, remoteDebugPort, chromeFlags: flagList.filter((flag) => !flag.startsWith('--remote-debugging-port=')) }
}

const run = async () => {
  let chromeProcess
  try {
    const { chromeProcess: proc, remoteDebugPort, chromeFlags } = await launchChrome()
    chromeProcess = proc

    const overrides = [
      `--collect.settings.port=${remoteDebugPort}`,
      `--collect.settings.chromeFlags=${chromeFlags.join(' ')}`
    ]

    const child = spawn(process.execPath, [cliPath, ...args, ...overrides], spawnOptions)

    const shutdown = (code) => {
      if (chromeProcess && !chromeProcess.killed) {
        chromeProcess.kill('SIGTERM')
        setTimeout(() => {
          if (!chromeProcess.killed) chromeProcess.kill('SIGKILL')
        }, 5000)
      }
      process.exit(code ?? 1)
    }

    child.on('exit', shutdown)
    process.on('SIGINT', () => {
      child.kill('SIGINT')
      shutdown(130)
    })
    process.on('SIGTERM', () => {
      child.kill('SIGTERM')
      shutdown(143)
    })
  } catch (error) {
    if (chromeProcess && !chromeProcess.killed) {
      chromeProcess.kill('SIGKILL')
    }
    console.error('[lhci]', error.message || error)
    process.exit(1)
  }
}

run()
