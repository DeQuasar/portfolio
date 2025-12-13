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
    console.warn('Skipping hero layout spacing UI tests because playwright-core is not installed.')
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

const DESKTOP_VIEWPORT = { width: 1280, height: 900 }
const MOBILE_VIEWPORT = { width: 390, height: 844 }

const pxValue = (value: string) => Number.parseFloat(value.replace('px', ''))

describeMaybe('[chromium] hero layout spacing', () => {
  it('maintains hero container, card padding, and section spacing on desktop', async () => {
    const page = await createPage('/')
    await page.setViewportSize(DESKTOP_VIEWPORT)

    const heroSection = page.locator('[data-testid="hero-section"]')
    await heroSection.waitFor({ state: 'visible' })

    const padding = await heroSection.evaluate((el) => {
      const styles = getComputedStyle(el)
      return {
        paddingTop: styles.paddingTop,
        paddingRight: styles.paddingRight,
        paddingBottom: styles.paddingBottom,
        paddingLeft: styles.paddingLeft
      }
    })

    const paddingLeft = pxValue(padding.paddingLeft)
    const paddingRight = pxValue(padding.paddingRight)
    const paddingTop = pxValue(padding.paddingTop)
    const paddingBottom = pxValue(padding.paddingBottom)

    expect(paddingLeft).toBeCloseTo(40, 0)
    expect(paddingRight).toBeCloseTo(40, 0)
    expect(paddingTop).toBeGreaterThanOrEqual(52)
    expect(paddingTop).toBeLessThanOrEqual(60)
    expect(paddingBottom).toBeGreaterThanOrEqual(48)
    expect(paddingBottom).toBeLessThanOrEqual(56)

    const heroCard = page.locator('[data-testid="hero-primary-content"]')
    await heroCard.waitFor({ state: 'visible' })
    const cardPadding = await heroCard.evaluate((el) => {
      const styles = getComputedStyle(el)
      return {
        paddingTop: styles.paddingTop,
        paddingRight: styles.paddingRight,
        paddingBottom: styles.paddingBottom,
        paddingLeft: styles.paddingLeft
      }
    })

    expect(pxValue(cardPadding.paddingLeft)).toBeCloseTo(40, 0)
    expect(pxValue(cardPadding.paddingRight)).toBeCloseTo(40, 0)
    expect(pxValue(cardPadding.paddingTop)).toBeCloseTo(40, 0)
    expect(pxValue(cardPadding.paddingBottom)).toBeCloseTo(40, 0)

    const heroBox = await heroSection.boundingBox()
    const experienceSection = page.locator('#experience')
    await experienceSection.waitFor({ state: 'visible' })
    const experienceBox = await experienceSection.boundingBox()

    if (!heroBox || !experienceBox) {
      throw new Error('Failed to collect layout boxes for hero or experience section')
    }

    const verticalGap = experienceBox.y - (heroBox.y + heroBox.height)
    expect(verticalGap).toBeGreaterThanOrEqual(60)
    expect(verticalGap).toBeLessThanOrEqual(68)
  }, 20000)

  it('preserves mobile skill stack toggle touch targets', async () => {
    const page = await createPage('/')
    await page.setViewportSize(MOBILE_VIEWPORT)
    await page.waitForFunction(() => window.innerWidth < 640)
    await page.waitForLoadState('networkidle')

    const showMoreButton = page.getByRole('button', { name: /show more tools/i })
    const buttonCount = await showMoreButton.count()
    if (buttonCount === 0) {
      // No overflow button rendered - not enough additional skills to trigger toggle
      return
    }

    const buttonHeight = await showMoreButton.evaluate((el) => el.getBoundingClientRect().height)
    expect(buttonHeight).toBeGreaterThanOrEqual(44)
  }, 20000)
})
