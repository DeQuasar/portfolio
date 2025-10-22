/* eslint-disable vue/one-component-per-file */
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref, type ComputedRef } from 'vue'
import ExperienceSection from '../../components/ExperienceSection.vue'
import type { ExperienceContent, ExperienceEntry } from '../../types/content'

const registerCardSpies = new Map<string, ReturnType<typeof vi.fn>>()
const toggleToolkitSpy = vi.fn()
const getToolkitDisplaySpy = vi.fn()
const getEntryDurationSpy = vi.fn()
const getProjectHighlightsSpy = vi.fn()
const getActiveHighlightSpy = vi.fn()
const isEntryVisibleSpy = vi.fn()
const isToolkitExpandedSpy = vi.fn()
let capturedEntries: ComputedRef<ExperienceEntry[]> | null = null

const activeStyle = { opacity: '1' }
const inactiveStyle = { opacity: '0.5' }
const glowStyle = { boxShadow: '0 0 10px rgba(0,0,0,0.2)' }

const resetSpies = () => {
  registerCardSpies.clear()
  toggleToolkitSpy.mockReset()
  getToolkitDisplaySpy.mockReset()
  getEntryDurationSpy.mockReset()
  getProjectHighlightsSpy.mockReset()
  getActiveHighlightSpy.mockReset()
  isEntryVisibleSpy.mockReset()
  isToolkitExpandedSpy.mockReset()
  capturedEntries = null
}

vi.mock('~/composables/useExperienceSection', () => ({
  useExperienceSection: (entries: ComputedRef<ExperienceEntry[]>) => {
    capturedEntries = entries
    const registerCard = (slug: string) => {
      const fn = vi.fn()
      registerCardSpies.set(slug, fn)
      return fn
    }
    return {
      isHydrated: ref(true),
      registerCard,
      isEntryVisible: (slug: string) => {
        isEntryVisibleSpy(slug)
        return slug === 'first'
      },
      getEntryDuration: (slug: string) => {
        getEntryDurationSpy(slug)
        return slug === 'first' ? '2 years' : null
      },
      getToolkitDisplay: (slug: string) => {
        getToolkitDisplaySpy(slug)
        return slug === 'first'
          ? { visible: ['Nuxt', 'Vue'], hasOverflow: true }
          : { visible: ['TypeScript'], hasOverflow: false }
      },
      isToolkitExpanded: (slug: string) => {
        isToolkitExpandedSpy(slug)
        return slug === 'second'
      },
      toggleToolkit: (slug: string) => {
        toggleToolkitSpy(slug)
      },
      getProjectHighlights: (slug: string, projectTitle: string) => {
        getProjectHighlightsSpy(slug, projectTitle)
        return []
      },
      getActiveProjectHighlight: (slug: string, projectTitle: string) => {
        getActiveHighlightSpy(slug, projectTitle)
        return null
      },
      activeHighlightStyle: activeStyle,
      inactiveHighlightStyle: inactiveStyle,
      glowOverlayStyle: glowStyle
    }
  }
}))

const SectionHeaderStub = defineComponent({
  name: 'SectionHeader',
  props: {
    title: { type: String, required: true },
    accent: { type: String, required: false }
  },
  setup(props) {
    return () => h('header', { 'data-section-title': props.title, 'data-accent': props.accent })
  }
})

const ExperienceEntryCardStub = defineComponent({
  name: 'ExperienceEntryCard',
  props: {
    entry: { type: Object, required: true },
    isActive: { type: Boolean, required: true },
    registerCard: { type: Function, required: true },
    cardStyle: { type: Object, required: true },
    glowOverlayStyle: { type: Object, required: true },
    isHydrated: { type: Boolean, required: true },
    toolkitDisplay: { type: Object, required: true },
    toolkitExpanded: { type: Boolean, required: true },
    onToggleToolkit: { type: Function, required: true },
    entryDuration: { type: [String, null], required: false },
    getProjectHighlights: { type: Function, required: true },
    getActiveProjectHighlight: { type: Function, required: true }
  },
  emits: ['ready'],
  setup(props, { emit }) {
    emit('ready', props.entry.slug)
    return () => h('article', { 'data-entry-slug': (props.entry as ExperienceEntry).slug })
  }
})

