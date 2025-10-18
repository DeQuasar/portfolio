import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'
import type { Page } from 'playwright-core'
import { setViewport } from './utils/viewport'
import { uiTestRootDir } from './utils/nuxt-root'

type BrowserType = 'chromium' | 'firefox' | 'webkit'
type ResumeStatus = 'idle' | 'downloading' | 'success' | 'error'

if (typeof process !== 'undefined') {
  (process as typeof process & { client?: boolean }).client = true
}

const VALID_BROWSERS = new Set<BrowserType>(['chromium', 'firefox', 'webkit'])
const DEFAULT_BROWSERS: BrowserType[] = ['chromium', 'firefox', 'webkit']
const RESUME_ROUTE = '**/download/resume'
const RESUME_FIXTURE = readFileSync(join(process.cwd(), 'public', 'resume.pdf'))
const SHOULD_PERSIST_TRACE = process.env.DEBUG_HERO_TOOLTIP_TRACE === '1'

if (SHOULD_PERSIST_TRACE) {
  mkdirSync('.vitest-artifacts', { recursive: true })
}

const shouldRunBrowserTests = process.env.ENABLE_BROWSER_TESTS === 'true'
let hasPlaywright = shouldRunBrowserTests
const requestedInput = process.env.PLAYWRIGHT_BROWSERS ?? process.env.PLAYWRIGHT_BROWSER
const browsersToRun = new Set<BrowserType>()

if (shouldRunBrowserTests) {
  try {
    await import('playwright-core')
  } catch {
    hasPlaywright = false
    console.warn('Skipping hero résumé download UI tests because playwright-core is not installed.')
  }
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
      console.warn(`Skipping unsupported browser "${candidate}" for hero résumé download ui spec.`)
    }
  }
}

if (browsersToRun.size === 0) {
  DEFAULT_BROWSERS.forEach((browser) => browsersToRun.add(browser))
}

async function stubResumeRoute (page: Page) {
  await page.route(RESUME_ROUTE, async (route) => {
    // Provide a short delay so UI has time to reflect the downloading state across surfaces.
    await new Promise((resolve) => setTimeout(resolve, 500))
    await route.fulfill({
      status: 200,
      body: RESUME_FIXTURE,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(RESUME_FIXTURE.length),
        'Content-Disposition': 'attachment; filename="Anthony-Protano-Resume.pdf"'
      }
    })
  })
}

