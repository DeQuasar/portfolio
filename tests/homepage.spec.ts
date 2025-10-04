import { describe, it, expect } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'
import { fileURLToPath } from 'node:url'

const shouldRun = process.env.ENABLE_BROWSER_TESTS !== 'false'

if (shouldRun) {
  await setup({
    rootDir: fileURLToPath(new URL('../', import.meta.url))
  })
}

(shouldRun ? describe : describe.skip)('homepage content', () => {
  it('renders content sourced from @nuxt/content', async () => {
    const html = await $fetch('/')

    expect(html).toContain('Anthony Protano')
    expect(html).toContain('Experience')
    expect(html).toContain('Skills &amp; Tools')
    expect(html).toContain('Senior Software Developer')
  })
})
