import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const RESUME_ENDPOINT = '/download/resume'
const RESUME_ROUTE = '**/download/resume'
const RESUME_FIXTURE = readFileSync(join(process.cwd(), 'public', 'resume.pdf'))

async function gotoHome (page: Page) {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
}

test.describe('homepage (desktop & mobile)', () => {
  test('renders hero content and primary CTA', async ({ page }) => {
    await gotoHome(page)

    await expect(page.getByRole('heading', { name: /Anthony Protano/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Senior Software Developer/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Download Résumé/i })).toBeVisible()
  })

  test('streams résumé download with correct headers', async ({ page }) => {
    await gotoHome(page)

    await page.route(RESUME_ROUTE, async (route) => {
      await route.fulfill({
        status: 200,
        body: RESUME_FIXTURE,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Anthony-Protano-Resume.pdf"',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          'Content-Length': String(RESUME_FIXTURE.length)
        }
      })
    })

    try {
      const downloadRequest = page.waitForResponse((response) => {
        return response.url().includes(RESUME_ENDPOINT) && response.status() === 200
      })

      await page.getByRole('link', { name: /Download Résumé/i }).click()
      const response = await downloadRequest

      expect(response.headers()['content-type']).toContain('application/pdf')
      expect(response.headers()['content-disposition']).toContain('Anthony-Protano-Resume.pdf')
    } finally {
      await page.unroute(RESUME_ROUTE)
    }
  })

  test('meets axe accessibility expectations', async ({ page }) => {
    await gotoHome(page)

    const axe = new AxeBuilder({ page })
      .exclude('iframe')

    const results = await axe.analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })
})

test.describe('mobile layout specifics', () => {
  test('sticky navigation remains accessible after scroll and layout avoids horizontal overflow', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('mobile'), 'Mobile project only')

    await gotoHome(page)

    const stickyNav = page.locator('nav[aria-label="Primary navigation"]')
    await page.mouse.wheel(0, 900)
    await expect(stickyNav).toBeVisible()

    const resumeCta = stickyNav.getByRole('link', { name: /Download Résumé/i })
    await expect(resumeCta).toBeVisible()

    const layoutMetrics = await page.evaluate(() => {
      return {
        scrollWidth: document.body.scrollWidth,
        viewportWidth: document.documentElement.clientWidth
      }
    })

    expect(layoutMetrics.scrollWidth).toBeLessThanOrEqual(layoutMetrics.viewportWidth + 2)
  })
})
