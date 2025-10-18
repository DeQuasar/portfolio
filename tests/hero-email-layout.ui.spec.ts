import { describe, it, expect } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'
import type { Page } from 'playwright-core'
import { uiTestRootDir } from './utils/nuxt-root'

const shouldRunBrowserTests = process.env.ENABLE_BROWSER_TESTS === 'true'
let hasPlaywright = shouldRunBrowserTests

if (shouldRunBrowserTests) {
  try {
    await import('playwright-core')
  } catch {
    hasPlaywright = false
    console.warn('Skipping hero email layout UI tests because playwright-core is not installed.')
  }
}

if (hasPlaywright) {
  await setup({
    rootDir: uiTestRootDir,
    browser: true,
    browserOptions: { type: 'chromium' }
  })
}

const describeMaybe = hasPlaywright ? describe : describe.skip

const WIDTH_TOLERANCE = 1.2
const CENTER_TOLERANCE = 1.2

const measureBox = async (locator: import('playwright-core').Locator) => {
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error('Failed to get bounding box for hero socials root')
  }
  return {
    width: box.width,
    center: box.x + box.width / 2
  }
}

async function setMobileViewport(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForFunction(() => window.innerWidth < 640)
}

describeMaybe('[chromium] hero email layout', () => {
  it('keeps the hero socials root width and center stable when toggling email options', async () => {
    const page = await createPage('/')
    const root = page.locator('[data-testid="hero-socials-root"]')

    await root.waitFor({ state: 'visible' })

    const idle = await measureBox(root)

    await page.getByRole('button', { name: 'View email options' }).click()
    await page.getByRole('group', { name: 'Email options' }).waitFor({ state: 'visible', timeout: 2000 })
    await page.waitForTimeout(150)

    const active = await measureBox(root)

    await page.getByRole('button', { name: 'Close email options' }).click()
    await page.getByRole('group', { name: 'Email options' }).waitFor({ state: 'hidden', timeout: 2000 })
    await page.waitForTimeout(150)

    const reset = await measureBox(root)

    expect(Math.abs(active.width - idle.width)).toBeLessThanOrEqual(WIDTH_TOLERANCE)
    expect(Math.abs(active.center - idle.center)).toBeLessThanOrEqual(CENTER_TOLERANCE)

    expect(Math.abs(reset.width - idle.width)).toBeLessThanOrEqual(WIDTH_TOLERANCE)
    expect(Math.abs(reset.center - idle.center)).toBeLessThanOrEqual(CENTER_TOLERANCE)
  }, 20000)

  it('positions the sticky nav email panel below the nav and toggles closed on repeat taps', async () => {
    const page = await createPage('/')
    await setMobileViewport(page)

    await page.evaluate(() => {
      window.scrollTo({ top: 900, behavior: 'instant' })
    })

    const nav = page.locator('nav[aria-label="Primary navigation"]')
    await nav.waitFor({ state: 'visible', timeout: 8000 })

    const toggleButton = nav.getByRole('button', { name: 'Toggle email options' })
    await toggleButton.click()

    const panel = nav.locator('div[role="group"][aria-label="Email options"]').first()
    await panel.waitFor({ state: 'attached', timeout: 4000 })
    await page.waitForFunction(() => {
      const navEl = document.querySelector('nav[aria-label="Primary navigation"]')
      const panelEl = navEl?.querySelector('div[role="group"][aria-label="Email options"]')
      if (!(panelEl instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(panelEl)
      return style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0'
    }, { timeout: 4000 })

    const spacing = await page.evaluate(() => {
      const navEl = document.querySelector('nav[aria-label="Primary navigation"]')
      const panelEl = navEl?.querySelector('div[role="group"][aria-label="Email options"]')
      if (!(navEl instanceof HTMLElement) || !(panelEl instanceof HTMLElement)) {
        return null
      }
      const navRect = navEl.getBoundingClientRect()
      const panelRect = panelEl.getBoundingClientRect()
      return {
        gap: panelRect.top - navRect.bottom
      }
    })

    expect(spacing).not.toBeNull()
    if (!spacing) {
      throw new Error('Unable to measure sticky nav email panel spacing')
    }

    expect(spacing.gap).toBeGreaterThanOrEqual(-90)
    expect(spacing.gap).toBeLessThanOrEqual(30)

    await toggleButton.click()
    await page.waitForFunction(() => {
      const navEl = document.querySelector('nav[aria-label="Primary navigation"]')
      const panelEl = navEl?.querySelector('div[role="group"][aria-label="Email options"]')
      if (!(panelEl instanceof HTMLElement)) {
        return true
      }
      const style = window.getComputedStyle(panelEl)
      return style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0'
    }, { timeout: 3000 })
  }, 25000)
})
