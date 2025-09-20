import { describe, it, expect } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'
import { JSDOM } from 'jsdom'
import axe, { type RunOptions, type AxeResults } from 'axe-core'
import { fileURLToPath } from 'node:url'

await setup({ rootDir: fileURLToPath(new URL('../', import.meta.url)) })

describe('homepage accessibility', () => {
  it('has no detectable a11y violations', async () => {
    const html = await $fetch('/')
    const results = await runAxe(html, {
      resultTypes: ['violations', 'incomplete']
    })

    const issues = [
      ...results.violations.map((issue) => ({ type: 'violation' as const, issue })),
      ...results.incomplete.map((issue) => ({ type: 'incomplete' as const, issue }))
    ]
    const messages = issues.map(({ type, issue }) => formatIssue(issue, type))

    expect(issues, messages.join('\n\n')).toHaveLength(0)
  })
})

async function runAxe (html: string, options?: RunOptions): Promise<AxeResults> {
  const dom = new JSDOM(html, {
    pretendToBeVisual: true,
    runScripts: 'outside-only'
  })
  const { window } = dom

  if (typeof window.document.elementFromPoint !== 'function') {
    window.document.elementFromPoint = ((() => window.document.body || window.document.documentElement) as typeof window.document.elementFromPoint)
  }

  if (typeof window.document.elementsFromPoint !== 'function') {
    window.document.elementsFromPoint = (((_x: number, _y: number) => {
      const element = window.document.elementFromPoint(0, 0)
      return element ? [element] : []
    }) as typeof window.document.elementsFromPoint)
  }

  if (window.Range?.prototype) {
    if (typeof window.Range.prototype.getClientRects !== 'function') {
      window.Range.prototype.getClientRects = () => ({
        length: 0,
        item: () => null,
        [Symbol.iterator]: function * () {}
      } as unknown as DOMRectList)
    }
    if (typeof window.Range.prototype.getBoundingClientRect !== 'function') {
      window.Range.prototype.getBoundingClientRect = () => ({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        toJSON () { return this }
      } as DOMRect)
    }
  }

  if (window.HTMLCanvasElement?.prototype?.getContext) {
    window.HTMLCanvasElement.prototype.getContext = () => {
      const context = {
        clearRect: () => {},
        fillRect: () => {},
        getImageData: () => ({ data: new Uint8ClampedArray(4) }),
        putImageData: () => {},
        drawImage: () => {},
        createImageData: () => ({ data: new Uint8ClampedArray(4) }),
        measureText: () => ({ width: 0 })
      }
      return context as unknown as CanvasRenderingContext2D
    }
  }

  try {
    window.eval(axe.source)
    const axeInstance = (window as unknown as { axe: typeof axe }).axe

    return await axeInstance.run(window.document, {
      reporter: 'v2',
      ...options
    })
  } finally {
    dom.window.close()
  }
}

function formatIssue (issue: AxeResults['violations'][number] | AxeResults['incomplete'][number], type: 'violation' | 'incomplete'): string {
  const nodes = issue.nodes
    .map((node) => {
      const target = node.target.join(' ')
      return `  - ${target}\n      ${node.html.trim()}`
    })
    .join('\n')

  const impact = issue.impact ? ` [${issue.impact}]` : ''
  const helpUrl = issue.helpUrl ? `\nHelp: ${issue.helpUrl}` : ''

  return `${type.toUpperCase()}: ${issue.id}${impact}\n${issue.help}${helpUrl}\n${nodes}`
}
