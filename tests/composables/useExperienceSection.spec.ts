import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

const mountedCallbacks: Array<() => void> = []
const beforeUnmountCallbacks: Array<() => void> = []

vi.mock('vue', async () => {
  const actual = await vi.importActual<typeof import('vue')>('vue')
  return {
    ...actual,
    onMounted: (cb: () => void) => {
      mountedCallbacks.push(cb)
    },
    onBeforeUnmount: (cb: () => void) => {
      beforeUnmountCallbacks.push(cb)
    }
  }
})

import { computed, ref, nextTick } from 'vue'
import { useExperienceSection } from '../../composables/useExperienceSection'
import type { ExperienceEntry } from '../../types/content'

const buildEntries = (): ExperienceEntry[] => ([
  {
    slug: 'alpha',
    role: 'Senior Developer',
    organization: 'Alpha Co',
    location: 'Remote',
    period: 'January 2022 – March 2024',
    toolkit: ['Laravel', 'TypeScript', 'Vue.js', 'PostgreSQL', 'Redis'],
    summary: ['Delivered key features.'],
    projects: [
      {
        title: 'Support Modernization',
        summary: 'Consolidated support tooling.',
        problem: 'Fragmented intake across systems.',
        contribution: 'Unified the queue and automated triage.',
        impact: 'Response times fell below 48 hours.',
        highlights: [
          {
            id: 'alpha-highlight',
            problem: 'Legacy tools created delays.',
            contribution: 'Introduced centralized intake.',
            impact: 'Cut backlog by 35%.'
          },
          {
            problem: 'Teams lacked visibility.',
            contribution: 'Published proactive status dashboards.',
            impact: 'Reduced escalations.'
          }
        ],
        links: []
      }
    ]
  },
  {
    slug: 'beta',
    role: 'Staff Engineer',
    organization: 'Beta LLC',
    location: 'Remote',
    period: 'April 2020 – January 2022',
    toolkit: ['Docker', 'GitHub Actions', 'Vitest', 'Tailwind CSS'],
    summary: ['Led CI/CD modernization.'],
    projects: []
  }
])

const createMatchMediaMock = (matches: boolean) => {
  return (query: string) => ({
    media: query,
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn()
  })
}

let dom: JSDOM

beforeAll(() => {
  dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' })
  Object.defineProperty(globalThis, 'window', { value: dom.window, configurable: true })
  Object.defineProperty(globalThis, 'document', { value: dom.window.document, configurable: true })
  const matchMediaMock = createMatchMediaMock(false)
  dom.window.matchMedia = matchMediaMock as typeof dom.window.matchMedia
  Object.defineProperty(globalThis, 'matchMedia', {
    value: matchMediaMock,
    configurable: true
  })
})

beforeEach(() => {
  vi.restoreAllMocks()
  const matchMediaMock = createMatchMediaMock(false)
  dom.window.matchMedia = matchMediaMock as typeof dom.window.matchMedia
  Object.defineProperty(globalThis, 'matchMedia', {
    value: matchMediaMock,
    configurable: true
  })
})

afterEach(() => {
  mountedCallbacks.splice(0).forEach((cb) => cb())
  beforeUnmountCallbacks.splice(0).forEach((cb) => cb())
})

afterAll(() => {
  dom.window.close()
  Reflect.deleteProperty(globalThis, 'window')
  Reflect.deleteProperty(globalThis, 'document')
  Reflect.deleteProperty(globalThis, 'matchMedia')
})