const experienceContent: ExperienceContent = {
  entries: [
    {
      slug: 'first',
      role: 'Lead Engineer',
      organization: 'Example Corp',
      location: 'Remote',
      period: '2021 — Present',
      summary: ['Owned critical services'],
      projects: [
        { title: 'Project Alpha', summary: ['Scaled throughput'], toolkit: [] }
      ]
    },
    {
      slug: 'second',
      role: 'Staff Developer',
      organization: 'Sample Labs',
      location: 'NYC',
      period: '2019 — 2021',
      summary: ['Reduced incident rate'],
      projects: [
        { title: 'Project Beta', summary: ['Mentored team'], toolkit: [] }
      ]
    }
  ]
}

const mountSection = () => {
  resetSpies()
  return mount(ExperienceSection, {
    props: {
      experience: experienceContent
    },
    global: {
      components: {
        SectionHeader: SectionHeaderStub,
        ExperienceEntryCard: ExperienceEntryCardStub
      },
      stubs: {
        Transition: false
      }
    }
  })
}

describe('ExperienceSection', () => {
  it('renders an entry card per experience entry with appropriate flags', () => {
    const wrapper = mountSection()
    const cards = wrapper.findAllComponents(ExperienceEntryCardStub)
    expect(cards).toHaveLength(2)
    expect(registerCardSpies.has('first')).toBe(true)
    expect(registerCardSpies.has('second')).toBe(true)

    const firstCard = cards[0].props()
    expect(firstCard.entry.slug).toBe('first')
    expect(firstCard.isActive).toBe(true)
    expect(firstCard.cardStyle).toBe(activeStyle)
    expect(firstCard.glowOverlayStyle).toBe(glowStyle)
    expect(firstCard.entryDuration).toBe('2 years')
    expect(firstCard.isHydrated).toBe(true)
    expect(firstCard.toolkitDisplay).toEqual({ visible: ['Nuxt', 'Vue'], hasOverflow: true })

    const secondCard = cards[1].props()
    expect(secondCard.entry.slug).toBe('second')
    expect(secondCard.isActive).toBe(false)
    expect(secondCard.cardStyle).toBe(inactiveStyle)
    expect(secondCard.toolkitExpanded).toBe(true)
    expect(secondCard.toolkitDisplay).toEqual({ visible: ['TypeScript'], hasOverflow: false })
    expect(firstCard.registerCard).not.toBe(secondCard.registerCard)

    expect(isEntryVisibleSpy).toHaveBeenCalledWith('first')
    expect(isEntryVisibleSpy).toHaveBeenCalledWith('second')
    expect(isToolkitExpandedSpy).toHaveBeenCalledWith('first')
    expect(isToolkitExpandedSpy).toHaveBeenCalledWith('second')
    expect(getToolkitDisplaySpy).toHaveBeenCalledWith('first')
    expect(getToolkitDisplaySpy).toHaveBeenCalledWith('second')
    expect(getEntryDurationSpy).toHaveBeenCalledWith('first')
    expect(getEntryDurationSpy).toHaveBeenCalledWith('second')
  })

  it('invokes composable helpers when child handlers are executed', () => {
    const wrapper = mountSection()
    const cards = wrapper.findAllComponents(ExperienceEntryCardStub)

    const firstCardProps = cards[0].props()
    firstCardProps.registerCard(document.createElement('div'))
    expect(registerCardSpies.get('first')?.mock.calls.length ?? 0).toBeGreaterThan(0)

    firstCardProps.onToggleToolkit()
    expect(toggleToolkitSpy).toHaveBeenCalledWith('first')

    firstCardProps.getProjectHighlights('Project Alpha')
    expect(getProjectHighlightsSpy).toHaveBeenCalledWith('first', 'Project Alpha')

    firstCardProps.getActiveProjectHighlight('Project Alpha')
    expect(getActiveHighlightSpy).toHaveBeenCalledWith('first', 'Project Alpha')
  })

  it('provides reactive computed entries to the composable', async () => {
    const wrapper = mountSection()
    expect(capturedEntries).not.toBeNull()
    expect(capturedEntries?.value.map((entry) => entry.slug)).toEqual(['first', 'second'])

    const next = [
      {
        slug: 'updated',
        role: 'IC',
        organization: 'Next Org',
        location: 'Remote',
        period: '2024 — Present',
        projects: [],
        summary: []
      }
    ] satisfies ExperienceEntry[]

    await wrapper.setProps({
      experience: {
        entries: next
      } as ExperienceContent
    })
    await nextTick()

    expect(capturedEntries?.value.map((entry) => entry.slug)).toEqual(['updated'])
  })
})
