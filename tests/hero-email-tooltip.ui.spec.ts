import { appendFileSync, mkdirSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'
import { fileURLToPath } from 'node:url'
import type { Page } from 'playwright-core'

if (!process.env.NUXT_PUBLIC_TOOLTIP_PROGRESS_DURATION) {
  process.env.NUXT_PUBLIC_TOOLTIP_PROGRESS_DURATION = '1200'
}

if (!process.env.NUXT_PUBLIC_TOOLTIP_REST_DELAY) {
  process.env.NUXT_PUBLIC_TOOLTIP_REST_DELAY = '300'
}

if (!process.env.NUXT_PUBLIC_HERO_TOOLTIP_TRACE) {
  process.env.NUXT_PUBLIC_HERO_TOOLTIP_TRACE = '1'
}

if (!process.env.DEBUG_HERO_TOOLTIP_TRACE) {
  process.env.DEBUG_HERO_TOOLTIP_TRACE = '1'
}

const PROGRESS_DURATION = Number(process.env.NUXT_PUBLIC_TOOLTIP_PROGRESS_DURATION)
const REST_DELAY = Number(process.env.NUXT_PUBLIC_TOOLTIP_REST_DELAY)
const TEST_TIMEOUT = PROGRESS_DURATION + REST_DELAY + 20000

type BrowserType = 'chromium' | 'firefox' | 'webkit'
type HeroTooltipState = 'idle' | 'copied' | 'error'
const VALID_BROWSERS = new Set<BrowserType>(['chromium', 'firefox', 'webkit'])
const DEFAULT_BROWSERS: BrowserType[] = ['chromium', 'firefox', 'webkit']

const CLIPBOARD_PERMISSIONS = ['clipboard-read']

const requestedInput = process.env.PLAYWRIGHT_BROWSERS ?? process.env.PLAYWRIGHT_BROWSER
const browsersToRun = new Set<BrowserType>()
const SHOULD_LOG_TOOLTIP_TRACE = process.env.DEBUG_HERO_TOOLTIP_TRACE === '1'

if (SHOULD_LOG_TOOLTIP_TRACE) {
  mkdirSync('.vitest-artifacts', { recursive: true })
}

if (SHOULD_LOG_TOOLTIP_TRACE) {
  console.info('[hero tooltip debug] DEBUG_HERO_TOOLTIP_TRACE=1')
}

if (requestedInput) {
  for (const raw of requestedInput.split(',')) {
    const candidate = raw.trim().toLowerCase() as BrowserType
    if (!candidate) {
      continue
    }
    if (VALID_BROWSERS.has(candidate)) {
      browsersToRun.add(candidate)
    } else {
      console.warn(`Skipping unsupported browser "${candidate}" for hero email tooltip ui spec.`)
    }
  }
}

if (browsersToRun.size === 0) {
  DEFAULT_BROWSERS.forEach((browser) => browsersToRun.add(browser))
}

const shouldRunBrowserTests = process.env.ENABLE_BROWSER_TESTS === 'true'
let hasPlaywright = shouldRunBrowserTests

if (shouldRunBrowserTests) {
  try {
    await import('playwright-core')
  } catch (error) {
    hasPlaywright = false
    console.warn('Skipping hero email tooltip UI tests because playwright-core is not installed.')
  }
}

for (const browserType of browsersToRun) {
  if (hasPlaywright) {
    await setup({
      rootDir: fileURLToPath(new URL('../', import.meta.url)),
      browser: true,
      browserOptions: {
        type: browserType,
        contextOptions: {
          permissions: CLIPBOARD_PERMISSIONS
        }
      }
    })
  }

  const describeMaybe = hasPlaywright ? describe : describe.skip

  describeMaybe(`[${browserType}] hero email tooltip`, () => {
    it('copies the email and shows feedback before resetting', async () => {
      const page = await createPage('/')
      await page.waitForLoadState('domcontentloaded')
      const origin = new URL(page.url()).origin
      await page.context().grantPermissions(CLIPBOARD_PERMISSIONS, { origin })
      if (SHOULD_LOG_TOOLTIP_TRACE) {
        console.info(`[hero tooltip debug] stage: page-ready (${browserType}) url=${page.url()}`)
        page.on('console', (message) => {
          const entry = `[page console:${browserType}] ${message.type()} ${message.text()}`
          console.info(entry)
          appendFileSync('.vitest-artifacts/hero-tooltip-console.log', `\n${entry}`)
        })
        await page.evaluate(() => {
          console.log('[hero tooltip debug] page logging ready')
        })
      }
      await installClipboardStub(page)
      if (SHOULD_LOG_TOOLTIP_TRACE) {
        console.info(`[hero tooltip debug] stage: after-clipboard-stub (${browserType}) url=${page.url()}`)
      }
      const clipboardDiagnostics = await page.evaluate(() => {
        const descriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
        return {
          hasClipboard: Boolean((navigator as typeof navigator & { clipboard?: unknown }).clipboard),
          hasWriteText: typeof navigator.clipboard?.writeText === 'function',
          descriptorConfigurable: descriptor?.configurable ?? null,
          descriptorWritable: descriptor?.writable ?? null,
          writesLength: (window as typeof window & { __clipboardWrites?: unknown[] }).__clipboardWrites?.length ?? null
        }
      })
      if (SHOULD_LOG_TOOLTIP_TRACE) {
        console.info(`[hero tooltip debug] clipboard diagnostics ${browserType}`, clipboardDiagnostics)
      }

      const configDurations = await page.evaluate(() => window.__NUXT__?.config?.public ?? {})
      expect(Number(configDurations.tooltipProgressDuration)).toBe(PROGRESS_DURATION)
      expect(Number(configDurations.tooltipRestDelay)).toBe(REST_DELAY)
      expect(Boolean(configDurations.heroTooltipTrace)).toBe(true)
      if (SHOULD_LOG_TOOLTIP_TRACE) {
        console.info('[hero tooltip debug] runtime heroTooltipTrace flag', configDurations.heroTooltipTrace)
      }

      await page.getByRole('button', { name: 'View email options' }).click()
      const emailOptions = page.getByRole('group', { name: 'Email options' })
      await emailOptions.waitFor({ state: 'visible', timeout: 3200 })
      if (SHOULD_LOG_TOOLTIP_TRACE) {
        console.info(`[hero tooltip debug] stage: email-options-visible (${browserType})`)
      }

      const mailtoHref = await page.getByRole('link', { name: /Email Anthony/i }).getAttribute('href')

      await debugHeroTooltipTrace(page, 'before-copy-click')
      const copyButton = page.getByRole('button', { name: 'Copy email' })
      const isCopyVisible = await copyButton.isVisible()
      const isCopyEnabled = await copyButton.isEnabled()
      if (SHOULD_LOG_TOOLTIP_TRACE) {
        console.info('[hero tooltip debug] copy button visible?', isCopyVisible)
        console.info('[hero tooltip debug] copy button enabled?', isCopyEnabled)
      }
      await copyButton.click()
      if (SHOULD_LOG_TOOLTIP_TRACE) {
        console.info('[hero tooltip debug] after copy click')
      }
      await debugHeroTooltipTrace(page, 'after-copy-click')
      if (SHOULD_LOG_TOOLTIP_TRACE) {
        console.info('[hero tooltip debug] after debugHeroTooltipTrace call')
      }

      await waitForTooltipState(page, 'copied', 2000)

      await page.waitForFunction(() => !document.querySelector('[role="group"][aria-label="Email options"]'), undefined, { timeout: 2000 })

      await page.waitForTimeout(100)

      await page.waitForSelector('[role="status"]', { state: 'attached', timeout: PROGRESS_DURATION + 1500 })

      await page.waitForSelector("[data-testid=\"email-tooltip\"][data-variant='success']", { state: 'visible', timeout: PROGRESS_DURATION + 1500 })

      await page.waitForFunction(() => {
        const message = document.querySelector('p[aria-live="polite"]')?.textContent?.trim() ?? ''
        return message.includes('Email address copied')
      }, undefined, { timeout: 1500 })

      const clipboardWrites = await page.evaluate(() => (window as typeof window & { __clipboardWrites?: string[] }).__clipboardWrites ?? [])
      const expectedEmail = (mailtoHref ?? '').replace(/^mailto:/, '')
      expect(clipboardWrites.at(-1)).toBe(expectedEmail)

      await waitForTooltipState(page, 'idle', PROGRESS_DURATION + REST_DELAY + 2000)
    }, TEST_TIMEOUT)
  })
}

async function installClipboardStub(page: Page) {
  await page.addInitScript(() => {
    const writes: string[] = []
    const stub = {
      writeText(text: string) {
        const value = typeof text === 'string' ? text : String(text)
        writes.push(value)
        return Promise.resolve()
      },
      readText() {
        return Promise.resolve(writes[writes.length - 1] ?? '')
      }
    }

    try {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: stub
      })
    } catch (error) {
      try {
        const clipboard = (navigator as typeof navigator & { clipboard?: any }).clipboard ||= {}
        Object.assign(clipboard, stub)
      } catch (assignError) {
        console.warn('Failed to stub navigator.clipboard', assignError)
      }
    }
    const clipboardState = window as typeof window & { __clipboardWrites?: string[] }
    clipboardState.__clipboardWrites = writes
  })

  await page.reload({ waitUntil: 'networkidle' })
}

