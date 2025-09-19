import { describe, it, expect } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'
import { fileURLToPath } from 'node:url'

await setup({
  rootDir: fileURLToPath(new URL('../', import.meta.url))
})

describe('homepage content', () => {
  it('renders content sourced from @nuxt/content', async () => {
    const html = await $fetch('/')

    expect(html).toContain('Anthony Protano')
    expect(html).toContain('Experience')
    expect(html).toContain('Skill Stack')
    expect(html).toContain('Senior Software Developer')
  })
})
