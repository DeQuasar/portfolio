/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'

let setupExternalLinkGuard: (nuxtApp: { hooks: { hook: (name: string, cb: () => void) => void } }) => void

beforeAll(async () => {
  vi.stubGlobal('defineNuxtPlugin', (cb: any) => cb)
  ;({ setupExternalLinkGuard } = await import('../plugins/external-link-guard.client'))
})

afterAll(() => {
  // @ts-expect-error test cleanup
  delete (globalThis as any).defineNuxtPlugin
})

describe('external-link-guard plugin', () => {
  const cleanup: Array<() => void> = []

  beforeEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
    cleanup.length = 0
    setupExternalLinkGuard({
      hooks: {
        hook: (_name: string, cb: () => void) => {
          cleanup.push(cb)
        }
      }
    } as any)
  })

  afterEach(() => {
    cleanup.forEach((fn) => fn())
    document.body.innerHTML = ''
  })

  it('opens external links in a new tab without redirect interstitial', () => {
    const anchor = document.createElement('a')
    anchor.href = 'https://example.com/'
    document.body.appendChild(anchor)

    const openSpy = vi.spyOn(window, 'open').mockReturnValue({} as Window)

    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    anchor.dispatchEvent(event)

    expect(openSpy).toHaveBeenCalledWith('https://example.com/', '_blank', 'noopener=yes')
    expect(event.defaultPrevented).toBe(true)
  })

  it('skips guard for anchors marked to skip', () => {
    const anchor = document.createElement('a')
    anchor.href = 'https://example.com/'
    anchor.dataset.externalGuard = 'skip'
    document.body.appendChild(anchor)

    const openSpy = vi.spyOn(window, 'open')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    anchor.dispatchEvent(event)

    expect(openSpy).not.toHaveBeenCalled()
  })
})
