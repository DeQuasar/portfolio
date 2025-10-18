import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function gotoHome (page: Page) {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
}

test.describe('accessibility audits', () => {
  test('home page passes axe checks', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('desktop'), 'Run axe audit on desktop viewport only')

    await gotoHome(page)

    const axeResults = await new AxeBuilder({ page })
      .exclude('iframe')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(axeResults.violations, JSON.stringify(axeResults.violations, null, 2)).toEqual([])
  })
})
