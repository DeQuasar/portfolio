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
  it('exposes expected contact actions and attributes', async () => {
    const page = await createPage('/')
    const footer = page.locator('footer#contact')
    await footer.waitFor({ state: 'visible' })

    const email = footer.getByRole('link', { name: /^Email$/i })
    expect(await email.getAttribute('href')).toBe('mailto:tonypro999@gmail.com')

    const linkedin = footer.getByRole('link', { name: /^LinkedIn$/i })
    expect(await linkedin.getAttribute('href')).toBe('https://www.linkedin.com/in/anthony-protano/')
    expect(await linkedin.getAttribute('target')).toBe('_blank')
    expect(await linkedin.getAttribute('rel')).toContain('noopener')

    const github = footer.getByRole('link', { name: /^GitHub$/i })
    expect(await github.getAttribute('href')).toBe('https://github.com/dequasar')
    expect(await github.getAttribute('target')).toBe('_blank')
  }, 20000)
})
