import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ExperienceEntryCard from '../../components/experience/ExperienceEntryCard.vue'
import ExperienceProjectCard from '../../components/experience/ExperienceProjectCard.vue'
import type { ExperienceEntry } from '../../types/content'
import type { ExperienceProjectHighlightDisplay } from '../../composables/useExperienceSection'

const baseEntry: ExperienceEntry = {
  slug: 'lead-engineer',
  role: 'Lead Engineer',
  organization: 'Example Corp',
  location: 'Remote',
  period: '2022 — Present',
  summary: ['Shipped revenue-critical features', 'Mentored 4 engineers'],
  projects: [
    {
      title: 'Project Alpha',
      summary: 'Scaled ingestion pipeline',
      problem: 'Legacy systems blocked throughput',
      contribution: 'Re-architected data ingestion',
      impact: 'Reduced processing time by 40%',
      links: []
    },
    {
      title: 'Project Beta',
      summary: 'Modernized developer tooling',
      problem: 'Manual workflows slowed releases',
      contribution: 'Introduced automated pipelines',
      impact: 'Cut release time from days to hours',
      links: []
    }
  ],
  toolkit: ['Nuxt', 'TypeScript', 'Vue']
}

const highlightLookup: Record<string, ExperienceProjectHighlightDisplay[]> = {
  'Project Alpha': [
    {
      id: 'alpha',
      problem: 'Legacy systems blocked throughput',
      contribution: 'Re-architected data ingestion',
      impact: 'Reduced processing time by 40%'
    }
  ],
  'Project Beta': [
    {
      id: 'beta',
      problem: 'Manual workflows slowed releases',
      contribution: 'Introduced automated pipelines',
      impact: 'Cut release time from days to hours'
    }
  ]
}

const isElementLike = (value: unknown): value is Element | { $el?: Element } => {
  if (!value) {
    return false
  }
  if (value instanceof Element) {
    return true
  }
  if (typeof value === 'object' && '$el' in value) {
    const candidate = (value as { $el?: unknown }).$el
    return candidate instanceof Element
  }
  return false
}

const mountCard = (overrides: Partial<InstanceType<typeof ExperienceEntryCard>['$props']> = {}) => {
  const registerCard = vi.fn()
  const getProjectHighlights = vi.fn((title: string) => highlightLookup[title] ?? [])
  const getActiveProjectHighlight = vi.fn((title: string) => (highlightLookup[title] ?? [])[0] ?? null)

  const wrapper = mount(ExperienceEntryCard, {
    props: {
      entry: baseEntry,
      isActive: true,
      registerCard,
      cardStyle: { '--card-core': '#fff' },
      glowOverlayStyle: { boxShadow: '0 0 10px rgba(0,0,0,0.2)' },
      isHydrated: true,
      toolkitDisplay: { visible: baseEntry.toolkit ?? [], hasOverflow: true },
      toolkitExpanded: false,
      onToggleToolkit: vi.fn(),
      entryDuration: '2 yrs',
      getProjectHighlights,
      getActiveProjectHighlight,
      ...overrides
    }
  })

  return {
    wrapper,
    registerCard,
    getProjectHighlights,
    getActiveProjectHighlight
  }
}

describe('ExperienceEntryCard', () => {
  it('renders entry metadata, summary, and applies active styling', () => {
    const { wrapper } = mountCard()
    const card = wrapper.get('#experience-lead-engineer')

    expect(card.classes()).toContain('shadow-lg')
    expect(card.attributes('id')).toBe('experience-lead-engineer')
    expect(wrapper.text()).toContain('Lead Engineer')
    expect(wrapper.text()).toContain('Example Corp')
    expect(wrapper.text()).toContain('Remote')
    expect(wrapper.text()).toContain('2022 — Present')
    expect(wrapper.text()).toContain('2 yrs')

    const summaryItems = wrapper.findAll('ul li')
    expect(summaryItems).toHaveLength(2)
    expect(summaryItems[0].text()).toContain('Shipped revenue-critical features')

    const glow = wrapper.get('span.pointer-events-none')
    expect(glow.classes()).toContain('opacity-95')
    expect(glow.attributes('style')).toContain('box-shadow: 0 0 10px rgba(0,0,0,0.2)')
  })

  it('invokes register and project highlight helpers for each project', async () => {
    const { wrapper, registerCard, getProjectHighlights, getActiveProjectHighlight } = mountCard()
    await nextTick()

    expect(registerCard).toHaveBeenCalledTimes(1)
    const registerArg = registerCard.mock.calls[0][0]
    expect(registerArg).toBeTruthy()
    expect(isElementLike(registerArg)).toBe(true)

    const projectCards = wrapper.findAllComponents(ExperienceProjectCard)
    expect(projectCards).toHaveLength(2)

    expect(getProjectHighlights).toHaveBeenCalledWith('Project Alpha')
    expect(getProjectHighlights).toHaveBeenCalledWith('Project Beta')
    expect(getActiveProjectHighlight).toHaveBeenCalledWith('Project Alpha')
    expect(getActiveProjectHighlight).toHaveBeenCalledWith('Project Beta')

    const firstProject = projectCards[0].props()
    expect(firstProject.highlights).toEqual(highlightLookup['Project Alpha'])
    expect(firstProject.activeHighlight).toEqual(highlightLookup['Project Alpha'][0])
  })

  it('omits optional fields and removes active styling when not active', () => {
    const entry: ExperienceEntry = {
      ...baseEntry,
      location: '',
      summary: [],
      projects: baseEntry.projects.slice(0, 1)
    }

    const { wrapper } = mountCard({
      entry,
      isActive: false,
      entryDuration: null,
      toolkitDisplay: { visible: [], hasOverflow: false }
    })

    const card = wrapper.get('#experience-lead-engineer')
    expect(card.classes()).not.toContain('shadow-lg')

    const glow = wrapper.get('span.pointer-events-none')
    expect(glow.classes()).toContain('opacity-0')

    expect(wrapper.text()).not.toContain('Remote')
    expect(wrapper.find('ul').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('2 yrs')
  })
})
