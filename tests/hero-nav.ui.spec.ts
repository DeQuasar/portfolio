import { describe, it, expect } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'
import { setViewport } from './utils/viewport'
import { uiTestRootDir } from './utils/nuxt-root'
import { installClipboardStub } from './utils/clipboard'

const shouldRunBrowserTests = process.env.ENABLE_BROWSER_TESTS === 'true'
let hasPlaywright = shouldRunBrowserTests

if (shouldRunBrowserTests) {
  try {
    await import('playwright-core')
  } catch {
    hasPlaywright = false
    console.warn('Skipping hero navigation UI tests because playwright-core is not installed.')
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

describeMaybe('[chromium] hero sticky navigation', () => {
  it('reveals sticky nav on desktop with CTA cluster and hides mobile header', async () => {
    const page = await createPage('/')
    await setViewport(page, 'desktop')
    await page.reload()
    await page.waitForLoadState('networkidle')

    const stickyNav = page.locator('nav[aria-label="Primary navigation"]')
    expect(await stickyNav.isVisible()).toBe(false)

    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }))
    await stickyNav.waitFor({ state: 'visible', timeout: 5000 })

    expect(await stickyNav.getByRole('link', { name: /Download Résumé/i }).isVisible()).toBe(true)

    const mobileHeader = stickyNav.locator('div.sm\\:hidden')
    if (await mobileHeader.count() > 0) {
      const isVisible = await mobileHeader.evaluate((node) => {
        const style = window.getComputedStyle(node)
        return style.display !== 'none' && style.visibility !== 'hidden' && node.getClientRects().length > 0
      })
      expect(isVisible).toBe(false)
    }

    expect(await stickyNav.getByRole('button', { name: 'Toggle email options' }).isVisible()).toBe(true)
    expect(await stickyNav.getByRole('link', { name: 'GitHub' }).isVisible()).toBe(true)
    expect(await stickyNav.getByRole('link', { name: 'LinkedIn' }).isVisible()).toBe(true)
  }, 20000)

  it('anchors the email dropdown correctly on tablet and toggles closed', async () => {
    const page = await createPage('/')
    await setViewport(page, 'tablet')
    await page.reload()
    await page.waitForLoadState('networkidle')

    const stickyNav = page.locator('nav[aria-label="Primary navigation"]')
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }))
    await stickyNav.waitFor({ state: 'visible', timeout: 5000 })

    const toggleButton = stickyNav.getByRole('button', { name: 'Toggle email options' })
    await toggleButton.click()

    const panel = stickyNav.locator('div[role="group"][aria-label="Email options"]')
    await panel.first().waitFor({ state: 'visible', timeout: 3000 })

    const spacing = await page.evaluate(() => {
      const navEl = document.querySelector('nav[aria-label="Primary navigation"]')
      const panelEl = navEl?.querySelector('div[role="group"][aria-label="Email options"]')
      if (!(navEl instanceof HTMLElement) || !(panelEl instanceof HTMLElement)) {
        return null
      }
      const navRect = navEl.getBoundingClientRect()
      const panelRect = panelEl.getBoundingClientRect()
      return {
        gap: panelRect.top - navRect.bottom,
        rightAligned: panelRect.right <= navRect.right + 4
      }
    })

    expect(spacing).not.toBeNull()
    if (!spacing) {
      throw new Error('Unable to measure sticky nav email panel spacing')
    }

    expect(spacing.gap).toBeGreaterThanOrEqual(-40)
    expect(spacing.gap).toBeLessThanOrEqual(40)
    expect(spacing.rightAligned).toBe(true)

    await toggleButton.click()
    await panel.first().waitFor({ state: 'hidden', timeout: 3000 })
  }, 25000)

  it('surfaces the copy success tooltip when copying email from the sticky nav', async () => {
    const page = await createPage('/')
    await installClipboardStub(page)
    await setViewport(page, 'desktop')
    await page.waitForLoadState('networkidle')

    const clipboardSupport = await page.evaluate(() => ({
      hasClipboard: Boolean((navigator as typeof navigator & { clipboard?: { writeText?: unknown } }).clipboard),
      hasWriteText: typeof navigator.clipboard?.writeText === 'function'
    }))

    expect(clipboardSupport.hasClipboard).toBe(true)
    expect(clipboardSupport.hasWriteText).toBe(true)

    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }))
    const stickyNav = page.locator('nav[aria-label="Primary navigation"]')
    await stickyNav.waitFor({ state: 'visible', timeout: 5000 })

    const toggleButton = stickyNav.getByRole('button', { name: 'Toggle email options' })
    await toggleButton.click()

    const panel = stickyNav.locator('div[role="group"][aria-label="Email options"]').first()
    await panel.waitFor({ state: 'visible', timeout: 3000 })

    await panel.getByRole('button', { name: 'Copy email address' }).click()

    await page.waitForFunction(() => {
      const button = document.querySelector('nav[aria-label="Primary navigation"] button[aria-label="Toggle email options"]')
      return button?.getAttribute('data-copy-state') === 'copied'
    }, {}, { timeout: 5000 })

    const toggleState = await toggleButton.getAttribute('data-copy-state')
    expect(toggleState).toBe('copied')

    await panel.waitFor({ state: 'hidden', timeout: 3000 })
  }, 30000)
})
