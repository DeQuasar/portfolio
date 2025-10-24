import { describe, it, expect } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'
import { uiTestRootDir } from './utils/nuxt-root'

const shouldRunBrowserTests = process.env.ENABLE_BROWSER_TESTS === 'true'
let hasPlaywright = shouldRunBrowserTests

if (shouldRunBrowserTests) {
  try {
    await import('playwright-core')
  } catch {
    hasPlaywright = false
    console.warn('Skipping footer UI tests because playwright-core is not installed.')
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

describeMaybe('[chromium] footer contact', () => {
  it('renders legal notice without actionable links', async () => {
    const page = await createPage('/')
    const footer = page.locator('footer#contact')
    await footer.waitFor({ state: 'visible' })

    expect(await footer.getByRole('link').count()).toBe(0)
    const footerText = await footer.textContent()
    expect(footerText).toMatch(/© \d{4} Anthony Protano/i)
  }, 20000)
})
