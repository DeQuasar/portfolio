import { describe, it, expect } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'
import { fileURLToPath } from 'node:url'
import { setViewport } from './utils/viewport'

const rootDir = fileURLToPath(new URL('../', import.meta.url))

const shouldRunBrowserTests = process.env.ENABLE_BROWSER_TESTS === 'true'
let hasPlaywright = shouldRunBrowserTests

if (shouldRunBrowserTests) {
  try {
    await import('playwright-core')
  } catch {
    hasPlaywright = false
    console.warn('Skipping skill stack UI tests because playwright-core is not installed.')
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

const MOBILE_LIMIT = 5

async function readAdditionalTools(section: import('playwright-core').Locator) {
  return section.evaluate((node) => {
    const grid = node.querySelector('div.grid')
    const items = grid
      ? Array.from(grid.querySelectorAll<HTMLElement>('span.inline-flex, li'))
      : []
    const visible = items.filter((item) => {
      const style = window.getComputedStyle(item)
      return style.display !== 'none' && style.visibility !== 'hidden' && item.getClientRects().length > 0
    })
    const toggle = node.querySelector<HTMLButtonElement>('button')
    return {
      visibleCount: visible.length,
      totalCount: items.length,
      hasToggle: Boolean(toggle),
      toggleLabel: toggle?.textContent?.trim() ?? null
    }
  })
}

async function readCategoryState(card: import('playwright-core').Locator) {
  return card.evaluate((node) => {
    const list = node.querySelector('ul')
    const items = list
      ? Array.from(list.querySelectorAll<HTMLLIElement>('li'))
      : []
    const visible = items.filter((item) => {
      const style = window.getComputedStyle(item)
      return style.display !== 'none' && style.visibility !== 'hidden' && item.getClientRects().length > 0
    })
    const toggle = node.querySelector<HTMLButtonElement>('button')
    return {
      visibleCount: visible.length,
      totalCount: items.length,
      hasToggle: Boolean(toggle),
      toggleLabel: toggle?.textContent?.trim() ?? null
    }
  })
}

describeMaybe('[chromium] skill stack (mobile)', () => {
  it('collapses Additional Tools to five items on mobile with a show more toggle', async () => {
    const page = await createPage('/')
    await setViewport(page, 'mobile')
    await page.reload()
    await page.waitForLoadState('networkidle')

    const additionalSection = page.locator('div.flex.flex-col.gap-3:has-text("Additional Tools")').first()
    const sectionCount = await additionalSection.count()
    if (sectionCount === 0) {
      // No additional tools section rendered - all skills are in core/supporting categories
      return
    }
    await additionalSection.waitFor({ state: 'visible' })

    const collapsed = await readAdditionalTools(additionalSection)
    if (!collapsed.hasToggle) {
      expect(collapsed.totalCount).toBeLessThanOrEqual(MOBILE_LIMIT)
      expect(collapsed.visibleCount).toBe(collapsed.totalCount)
      return
    }

    expect(collapsed.visibleCount).toBeLessThanOrEqual(MOBILE_LIMIT)
    expect(collapsed.hasToggle).toBe(true)
    expect(collapsed.toggleLabel).toMatch(/Show more tools/i)

    await additionalSection.locator('button').first().click()

    const expanded = await readAdditionalTools(additionalSection)
    expect(expanded.visibleCount).toBe(expanded.totalCount)
    expect(expanded.visibleCount).toBeGreaterThan(collapsed.visibleCount)
    expect(expanded.toggleLabel).toMatch(/Show fewer tools/i)

    await additionalSection.locator('button').first().click()

    const reverted = await readAdditionalTools(additionalSection)
    expect(reverted.visibleCount).toBe(collapsed.visibleCount)
    expect(reverted.toggleLabel).toMatch(/Show more tools/i)
  }, 20000)

  it('collapses long skill category lists behind a mobile toggle', async () => {
    const page = await createPage('/')
    await setViewport(page, 'mobile')
    await page.reload()
    await page.waitForLoadState('networkidle')

    const categoryCard = page.locator('article.flex.h-full.flex-col:has(h3:has-text("Product Engineering"))').first()
    await categoryCard.waitFor({ state: 'visible' })

    const collapsed = await readCategoryState(categoryCard)
    if (!collapsed.hasToggle) {
      expect(collapsed.totalCount).toBeLessThanOrEqual(MOBILE_LIMIT)
      expect(collapsed.visibleCount).toBe(collapsed.totalCount)
      return
    }

    expect(collapsed.visibleCount).toBeLessThanOrEqual(MOBILE_LIMIT)
    expect(collapsed.hasToggle).toBe(true)
    expect(collapsed.toggleLabel).toMatch(/Show more/i)

    await categoryCard.locator('button').first().click()

    const expanded = await readCategoryState(categoryCard)
    expect(expanded.visibleCount).toBe(expanded.totalCount)
    expect(expanded.visibleCount).toBeGreaterThan(collapsed.visibleCount)
    expect(expanded.toggleLabel).toMatch(/Show fewer/i)

    await categoryCard.locator('button').first().click()

    const reverted = await readCategoryState(categoryCard)
    expect(reverted.visibleCount).toBe(collapsed.visibleCount)
    expect(reverted.toggleLabel).toMatch(/Show more/i)
  }, 20000)
})

describeMaybe('[chromium] skill stack (desktop & tablet)', () => {
  it('shows the full Additional Tools list with no toggle on desktop', async () => {
    const page = await createPage('/')
    await setViewport(page, 'desktop')
    await page.reload()
    await page.waitForLoadState('networkidle')

    const additionalSection = page.locator('div.flex.flex-col.gap-3:has-text("Additional Tools")').first()
    const sectionCount = await additionalSection.count()
    if (sectionCount === 0) {
      // No additional tools section rendered - all skills are in core/supporting categories
      return
    }
    await additionalSection.waitFor({ state: 'visible' })

    const desktopLayout = await additionalSection.evaluate((node) => {
      const container = node.querySelector('div.grid')
      const computed = container ? window.getComputedStyle(container) : null
      const pills = Array.from(node.querySelectorAll<HTMLElement>('span.inline-flex, li'))
      return {
        display: computed?.display ?? null,
        visibleCount: pills.filter((pill) => {
          const style = window.getComputedStyle(pill)
          return style.display !== 'none' && style.visibility !== 'hidden' && pill.getClientRects().length > 0
        }).length,
        totalCount: pills.length,
        toggleCount: node.querySelectorAll('button').length
      }
    })

    expect(desktopLayout?.display).toBe('flex')
    expect(desktopLayout?.totalCount).toBeGreaterThan(5)
    expect(desktopLayout?.visibleCount).toBe(desktopLayout?.totalCount)
    expect(desktopLayout?.toggleCount).toBe(0)
  }, 20000)

  it('wraps toolkit pills without toggles on tablet view', async () => {
    const page = await createPage('/')
    await setViewport(page, 'tablet')
    await page.reload()
    await page.waitForLoadState('networkidle')

    const categoryCard = page.locator('article.flex.h-full.flex-col:has(h3:has-text("Product Engineering"))').first()
    await categoryCard.waitFor({ state: 'visible' })

    const state = await categoryCard.evaluate((node) => {
      const list = node.querySelector('ul')
      const computed = list ? window.getComputedStyle(list) : null
      return {
        display: computed?.display ?? null,
        hasToggle: Boolean(node.querySelector('button')),
        wrap: computed?.flexWrap ?? null
      }
    })

    expect(state?.display).toBe('flex')
    expect(state?.hasToggle).toBe(false)
    expect(state?.wrap).toBe('wrap')
  }, 20000)
})
