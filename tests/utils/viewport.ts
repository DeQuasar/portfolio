import type { Page } from 'playwright-core'

export type ViewportPreset = 'mobile' | 'tablet' | 'desktop'

const VIEWPORTS: Record<ViewportPreset, { width: number; height: number }> = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 1024, height: 768 },
  desktop: { width: 1440, height: 900 }
}

export async function setViewport (page: Page, preset: ViewportPreset) {
  const viewport = VIEWPORTS[preset]
  await page.setViewportSize(viewport)
  await page.waitForFunction(({ width, height }) => {
    return window.innerWidth === width && window.innerHeight === height
  }, viewport)
}

export function getViewportSize (preset: ViewportPreset) {
  return VIEWPORTS[preset]
}
