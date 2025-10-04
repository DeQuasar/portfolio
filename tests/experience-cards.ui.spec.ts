import { describe, it, expect } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'
import { fileURLToPath } from 'node:url'
import type { Page } from 'playwright-core'

const rootDir = fileURLToPath(new URL('../', import.meta.url))

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
const TOOLKIT_VISIBLE_COUNT = 4

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

async function readToolkitState(page: Page, slug: string) {
  return page.evaluate(({ slug }) => {
    const card = document.querySelector<HTMLElement>(`#experience-${slug}`)
    if (!card) {
      throw new Error(`Unable to locate experience card for slug "${slug}"`)
    }

    const list = card.querySelector<HTMLElement>('[aria-label="Key tools and focus areas"]')
    if (!list) {
      return {
        visible: [],
        toggleLabel: null,
        hasToggle: false
      }
    }

    const pills = Array.from(list.querySelectorAll<HTMLElement>('span.uppercase')).map((node) => node.textContent?.trim()).filter(Boolean)
    const toggle = list.querySelector<HTMLButtonElement>('button')

    return {
      visible: pills,
      toggleLabel: toggle?.textContent?.trim() ?? null,
      hasToggle: Boolean(toggle)
    }
  }, { slug })
}

describeMaybe('[chromium] experience section', () => {
  it('only highlights the experience card closest to the viewport center', async () => {
    const page = await createPage('/')
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

  it('expands and collapses toolkit chips on demand', async () => {
    const page = await createPage('/')
    await page.locator(experienceCardSelector(EXPERIENCE_SLUGS.frontlineSupport)).waitFor({ state: 'visible' })

    await page.waitForSelector(`${experienceCardSelector(EXPERIENCE_SLUGS.frontlineSupport)} [aria-label="Key tools and focus areas"] button`, { state: 'visible' })

    const collapsed = await readToolkitState(page, EXPERIENCE_SLUGS.frontlineSupport)
    expect(collapsed.hasToggle).toBe(true)
    expect(collapsed.visible.length).toBe(TOOLKIT_VISIBLE_COUNT)
    expect(collapsed.toggleLabel).toMatch(/Show all/i)

    await page.locator(experienceCardSelector(EXPERIENCE_SLUGS.frontlineSupport)).getByRole('button', { name: /Show all/ }).click()
    const expanded = await readToolkitState(page, EXPERIENCE_SLUGS.frontlineSupport)
    expect(expanded.visible.length).toBeGreaterThan(collapsed.visible.length)
    expect(expanded.toggleLabel).toMatch(/Show fewer/i)

    await page.locator(experienceCardSelector(EXPERIENCE_SLUGS.frontlineSupport)).getByRole('button', { name: /Show fewer/ }).click()
    const reverted = await readToolkitState(page, EXPERIENCE_SLUGS.frontlineSupport)
    expect(reverted.visible.length).toBe(collapsed.visible.length)
    expect(reverted.toggleLabel).toMatch(/Show all/i)
  }, 15000)

  it('renders problem, contribution, and impact summaries for feature projects', async () => {
    const page = await createPage('/')
    const project = page.locator(experienceCardSelector(EXPERIENCE_SLUGS.frontlineSupport)).locator('[role="article"][aria-label="Portfolio support modernization project summary"]')
    await project.waitFor({ state: 'visible' })

    const facets = await project.evaluate((article) => {
      const headings = Array.from(article.querySelectorAll<HTMLElement>('p.uppercase'))
        .filter((node) => /^(problem|contribution|impact)$/i.test(node.textContent?.trim() ?? ''))

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
})
