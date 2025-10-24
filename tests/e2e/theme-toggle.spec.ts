import { expect, test, type Page } from '@playwright/test'

const gotoHome = async (page: Page) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
}

const readThemeDataset = async (page: Page) => {
  return page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    preference: document.documentElement.dataset.themePreference,
    resolved: document.documentElement.dataset.themeResolved
  }))
}

test.describe('Theme toggle', () => {
  test('system preference resolved to dark switches to light on first click', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('desktop'), 'Desktop toggle only')
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.addInitScript(() => {
      window.localStorage.setItem('theme-preference', 'system')
    })

    await gotoHome(page)

    const before = await readThemeDataset(page)
    expect(before.preference).toBe('system')
    expect(before.resolved).toBe('dark')

    await page.locator('[data-state]:visible').first().click()

    const after = await readThemeDataset(page)
    expect(after.preference).toBe('light')
    expect(after.theme).toBe('light')
    expect(after.resolved).toBe('light')
  })

  test('explicit dark preference cycles to light', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('desktop'), 'Desktop toggle only')
    await page.addInitScript(() => {
      window.localStorage.setItem('theme-preference', 'dark')
    })

    await gotoHome(page)

    const before = await readThemeDataset(page)
    expect(before.preference).toBe('dark')
    expect(before.resolved).toBe('dark')

    await page.locator('[data-state]:visible').first().click()

    const after = await readThemeDataset(page)
    expect(after.preference).toBe('light')
    expect(after.theme).toBe('light')
    expect(after.resolved).toBe('light')
  })

  test('explicit light preference cycles back to system', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('desktop'), 'Desktop toggle only')
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.addInitScript(() => {
      window.localStorage.setItem('theme-preference', 'light')
    })

    await gotoHome(page)

    const before = await readThemeDataset(page)
    expect(before.preference).toBe('light')
    expect(before.resolved).toBe('light')

    await page.locator('[data-state]:visible').first().click()

    const after = await readThemeDataset(page)
    expect(after.preference).toBe('system')
    expect(after.theme).toBe('dark')
    expect(after.resolved).toBe('dark')
  })
})
