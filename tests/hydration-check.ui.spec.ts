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
    console.warn('Skipping hydration check UI test because playwright-core is not installed.')
  }
}

const contentDbPath = `/tmp/nuxt-content-hydration-${process.pid}.sqlite`

if (hasPlaywright) {
  await setup({
    rootDir: uiTestRootDir,
    browser: true,
    browserOptions: { type: 'chromium' },
    nuxtConfig: {
      content: {
        _localDatabase: {
          type: 'sqlite',
          filename: contentDbPath
        }
      }
    }
  })
}

const describeMaybe = hasPlaywright ? describe : describe.skip

describeMaybe('[chromium] hydration warnings', () => {
  it('does not emit hydration warnings on the home page', async () => {
    const page = await createPage('/')
    const hydrationWarnings: string[] = []

    page.on('console', (message) => {
      if (message.type() === 'warning' && /hydration/i.test(message.text())) {
        hydrationWarnings.push(message.text())
      }
    })

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    expect(hydrationWarnings).toHaveLength(0)

    await page.close()
  }, 25000)
})
