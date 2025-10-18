import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'
import type { Page } from 'playwright-core'
import { setViewport } from './utils/viewport'
import { uiTestRootDir } from './utils/nuxt-root'

type BrowserType = 'chromium' | 'firefox' | 'webkit'

const VALID_BROWSERS = new Set<BrowserType>(['chromium', 'firefox', 'webkit'])
const DEFAULT_BROWSERS: BrowserType[] = ['chromium', 'firefox', 'webkit']
const RESUME_ROUTE = '**/download/resume'
const RESUME_FIXTURE = readFileSync(join(process.cwd(), 'public', 'resume.pdf'))

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

        await page.evaluate(() => {
          window.scrollTo({ top: 900, behavior: 'instant' })
        })

        const stickyNav = page.locator('nav[aria-label="Primary navigation"]')
        await stickyNav.waitFor({ state: 'visible' })

        await page.waitForFunction(() => {
          const navLink = document.querySelector('nav[aria-label="Primary navigation"] a[href="/download/resume"]')
          return navLink?.getAttribute('aria-label') === 'Downloading résumé'
        })

        await page.waitForFunction(() => {
          const link = document.querySelector('main a[href="/download/resume"]')
          return link?.getAttribute('aria-label') === 'Downloading résumé'
        })

        await page.waitForFunction(() => {
          const status = document.querySelector('main a[href="/download/resume"] [role="status"]')
          return typeof status?.textContent === 'string' && status.textContent.includes('Downloading résumé')
        })

        await resumeResponse

        await page.waitForFunction(() => {
          const status = document.querySelector('main a[href="/download/resume"] [role="status"]')
          return typeof status?.textContent === 'string' && status.textContent.includes('Résumé download started in your browser.')
        })

        await page.waitForFunction(() => {
          const link = document.querySelector('main a[href="/download/resume"]')
          return link?.getAttribute('aria-label') === 'Download résumé'
        }, { timeout: 7000 })

        await page.waitForFunction(() => {
          const navLink = document.querySelector('nav[aria-label="Primary navigation"] a[href="/download/resume"]')
          return !navLink || navLink.getAttribute('aria-label') === 'Download résumé'
        }, { timeout: 7000 })

        const traceMetadata = await page.evaluate(() => {
          const globalWithTrace = window as typeof window & { __heroTooltipTrace__?: Array<{ event: string }> }
          return {
            hasTraceArray: Array.isArray(globalWithTrace.__heroTooltipTrace__),
            traceLength: globalWithTrace.__heroTooltipTrace__?.length ?? 0
          }
        })

        expect(traceMetadata.hasTraceArray).toBe(true)
        expect(traceMetadata.traceLength).toBeGreaterThanOrEqual(0)
      } finally {
        await page.unroute(RESUME_ROUTE)
      }
    }, 40000)
  })
}