async function waitForTooltipState(page: Page, expected: HeroTooltipState, timeout: number) {
  try {
    await page.waitForFunction((target: HeroTooltipState) => {
      const state = (window as typeof window & { __heroTooltipState__?: HeroTooltipState }).__heroTooltipState__
      return state === target
    }, expected, { timeout })
  } catch (error) {
    if (SHOULD_LOG_TOOLTIP_TRACE) {
      const trace = await page.evaluate(() => {
        const global = window as typeof window & { __heroTooltipTrace__?: unknown[] }
        return global.__heroTooltipTrace__ ?? []
      })
      const contextLabel = `waitForTooltipState:${expected}`
      appendFileSync('.vitest-artifacts/hero-tooltip-trace.log', `\n[hero tooltip trace] ${contextLabel}\n${JSON.stringify(trace, null, 2)}\n`)
    }
    throw error
  }
}

async function debugHeroTooltipTrace(page: Page, label: string) {
  if (!SHOULD_LOG_TOOLTIP_TRACE) {
    return
  }
  const trace = await page.evaluate(() => {
    const global = window as typeof window & { __heroTooltipTrace__?: unknown[] }
    return global.__heroTooltipTrace__ ?? []
  })
  console.info(`[hero tooltip trace:${label}]`, JSON.stringify(trace, null, 2))
  appendFileSync('.vitest-artifacts/hero-tooltip-trace.log', `\n[hero tooltip trace:${label}]\n${JSON.stringify(trace, null, 2)}\n`)
}
