import { describe, it, expect } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'
import { fileURLToPath } from 'node:url'

const shouldRun = process.env.ENABLE_BROWSER_TESTS !== 'false'

if (shouldRun) {
  await setup({
    rootDir: fileURLToPath(new URL('../', import.meta.url))
  })
}

(shouldRun ? describe : describe.skip)('hero visual regression', () => {
  it('does not reintroduce the thin top highlight seam', async () => {
    const html = await $fetch('/')

    const heroMatch = html.match(/<section[^>]*rounded-\[2\.2rem\][^>]*>[\s\S]*?<\/section>/)
    const heroSectionMarkup = heroMatch?.[0] ?? ''

    expect(heroSectionMarkup).not.toContain('h-[2px]')
    expect(heroSectionMarkup).not.toContain('shadow-[0_0_0_1px]')
    expect(heroSectionMarkup).not.toContain('shadow-[0_0_0_2px]')
    expect(heroSectionMarkup).not.toContain('mix-blend-screen')
  })
})
