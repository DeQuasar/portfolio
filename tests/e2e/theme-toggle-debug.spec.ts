import { expect, test } from '@playwright/test'

const gotoHome = async (page: any) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
}

test.describe('theme toggle debug', () => {
  test('clicking once updates root dataset to light', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('theme-preference', 'dark')
    })

    await gotoHome(page)

    const before = await page.evaluate(() => ({
      theme: document.documentElement.dataset.theme,
      preference: document.documentElement.dataset.themePreference,
      resolved: document.documentElement.dataset.themeResolved
    }))
    console.log('dataset before click', before)

    expect(before.theme).toBe('dark')

    const toggle = page.locator('[data-state]').first()
    await toggle.click()

    const after = await page.evaluate(() => ({
      theme: document.documentElement.dataset.theme,
      preference: document.documentElement.dataset.themePreference,
      resolved: document.documentElement.dataset.themeResolved
    }))
    console.log('dataset after click', after)

    expect(after.theme).toBe('light')
    expect(after.resolved).toBe('light')
    expect(after.preference).toBe('light')
  })
})
