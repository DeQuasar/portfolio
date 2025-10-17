import { describe, it, expect } from 'vitest'
import { computed } from 'vue'
import { useSkillStack } from '../../composables/useSkillStack'
import type { SkillsContent, ExperienceContent } from '../../types/content'

const skillsFixture = computed<SkillsContent>(() => ({
  intro: 'Fixture skills intro',
  core: {
    description: 'Fixture core description',
    groups: [
      {
        title: 'Backend Core',
        description: 'Primary backend stack.',
        skills: ['Laravel', 'PostgreSQL']
      },
      {
        title: 'Frontend Core',
        description: 'Primary frontend stack.',
        skills: ['Vue.js', 'TypeScript']
      }
    ]
  },
  categories: [
    {
      title: 'Delivery Tooling',
      description: 'Keeps deployments smooth.',
      match: ['Docker', 'GitHub Actions', 'Vitest']
    },
    {
      title: 'Data Extras',
      description: 'Supporting datastores.',
      match: ['MariaDB']
    }
  ]
}))

const experienceFixture = computed<ExperienceContent>(() => ({
  entries: [
    {
      slug: 'alpha',
      role: 'Senior Engineer',
      organization: 'Alpha Co',
      location: 'Remote',
      period: '2023 – Present',
      toolkit: ['Laravel', 'Redis', 'RabbitMQ', 'Docker'],
      summary: [],
      projects: []
    },
    {
      slug: 'beta',
      role: 'Staff Engineer',
      organization: 'Beta LLC',
      location: 'Remote',
      period: '2021 – 2023',
      toolkit: ['PostgreSQL', 'Redis', 'ElasticSearch', 'GitHub Actions'],
      summary: [],
      projects: []
    },
    {
      slug: 'gamma',
      role: 'Tech Lead',
      organization: 'Gamma Inc',
      location: 'Remote',
      period: '2020 – 2021',
      toolkit: ['TypeScript', 'Vitest', 'MariaDB'],
      summary: [],
      projects: []
    }
  ]
}))

describe('useSkillStack', () => {
  it('aggregates additional skills sorted by usage frequency and sources', () => {
    const { additionalSkills } = useSkillStack({
      skills: skillsFixture,
      experience: experienceFixture
    })

    const labels = additionalSkills.value.map((item) => item.label)
    expect(labels).toEqual(['Redis', 'ElasticSearch', 'RabbitMQ'])

    const redis = additionalSkills.value.find((item) => item.label === 'Redis')
    expect(redis).toMatchObject({
      count: 2,
      sources: ['alpha', 'beta']
    })

    const rabbitmq = additionalSkills.value.find((item) => item.label === 'RabbitMQ')
    expect(rabbitmq).toMatchObject({
      count: 1,
      sources: ['alpha']
    })
  })

  it('maps supporting categories while excluding core skills', () => {
    const { supportingCategories } = useSkillStack({
      skills: skillsFixture,
      experience: experienceFixture
    })

    const deliveryCategory = supportingCategories.value.find((category) => category.title === 'Delivery Tooling')
    expect(deliveryCategory).toBeDefined()
    expect(deliveryCategory?.skills.map((item) => item.label)).toEqual(['Docker', 'GitHub Actions', 'Vitest'])

    const dataCategory = supportingCategories.value.find((category) => category.title === 'Data Extras')
    expect(dataCategory).toBeDefined()
    expect(dataCategory?.skills.map((item) => item.label)).toEqual(['MariaDB'])
  })
})