describe('useExperienceSection', () => {
  it('limits toolkit chips until expanded and exposes overflow state', async () => {
    const entries = ref(buildEntries())
    const composable = useExperienceSection(computed(() => entries.value))

    await nextTick()
    mountedCallbacks.splice(0).forEach((cb) => cb())

    const initial = composable.getToolkitDisplay('alpha')
    expect(initial.visible).toEqual(['Laravel', 'TypeScript', 'Vue.js', 'PostgreSQL'])
    expect(initial.hasOverflow).toBe(true)
    expect(composable.isToolkitExpanded('alpha')).toBe(false)

    composable.toggleToolkit('alpha')
    const expanded = composable.getToolkitDisplay('alpha')
    expect(expanded.visible).toEqual(['Laravel', 'TypeScript', 'Vue.js', 'PostgreSQL', 'Redis'])
    expect(expanded.hasOverflow).toBe(true)
    expect(composable.isToolkitExpanded('alpha')).toBe(true)

    composable.toggleToolkit('alpha')
    const collapsed = composable.getToolkitDisplay('alpha')
    expect(collapsed.visible).toEqual(['Laravel', 'TypeScript', 'Vue.js', 'PostgreSQL'])
    expect(composable.isToolkitExpanded('alpha')).toBe(false)

    expect(composable.getToolkitDisplay('missing')).toEqual({ visible: [], hasOverflow: false })
  })

  it('computes entry durations and resolves highlight fallbacks', async () => {
    const entries = ref(buildEntries())
    const composable = useExperienceSection(computed(() => entries.value))

    await nextTick()
    mountedCallbacks.splice(0).forEach((cb) => cb())

    expect(composable.getEntryDuration('alpha')).toBe('2 yrs 2 mos')
    expect(composable.getEntryDuration('beta')).toBe('1 yr 9 mos')

    const highlights = composable.getProjectHighlights('alpha', 'Support Modernization')
    expect(highlights).toHaveLength(2)
   expect(highlights[0]).toMatchObject({
      id: 'alpha-highlight',
      impact: 'Cut backlog by 35%.'
    })
    expect(highlights[1].id).toMatch(/alpha-support-modernization/)
    expect(composable.getActiveProjectHighlight('alpha', 'Support Modernization')).toStrictEqual(highlights[0])
  })

  it('computes active slugs using viewport tracking and cleans up listeners on unmount', async () => {
    const defaultMatchMedia = window.matchMedia
    const matchMediaStub = vi.fn().mockReturnValue({
      matches: true,
      media: '(min-width: 768px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn()
    })
    dom.window.matchMedia = matchMediaStub as any
    Object.defineProperty(globalThis, 'matchMedia', {
      value: matchMediaStub,
      configurable: true
    })

    const entries = ref(buildEntries())

    const listeners: Record<string, EventListener> = {}
    const addListenerSpy = vi.spyOn(window, 'addEventListener').mockImplementation((type, handler) => {
      listeners[type] = handler as EventListener
    })
    const removeListenerSpy = vi.spyOn(window, 'removeEventListener').mockImplementation((type, handler) => {
      if (listeners[type] === handler) {
        delete listeners[type]
      }
    })

    if (typeof window.cancelAnimationFrame !== 'function') {
      Object.defineProperty(window, 'cancelAnimationFrame', {
        configurable: true,
        writable: true,
        value: vi.fn()
      })
    }
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
    if (typeof window.requestAnimationFrame !== 'function') {
      Object.defineProperty(window, 'requestAnimationFrame', {
        configurable: true,
        writable: true,
        value: vi.fn()
      })
    }
    const frameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(16)
      return 7
    })

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      get: () => 800
    })
    expect(window.innerHeight).toBe(800)

    const composable = useExperienceSection(computed(() => entries.value))

    await nextTick()
    mountedCallbacks.splice(0).forEach((cb) => cb())

    expect(matchMediaStub).toHaveBeenCalledWith('(min-width: 768px)')
    expect(composable.isHydrated.value).toBe(true)
    expect(addListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
    expect(addListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    const alphaEl = document.createElement('article')
    Object.defineProperty(alphaEl, 'getBoundingClientRect', {
      value: () => ({ top: 120, bottom: 280, height: 160 })
    })
    const betaEl = document.createElement('article')
    Object.defineProperty(betaEl, 'getBoundingClientRect', {
      value: () => ({ top: 320, bottom: 520, height: 200 })
    })

    composable.registerCard('alpha')(alphaEl)
    composable.registerCard('beta')(betaEl)
    const framesAfterRegister = frameSpy.mock.calls.length
    composable.registerCard('alpha')(null)
    await nextTick()
    listeners.scroll?.(new Event('scroll'))
    await nextTick()
    expect(frameSpy.mock.calls.length).toBeGreaterThanOrEqual(framesAfterRegister)

    composable.registerCard('beta')(null)
    await nextTick()
    expect(composable.isEntryVisible('alpha')).toBe(true)

    listeners.scroll?.(new Event('scroll'))
    expect(composable.isEntryVisible('alpha')).toBe(true)

    beforeUnmountCallbacks.splice(0).forEach((cb) => cb())
    expect(cancelSpy).toHaveBeenCalled()
    expect(removeListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(removeListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(composable.activeSlug.value).toBeNull()

    beforeUnmountCallbacks.length = 0

    Object.defineProperty(globalThis, 'matchMedia', {
      value: defaultMatchMedia,
      configurable: true
    })
    dom.window.matchMedia = defaultMatchMedia as any
    addListenerSpy.mockRestore()
    removeListenerSpy.mockRestore()
  })

  it('updates active slug when entries change and clears when empty', async () => {
    const entries = ref(buildEntries())
    const composable = useExperienceSection(computed(() => entries.value))

    await nextTick()
    mountedCallbacks.splice(0).forEach((cb) => cb())

    expect(composable.activeSlug.value).toBe('alpha')

    entries.value = [entries.value[1]]
    await nextTick()
    expect(composable.activeSlug.value).toBe('beta')

    entries.value = []
    await nextTick()
    expect(composable.activeSlug.value).toBeNull()
  })
})
