/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'

let setupExternalLinkGuard: (nuxtApp: { hooks: { hook: (name: string, cb: () => void) => void } }) => void
const originalLocation = window.location
let mockedHref = originalLocation.href

const installLocationMock = () => {
  mockedHref = originalLocation.href
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      get href() {
        return mockedHref
      },
      set href(value: string) {
        mockedHref = value
      },
      assign: vi.fn((value: string) => {
        mockedHref = value
      }),
      replace: vi.fn(),
      reload: vi.fn(),
      origin: originalLocation.origin,
      protocol: originalLocation.protocol,
      host: originalLocation.host,
      hostname: originalLocation.hostname,
      port: originalLocation.port,
      pathname: originalLocation.pathname,
      hash: originalLocation.hash,
      search: originalLocation.search,
      toString: () => mockedHref
    } as Location
  })
}

const restoreLocationMock = () => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation
  })
}

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
    installLocationMock()
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
    restoreLocationMock()
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
    anchor.addEventListener('click', (event) => {
      event.preventDefault()
    })
    document.body.appendChild(anchor)

    const openSpy = vi.spyOn(window, 'open')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    anchor.dispatchEvent(event)

    expect(openSpy).not.toHaveBeenCalled()
  })

  it('ignores clicks that were already prevented', () => {
    const anchor = document.createElement('a')
    anchor.href = 'https://example.com/'
    document.body.appendChild(anchor)

    const openSpy = vi.spyOn(window, 'open')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    event.preventDefault()
    anchor.dispatchEvent(event)

    expect(openSpy).not.toHaveBeenCalled()
  })

  it('ignores non-primary mouse buttons and non-anchor targets', () => {
    const anchor = document.createElement('a')
    anchor.href = 'https://example.com/'
    const wrapper = document.createElement('div')
    wrapper.appendChild(anchor)
    document.body.appendChild(wrapper)

    const openSpy = vi.spyOn(window, 'open')

    const middleClick = new MouseEvent('click', { bubbles: true, cancelable: true, button: 1 })
    anchor.dispatchEvent(middleClick)
    expect(openSpy).not.toHaveBeenCalled()

    const divClick = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    wrapper.dispatchEvent(divClick)
    expect(openSpy).not.toHaveBeenCalled()
  })

  it('skips internal, hash, and protocol-specific links', () => {
    const variants = ['#section', 'mailto:hello@example.com', 'tel:+12345678', `${window.location.origin}/about`]
    const openSpy = vi.spyOn(window, 'open')

    variants.forEach((href) => {
      const anchor = document.createElement('a')
      anchor.href = href
      document.body.appendChild(anchor)
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
      anchor.dispatchEvent(event)
      anchor.remove()
    })

    expect(openSpy).not.toHaveBeenCalled()
  })

  it('gracefully handles invalid href values', () => {
    const anchor = document.createElement('a')
    anchor.setAttribute('href', 'http://[::1') // invalid URL
    document.body.appendChild(anchor)

    const openSpy = vi.spyOn(window, 'open')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    anchor.dispatchEvent(event)

    expect(openSpy).not.toHaveBeenCalled()
  })

  it('falls back to a same-tab navigation when window.open is blocked', () => {
    const anchor = document.createElement('a')
    anchor.href = 'https://example.com/docs'
    document.body.appendChild(anchor)

    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null)
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    anchor.dispatchEvent(event)

    expect(openSpy).toHaveBeenCalledWith('https://example.com/docs', '_blank', 'noopener=yes')
    expect(window.location.href).toBe('https://example.com/docs')
  })

  it('removes the capture listener when the app unmounts', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    cleanup.forEach((fn) => fn())
    cleanup.length = 0
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function), { capture: true })
  })
})
