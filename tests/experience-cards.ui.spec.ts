import { describe, it, expect } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'
import type { Page } from 'playwright-core'
import { setViewport } from './utils/viewport'
import { uiTestRootDir } from './utils/nuxt-root'

const rootDir = uiTestRootDir

const shouldRunBrowserTests = process.env.ENABLE_BROWSER_TESTS === 'true'
let hasPlaywright = shouldRunBrowserTests

if (shouldRunBrowserTests) {
  try {
    await import('playwright-core')
  } catch {
    hasPlaywright = false
    console.warn('Skipping experience UI tests because playwright-core is not installed.')
  }
}

if (hasPlaywright) {
  await setup({
    rootDir,
    browser: true,
    browserOptions: { type: 'chromium' }
  })
}

const describeMaybe = hasPlaywright ? describe : describe.skip

const EXPERIENCE_CARD_SELECTOR = '[id^="experience-"]'

const ACTIVE_GLOW_VALUE = 'rgba(32, 198, 140, 0.82)'

const EXPERIENCE_SLUGS = {
  frontlineSupport: 'clevyr-2023',
  leasecakeDashboard: 'leasecake',
  virtualEvent: 'clevyr-2020'
} as const

const experienceCardId = (slug: string) => `experience-${slug}`
const experienceCardSelector = (slug: string) => `#${experienceCardId(slug)}`

async function getActiveExperienceIds(page: Page) {
  return page.evaluate(({ selector, glowValue }) => {
    return Array.from(document.querySelectorAll<HTMLElement>(selector))
      .filter((card) => getComputedStyle(card).getPropertyValue('--card-glow').includes(glowValue))
      .map((card) => card.id)
  }, { selector: EXPERIENCE_CARD_SELECTOR, glowValue: ACTIVE_GLOW_VALUE })
}

async function waitForActiveExperience(page: Page, expectedId: string) {
  await page.waitForFunction(({ selector, glowValue, expected }) => {
    const active = Array.from(document.querySelectorAll<HTMLElement>(selector))
      .filter((card) => getComputedStyle(card).getPropertyValue('--card-glow').includes(glowValue))
      .map((card) => card.id)

    return active.length === 1 && active[0] === expected
  }, { selector: EXPERIENCE_CARD_SELECTOR, glowValue: ACTIVE_GLOW_VALUE, expected: expectedId })
}