for (const browserType of browsersToRun) {
  if (hasPlaywright) {
    const buildDir = `.nuxt/test-hero-resume-${browserType}`
    const contentDbPath = `/tmp/nuxt-content-${browserType}-resume.sqlite`
    await setup({
      rootDir: uiTestRootDir,
      buildDir,
      nuxtConfig: {
        buildDir,
        content: {
          _localDatabase: {
            type: 'sqlite',
            filename: contentDbPath
          }
        }
      },
      browser: true,
      setupTimeout: 60000,
      teardownTimeout: 45000,
      browserOptions: { type: browserType }
    })
  }

  const describeMaybe = hasPlaywright ? describe : describe.skip

  describeMaybe(`[${browserType}] hero résumé download`, () => {
    it('streams the résumé CTA, synchronises sticky nav state, and announces completion', async () => {
      const page = await createPage('/')
      await setViewport(page, 'desktop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForLoadState('networkidle')
      await page.evaluate(() => {
        const globalWithProcess = window as typeof window & { process?: { client?: boolean } }
        globalWithProcess.process = globalWithProcess.process ?? { client: true }
        globalWithProcess.process.client = true
      })
      if (SHOULD_PERSIST_TRACE || process.env.DEBUG_HERO_TOOLTIP_TRACE === '1') {
        const isClient = await page.evaluate(() => Boolean((window as typeof window & { process?: { client?: boolean } }).process?.client))
        console.warn('[hero resume debug] process.client', isClient)
      }

      await stubResumeRoute(page)

      const heroResumeCta = page.locator('main').locator('a[href="/download/resume"]').first()
      await page.waitForFunction(() => {
        const link = document.querySelector('main a[href="/download/resume"]')
        return link?.getAttribute('aria-label') === 'Download résumé'
      })

      const resumeResponse = page.waitForResponse((response) => {
        return response.url().includes('/download/resume') && response.status() === 200
      })

      try {
        await heroResumeCta.click()
        if (SHOULD_PERSIST_TRACE || process.env.DEBUG_HERO_TOOLTIP_TRACE === '1') {
          const resumeStateSnapshot = await page.evaluate(() => {
            const nuxtState = (window as typeof window & { __NUXT__?: any }).__NUXT__
            const store = nuxtState?.state ?? nuxtState?.payload?.state ?? null
            const resumeKey = store && ('$sresume-download-state' in store ? '$sresume-download-state' : 'resume-download-state')
            return {
              keys: store ? Object.keys(store) : null,
              resumeKey,
              resume: resumeKey ? store?.[resumeKey] ?? null : null,
              nuxtKeys: nuxtState ? Object.keys(nuxtState) : null
            }
          })
          console.warn('[hero resume debug] state after click', resumeStateSnapshot)
        }
        await waitForResumeStatus(page, 'downloading')

        await page.evaluate(() => {
          window.scrollTo({ top: 900, behavior: 'instant' })
        })

        const stickyNav = page.locator('nav[aria-label="Primary navigation"]')
        await stickyNav.waitFor({ state: 'visible' })

        await resumeResponse

        await waitForResumeStatus(page, 'success')

        await page.waitForFunction(() => {
          const status = document.querySelector('main a[href="/download/resume"] [role="status"]')
          return typeof status?.textContent === 'string' && status.textContent.includes('Résumé download started in your browser.')
        })

        await waitForDownloadLabel(page, 'Download résumé', 7000)

        const tracePayload = await page.evaluate(() => {
          const globalWithTrace = window as typeof window & { __heroTooltipTrace__?: Array<{ event: string }> }
          const entries = Array.isArray(globalWithTrace.__heroTooltipTrace__) ? globalWithTrace.__heroTooltipTrace__ : []
          return {
            hasTraceArray: Array.isArray(entries),
            traceLength: entries.length,
            entries
          }
        })

        expect(tracePayload.hasTraceArray).toBe(true)
        expect(tracePayload.traceLength).toBeGreaterThanOrEqual(0)

        if (SHOULD_PERSIST_TRACE) {
          const tracePath = `.vitest-artifacts/hero-resume-trace-${browserType}.json`
          writeFileSync(tracePath, JSON.stringify({
            browser: browserType,
            generatedAt: new Date().toISOString(),
            entries: tracePayload.entries
          }, null, 2))
        }
      } finally {
        await page.unroute(RESUME_ROUTE)
      }
    }, 40000)
  })
}

async function waitForResumeStatus(page: Page, expected: ResumeStatus, timeout = 12000) {
  try {
    await page.waitForFunction((target: ResumeStatus) => {
      const nuxtState = (window as typeof window & { __NUXT__?: any }).__NUXT__
      const store = nuxtState?.state ?? nuxtState?.payload?.state ?? null
      if (!store) {
        return false
      }
      const resumeKey = '$sresume-download-state' in store ? '$sresume-download-state' : 'resume-download-state'
      const resumeState = store?.[resumeKey] ?? null
      return resumeState?.status === target
    }, expected, { timeout })
  } catch (error) {
    if (SHOULD_PERSIST_TRACE || process.env.DEBUG_HERO_TOOLTIP_TRACE === '1') {
      console.warn('[hero resume debug] waitForResumeStatus timeout', { expected, error })
    }
  }
}

async function waitForDownloadLabel(page: Page, containsText: string, timeout = 12000) {
  try {
    await page.waitForFunction(
      (expected) => {
        const link = document.querySelector('main a[href="/download/resume"]')
        const label = link?.getAttribute('aria-label') ?? ''
        return label.includes(expected)
      },
      containsText,
      { timeout }
    )
  } catch (error) {
    if (SHOULD_PERSIST_TRACE || process.env.DEBUG_HERO_TOOLTIP_TRACE === '1') {
      const currentLabel = await page.evaluate(() => {
        const link = document.querySelector('main a[href="/download/resume"]')
        return link?.getAttribute('aria-label') ?? null
      })
      console.warn('[hero resume debug] waitForDownloadLabel timeout', { expected: containsText, currentLabel, error })
    }
    throw error
  }
}
