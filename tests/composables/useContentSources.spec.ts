import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useHeroContent,
  useHighlights,
  useProjects,
  useSkillsContent,
  useContactContent,
  useExperienceContent
} from '../../composables/useContentSources'

type Row = Record<string, unknown> | null

const entryRows: Record<string, Row> = {}
const childrenRows: Record<string, Row[]> = {}
const useAsyncDataMock = vi.fn(async (_key: string, handler: () => Promise<unknown>) => {
  const value = await handler()
  return { data: { value } }
})

vi.mock('#imports', () => ({
  queryCollection: vi.fn(() => ({
    path: (path: string) => ({
      first: vi.fn(() => Promise.resolve(entryRows[path] ?? null))
    }),
    where: (_field: string, _operator: string, pattern: string) => {
      const normalized = pattern.replace(/\/%$/, '')
      return {
        all: vi.fn(() => Promise.resolve(childrenRows[normalized] ?? []))
      }
    }
  }))
}))

const resetData = () => {
  for (const key of Object.keys(entryRows)) {
    delete entryRows[key]
  }
  for (const key of Object.keys(childrenRows)) {
    delete childrenRows[key]
  }
}

describe('useContentSources composables', () => {
  beforeEach(() => {
    resetData()
    useAsyncDataMock.mockClear()
    vi.stubGlobal('useAsyncData', useAsyncDataMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('parses hero document metadata strings into objects', async () => {
    entryRows['/hero'] = {
      meta: JSON.stringify({ heading: 'Hello', order: 3 }),
      title: 'Hero Title',
      path: '/hero'
    }

    const { data } = await useHeroContent()

    expect(useAsyncDataMock).toHaveBeenCalledWith('hero', expect.any(Function))
    expect(data.value).toEqual({
      heading: 'Hello',
      order: 3,
      title: 'Hero Title',
      path: '/hero'
    })
  })

  it('normalizes highlight child entries, filters null meta, and sorts by order', async () => {
    childrenRows['/highlights'] = [
      { meta: JSON.stringify({ order: 2, slug: 'second' }) },
      { meta: JSON.stringify({ order: 1, slug: 'first' }), title: 'First Highlight', path: '/highlights/first' },
      { meta: null },
      { meta: { order: 3, slug: 'third' }, title: 'Third Highlight' }
    ]

    const { data } = await useHighlights()

    expect(useAsyncDataMock).toHaveBeenCalledWith('highlights', expect.any(Function))
    expect(data.value).toEqual([
      { order: 1, slug: 'first', title: 'First Highlight', path: '/highlights/first' },
      { order: 2, slug: 'second' },
      { order: 3, slug: 'third', title: 'Third Highlight' }
    ])
  })

  it('handles project rows with numeric ordering and keeps metadata objects intact', async () => {
    childrenRows['/projects'] = [
      { meta: { order: '20', slug: 'zeta' } },
      { meta: { order: '10', slug: 'alpha' } }
    ]

    const { data } = await useProjects()

    expect(data.value).toEqual([
      { order: '10', slug: 'alpha' },
      { order: '20', slug: 'zeta' }
    ])
  })

  it('returns null when an entry document is missing metadata', async () => {
    entryRows['/contact'] = { meta: null }
    entryRows['/experience'] = null

    const { data: contact } = await useContactContent()
    const { data: experience } = await useExperienceContent()
    const { data: skills } = await useSkillsContent()

    expect(contact.value).toBeNull()
    expect(experience.value).toBeNull()
    expect(skills.value).toBeNull()
  })
})
