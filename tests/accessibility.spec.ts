import { describe, it, expect } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'
import { JSDOM } from 'jsdom'
import axe from 'axe-core'
import { fileURLToPath } from 'node:url'

await setup({ rootDir: fileURLToPath(new URL('../', import.meta.url)) })

describe('homepage accessibility', () => {
  it('has no detectable a11y violations', async () => {
    const html = await $fetch('/')
    const dom = new JSDOM(html, {
      pretendToBeVisual: true,
      runScripts: 'outside-only'
    })
    const { window } = dom

    window.eval(axe.source)
    const axeInstance = (window as unknown as { axe: typeof axe }).axe

    const results = await axeInstance.run(window.document, {
      rules: {
        'color-contrast': { enabled: false }
      }
    })

    dom.window.close()

    const messages = results.violations.map((violation) => {
      const nodes = violation.nodes
        .map((node) => `  - ${node.html}`)
        .join('\n')
      return `${violation.id}: ${violation.help}\n${nodes}`
    })

    expect(results.violations, messages.join('\n\n')).toHaveLength(0)
  })
})
