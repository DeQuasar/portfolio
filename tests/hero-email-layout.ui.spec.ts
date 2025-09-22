import { describe, it, expect } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils'
import { fileURLToPath } from 'node:url'

let hasPlaywright = true

try {
  await import('playwright-core')
} catch {
  hasPlaywright = false
  console.warn('Skipping hero email layout UI tests because playwright-core is not installed.')
}

if (hasPlaywright) {
  await setup({
    rootDir: fileURLToPath(new URL('../', import.meta.url)),
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
})
