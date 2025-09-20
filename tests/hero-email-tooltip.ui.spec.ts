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

const PROGRESS_DURATION = Number(process.env.NUXT_PUBLIC_TOOLTIP_PROGRESS_DURATION)
const REST_DELAY = Number(process.env.NUXT_PUBLIC_TOOLTIP_REST_DELAY)
const TEST_TIMEOUT = PROGRESS_DURATION + REST_DELAY + 20000

type BrowserType = 'chromium' | 'firefox' | 'webkit'
const VALID_BROWSERS = new Set<BrowserType>(['chromium', 'firefox', 'webkit'])
const DEFAULT_BROWSERS: BrowserType[] = ['chromium', 'firefox', 'webkit']

const requestedInput = process.env.PLAYWRIGHT_BROWSERS ?? process.env.PLAYWRIGHT_BROWSER
const browsersToRun = new Set<BrowserType>()

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

let hasPlaywright = true

try {
  await import('playwright-core')
} catch (error) {
  hasPlaywright = false
  console.warn('Skipping hero email tooltip UI tests because playwright-core is not installed.')
}

for (const browserType of browsersToRun) {
  if (hasPlaywright) {
    await setup({
      rootDir: fileURLToPath(new URL('../', import.meta.url)),
      browser: true,
      browserOptions: {
        type: browserType
      }
    })
  }

  const describeMaybe = hasPlaywright ? describe : describe.skip

  describeMaybe(`[${browserType}] hero email tooltip`, () => {
    it('copies the email and shows feedback before resetting', async () => {
      const page = await createPage('/')
      await installClipboardStub(page)

      const configDurations = await page.evaluate(() => window.__NUXT__?.config?.public ?? {})
      expect(Number(configDurations.tooltipProgressDuration)).toBe(PROGRESS_DURATION)
      expect(Number(configDurations.tooltipRestDelay)).toBe(REST_DELAY)

      await page.getByRole('button', { name: 'View email options' }).click()
      const emailOptions = page.getByRole('group', { name: 'Email options' })
      await emailOptions.waitFor({ state: 'visible', timeout: 3200 })

      const mailtoHref = await page.getByRole('link', { name: /Email Anthony/i }).getAttribute('href')

      await page.getByRole('button', { name: 'Copy email' }).click()

      await page.waitForFunction(() => {
        const state = (window as typeof window & { __heroTooltipState__?: string }).__heroTooltipState__
        return state === 'copied'
      }, undefined, { timeout: 2000 })

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

      await page.waitForFunction(() => {
        const state = (window as typeof window & { __heroTooltipState__?: string }).__heroTooltipState__
        return state === 'idle'
      }, undefined, { timeout: PROGRESS_DURATION + REST_DELAY + 2000 })
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

    ;(window as typeof window & { __clipboardWrites?: string[] }).__clipboardWrites = writes
  })

  await page.reload({ waitUntil: 'networkidle' })
}
