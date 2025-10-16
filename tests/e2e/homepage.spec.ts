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

  test('desktop view profile CTA scrolls to experience without hiding hero summary', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('desktop'), 'Desktop project only')

    await gotoHome(page)

    const heroSummary = page.getByText(/Senior software developer with 6\+ years of experience/i).first()
    await expect(heroSummary).toBeVisible()

    const quickNav = page.locator('nav[aria-label="Section quick navigation"]')
    await expect(quickNav).toBeHidden()

    await page.getByRole('link', { name: /View profile/i }).click()
    await expect(page.locator('#experience')).toBeVisible()

    await expect(heroSummary).toBeVisible()
  })

  test('footer contact actions render expected links', async ({ page }) => {
    await gotoHome(page)

    const footer = page.locator('footer#contact')
    await footer.scrollIntoViewIfNeeded()

    await expect(footer.getByRole('link', { name: 'Email' })).toHaveAttribute('href', /mailto:tonypro999@gmail\.com/i)
    await expect(footer.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', /linkedin\.com/i)
    await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', /github\.com\/dequasar/i)
  })

  test('streams résumé download with correct headers', async ({ page }) => {
    await gotoHome(page)

    await page.route(RESUME_ROUTE, async (route) => {
      await route.fulfill({
        status: 200,
        body: RESUME_FIXTURE,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="Anthony-Protano-Resume.pdf"',
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
      expect(response.headers()['content-disposition']).toContain('inline')
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

  test('section quick nav is visible only on mobile', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('mobile'), 'Mobile project only')

    await gotoHome(page)

    const quickNav = page.locator('nav[aria-label="Section quick navigation"]')
    await expect(quickNav).toBeVisible()
    await expect(quickNav.getByRole('link', { name: 'Experience' })).toBeVisible()
  })
})

test.describe('mobile layout specifics', () => {
  test('hero surfaces summary with expandable toggle', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('mobile'), 'Mobile project only')

    await gotoHome(page)

    const introLine = page.getByTestId('hero-mobile-summary-text')
    await expect(introLine).toBeVisible()

    const toggleButton = page.getByRole('button', { name: /show full summary/i })
    await expect(toggleButton).toBeVisible()

    await toggleButton.click()

    await expect(page.getByRole('button', { name: /show less/i })).toBeVisible()
    await expect(page.getByTestId('hero-mobile-summary-text')).toContainText(/Experienced with CI\/CD pipelines/i)
  })

  test('sticky navigation remains accessible after scroll and layout avoids horizontal overflow', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('mobile'), 'Mobile project only')

    await gotoHome(page)

    const stickyNav = page.locator('nav[aria-label="Primary navigation"]')
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }))
    await expect(stickyNav).toBeVisible()

    const resumeCta = stickyNav.getByRole('link', { name: /Download Résumé/i })
    await expect(resumeCta).toBeVisible()

    const layoutMetrics = await page.evaluate(() => {
      const mainEl = document.querySelector('main')
      const scrollWidth = mainEl ? mainEl.scrollWidth : document.body.scrollWidth
      const viewportWidth = document.documentElement.clientWidth
      window.scrollTo(scrollWidth, window.scrollY)
      const horizontalOffset = window.scrollX
      window.scrollTo(0, window.scrollY)
      return {
        scrollWidth,
        viewportWidth,
        horizontalOffset
      }
    })

    expect(layoutMetrics.horizontalOffset).toBe(0)
    expect(layoutMetrics.scrollWidth).toBeLessThanOrEqual(layoutMetrics.viewportWidth + 120)
  })
})
