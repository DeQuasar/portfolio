import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
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

let dom: JSDOM

beforeAll(() => {
  dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' })
  Object.defineProperty(globalThis, 'window', { value: dom.window, configurable: true })
  Object.defineProperty(globalThis, 'document', { value: dom.window.document, configurable: true })
  const matchMediaMock = (query: string) => ({
      media: query,
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn()
    })
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

    composable.toggleToolkit('alpha')
    const expanded = composable.getToolkitDisplay('alpha')
    expect(expanded.visible).toEqual(['Laravel', 'TypeScript', 'Vue.js', 'PostgreSQL', 'Redis'])
    expect(expanded.hasOverflow).toBe(true)
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
})