describeMaybe('[chromium] experience section', () => {
  it('only highlights the experience card closest to the viewport center', async () => {
    const page = await createPage('/')
    await setViewport(page, 'desktop')
    await page.reload()
    await page.waitForLoadState('networkidle')
    const cards = page.locator(EXPERIENCE_CARD_SELECTOR)
    await cards.first().waitFor({ state: 'visible' })

    await waitForActiveExperience(page, experienceCardId(EXPERIENCE_SLUGS.frontlineSupport))

    await cards.nth(1).scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    await waitForActiveExperience(page, experienceCardId(EXPERIENCE_SLUGS.leasecakeDashboard))

    await cards.nth(2).scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    await waitForActiveExperience(page, experienceCardId(EXPERIENCE_SLUGS.virtualEvent))

    const activeIds = await getActiveExperienceIds(page)
    expect(activeIds.length).toBe(1)
  }, 20000)

  it('renders problem, contribution, and impact summaries for feature projects', async () => {
    const page = await createPage('/')
    await setViewport(page, 'desktop')
    await page.reload()
    await page.waitForLoadState('networkidle')
    const project = page.locator(experienceCardSelector(EXPERIENCE_SLUGS.frontlineSupport)).locator('[role="article"][aria-label="Portfolio support modernization project summary"]')
    await project.waitFor({ state: 'visible' })

    const facets = await project.evaluate((article) => {
      const desktopBlock = article.querySelector<HTMLElement>('div.mt-6.space-y-5')
      const container = desktopBlock ?? article
      const headings = Array.from(container.querySelectorAll<HTMLElement>('p.uppercase'))
        .filter((node) => /^(problem|contribution|impact)$/i.test(node.textContent?.trim() ?? ''))
        .slice(0, 3)

      return headings.map((heading) => {
        const body = heading.nextElementSibling as HTMLElement | null
        return {
          heading: heading.textContent?.trim() ?? '',
          body: body?.textContent?.trim() ?? ''
        }
      })
    })

    expect(facets.map((facet) => facet.heading)).toEqual([
      'Problem',
      'Contribution',
      'Impact'
    ])

    facets.forEach((facet) => {
      expect(facet.body.length).toBeGreaterThan(0)
    })
  }, 10000)

  it('exposes project impact details via a mobile summary toggle with caret indicator', async () => {
    const page = await createPage('/')
    await setViewport(page, 'mobile')
    await page.reload()
    await page.waitForLoadState('networkidle')

    const detailsSelector = `${experienceCardSelector(EXPERIENCE_SLUGS.frontlineSupport)} details`
    const summarySelector = `${detailsSelector} summary`

    await page.waitForSelector(summarySelector, { state: 'visible' })

    const caretInfo = await page.evaluate((selector) => {
      const summary = document.querySelector(selector)
      if (!(summary instanceof HTMLElement)) {
        return { hasCaret: false, initiallyOpen: null as boolean | null }
      }
      const caret = summary.querySelector('svg')
      const details = summary.closest('details')
      return {
        hasCaret: Boolean(caret),
        initiallyOpen: details instanceof HTMLDetailsElement ? details.open : null
      }
    }, summarySelector)

    expect(caretInfo.hasCaret).toBe(true)
    expect(caretInfo.initiallyOpen).toBe(false)

    await page.click(summarySelector)
    await page.waitForFunction((selector) => {
      const details = document.querySelector(selector)
      return details instanceof HTMLDetailsElement && details.open
    }, detailsSelector)

    const openState = await page.evaluate((selector) => {
      const details = document.querySelector(selector)
      return details instanceof HTMLDetailsElement ? details.open : null
    }, detailsSelector)
    expect(openState).toBe(true)

    await page.click(summarySelector)
    await page.waitForFunction((selector) => {
      const details = document.querySelector(selector)
      return details instanceof HTMLDetailsElement && !details.open
    }, detailsSelector)

    const finalState = await page.evaluate((selector) => {
      const details = document.querySelector(selector)
      return details instanceof HTMLDetailsElement ? details.open : null
    }, detailsSelector)
    expect(finalState).toBe(false)
  }, 15000)

  it('hides the mobile project accordion on tablet view while keeping content accessible', async () => {
    const page = await createPage('/')
    await setViewport(page, 'tablet')
    await page.reload()
    await page.waitForLoadState('networkidle')

    const detailsLocator = page.locator(`${experienceCardSelector(EXPERIENCE_SLUGS.frontlineSupport)} details`)
    expect(await detailsLocator.count()).toBeGreaterThan(0)

    const isVisible = await detailsLocator.evaluateAll((nodes) => {
      return nodes.some((node) => {
        const style = window.getComputedStyle(node)
        return style.display !== 'none' && style.visibility !== 'hidden' && node.getClientRects().length > 0
      })
    })

    expect(isVisible).toBe(false)

    const desktopFacetsVisible = await page.evaluate((selector) => {
      const article = document.querySelector(selector)
      if (!(article instanceof HTMLElement)) {
        return false
      }
      const desktopBlock = article.querySelector<HTMLElement>('div.mt-6.space-y-5')
      if (!desktopBlock) {
        return false
      }
      const style = window.getComputedStyle(desktopBlock)
      return style.display !== 'none' && desktopBlock.getClientRects().length > 0
    }, experienceCardSelector(EXPERIENCE_SLUGS.frontlineSupport))

    expect(desktopFacetsVisible).toBe(true)
  }, 15000)
})
