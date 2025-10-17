import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ExperienceProjectCard from '../../components/experience/ExperienceProjectCard.vue'
import type { ExperienceProject } from '../../types/content'
import type { ExperienceProjectHighlightDisplay } from '../../composables/useExperienceSection'

const baseProject: ExperienceProject = {
  title: 'Project Alpha',
  summary: 'Scaled ingestion pipeline',
  problem: 'Legacy systems blocked throughput',
  contribution: 'Re-architected data ingestion',
  impact: 'Reduced processing time by 40%',
  links: [
    { text: 'Case study', url: 'https://example.com/case-study' },
    { text: 'Source code', url: 'https://github.com/example/repo' }
  ],
  media: [
    { type: 'image', src: '/alpha-screenshot.jpg', alt: 'Alpha screenshot' },
    { type: 'icon', src: '/alpha-icon.svg', alt: 'Alpha icon' }
  ]
}

const baseHighlights: ExperienceProjectHighlightDisplay[] = [
  {
    id: 'alpha',
    problem: 'Legacy systems blocked throughput',
    contribution: 'Re-architected data ingestion',
    impact: 'Reduced processing time by 40%'
  }
]

const mountProjectCard = (overrides: {
  project?: ExperienceProject
  highlights?: ExperienceProjectHighlightDisplay[]
  activeHighlight?: ExperienceProjectHighlightDisplay | null
} = {}) => {
  const card = mount(ExperienceProjectCard, {
    props: {
      project: baseProject,
      highlights: baseHighlights,
      activeHighlight: baseHighlights[0],
      ...overrides
    }
  })

  return { wrapper: card }
}

describe('ExperienceProjectCard', () => {
  it('renders highlight facets, media, and links in the expected order', () => {
    const { wrapper } = mountProjectCard()
    const article = wrapper.get('[role="article"]')

    expect(article.attributes('aria-label')).toBe('Project Alpha project summary')
    expect(wrapper.text()).toContain('Scaled ingestion pipeline')

    const media = wrapper.findAll('[aria-label="Project visuals"] img')
    expect(media).toHaveLength(2)
    expect(media[0].attributes('src')).toBe('/alpha-screenshot.jpg')
    expect(media[0].attributes('alt')).toBe('Alpha screenshot')
    expect(media[1].attributes('src')).toBe('/alpha-icon.svg')
    expect(media[1].attributes('alt')).toBe('Alpha icon')

    const desktopFacetLabels = wrapper.findAll('.tracking-\\[0\\.22em\\]')
    expect(desktopFacetLabels.map((node) => node.text())).toEqual(['Problem', 'Contribution', 'Impact'])

    const mobileFacetLabels = wrapper.findAll('details .tracking-\\[0\\.18em\\]')
    expect(mobileFacetLabels.map((node) => node.text())).toEqual(['Problem', 'Contribution', 'Impact'])

    expect(wrapper.text()).toContain('Re-architected data ingestion')
    expect(wrapper.text()).toContain('Reduced processing time by 40%')

    const linkNodes = wrapper.findAll('a[href]')
    expect(linkNodes).toHaveLength(2)
    expect(linkNodes[0].text()).toContain('Case study')
    expect(linkNodes[1].text()).toContain('Source code')
    expect(linkNodes[0].attributes('href')).toBe('https://example.com/case-study')
    expect(linkNodes[1].attributes('href')).toBe('https://github.com/example/repo')
    expect(linkNodes[0].attributes('class')).toContain('border-sage-300')
  })

  it('hides highlight sections when no highlight information is provided', () => {
    const project: ExperienceProject = {
      ...baseProject,
      title: 'Project Gamma',
      summary: 'Shipped internal tooling',
      links: []
    }

    const { wrapper } = mountProjectCard({
      project,
      highlights: [],
      activeHighlight: null
    })

    expect(wrapper.text()).toContain('Shipped internal tooling')
    expect(wrapper.findAll('.tracking-\\[0\\.22em\\]').length).toBe(0)
    expect(wrapper.findAll('details').length).toBe(0)
    expect(wrapper.text()).not.toContain('Project impact')
    expect(wrapper.findAll('a[href]')).toHaveLength(0)
  })

  it('renders without media and still outputs link controls', () => {
    const project: ExperienceProject = {
      ...baseProject,
      media: undefined,
      links: [{ text: 'Launch', url: 'https://example.com/launch', rel: 'noopener' }]
    }

    const highlight: ExperienceProjectHighlightDisplay = {
      id: 'gamma',
      problem: 'Lacked visibility',
      contribution: 'Shipped analytics overlay',
      impact: 'Improved adoption by 25%'
    }

    const { wrapper } = mountProjectCard({
      project,
      highlights: [highlight],
      activeHighlight: highlight
    })

    expect(wrapper.find('[aria-label="Project visuals"]').exists()).toBe(false)
    const links = wrapper.findAll('a[href]')
    expect(links).toHaveLength(1)
    expect(links[0].attributes('href')).toBe('https://example.com/launch')
    expect(links[0].attributes('class')).toContain('border-sage-300')
  })
})
