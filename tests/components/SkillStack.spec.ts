import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, defineComponent, h, nextTick, ref } from 'vue'
import SkillStack from '../../components/SkillStack.vue'
import type { SkillsContent, ExperienceContent } from '../../types/content'
import type { SkillCategoryDisplay, SkillCoreGroupDisplay } from '../../composables/useSkillStack'

const mobileQuery = ref(true)

vi.mock('@vueuse/core', () => ({
  useBreakpoints: () => ({
    smaller: () => mobileQuery
  })
}))

const coreGroupsData = ref<SkillCoreGroupDisplay[]>([])
const coreDescriptionText = ref('Core stack description')
const supportingCategoriesData = ref<SkillCategoryDisplay[]>([])
const additionalSkillsData = ref<Array<{ label: string; count: number; sources: string[] }>>([])

vi.mock('~/composables/useSkillStack', () => ({
  useSkillStack: vi.fn(() => ({
    coreGroups: computed(() => coreGroupsData.value),
    coreDescription: computed(() => coreDescriptionText.value),
    supportingCategories: computed(() => supportingCategoriesData.value),
    additionalSkills: computed(() => additionalSkillsData.value)
  }))
}))

const capturedCoreGroups: SkillCoreGroupDisplay[] = []
const capturedCategories: SkillCategoryDisplay[] = []
vi.mock('~/components/ui/SectionHeader.vue', () => ({
  default: defineComponent({
    name: 'SectionHeaderStub',
    props: {
      title: { type: String, required: true },
      description: { type: String, required: false }
    },
    setup(props) {
      return () =>
        h('header', {
          'data-section-title': props.title,
          'data-section-description': props.description
        })
    }
  })
}))

vi.mock('~/components/ui/Pill.vue', () => ({
  default: defineComponent({
    name: 'PillStub',
    setup(_, { slots }) {
      return () => h('div', { 'data-pill': 'true' }, slots.default?.())
    }
  })
}))

vi.mock('~/components/skills/SkillCoreGroupCard.vue', () => ({
  default: defineComponent({
    name: 'SkillCoreGroupCardStub',
    props: {
      group: { type: Object, required: true }
    },
    setup(props) {
      capturedCoreGroups.push(props.group as SkillCoreGroupDisplay)
      return () => h('article', { 'data-core-group': (props.group as SkillCoreGroupDisplay).title })
    }
  })
}))

vi.mock('~/components/skills/SkillCategoryCard.vue', () => ({
  default: defineComponent({
    name: 'SkillCategoryCardStub',
    props: {
      category: { type: Object, required: true }
    },
    setup(props) {
      capturedCategories.push(props.category as SkillCategoryDisplay)
      return () => h('article', { 'data-category': (props.category as SkillCategoryDisplay).title })
    }
  })
}))

const skillsContent: SkillsContent = {
  intro: 'Skills intro copy',
  core: {
    description: 'Unused in test due to composable mock',
    groups: []
  },
  categories: []
}

const experienceContent: ExperienceContent = {
  entries: []
}

const mountSkillStack = () => {
  capturedCoreGroups.splice(0, capturedCoreGroups.length)
  capturedCategories.splice(0, capturedCategories.length)
  return mount(SkillStack, {
    props: {
      skills: skillsContent,
      experience: experienceContent
    }
  })
}

beforeEach(() => {
  mobileQuery.value = true
  additionalSkillsData.value = []
  coreGroupsData.value = []
  supportingCategoriesData.value = []
  coreDescriptionText.value = 'Core stack description'
  capturedCoreGroups.splice(0, capturedCoreGroups.length)
  capturedCategories.splice(0, capturedCategories.length)
  ;(process as any).client = true
})

describe('SkillStack', () => {
it('renders core and supporting sections with data from useSkillStack', async () => {
    coreGroupsData.value = [
      {
        title: 'Frontend',
        description: 'UI tooling',
        skills: [
          { label: 'Vue', count: 3, sources: ['lead-engineer'] },
          { label: 'Nuxt', count: 2, sources: ['lead-engineer'] }
        ],
        organizations: ['Example Corp', 'Sample Labs'],
        roleCount: 2
      }
    ]

    supportingCategoriesData.value = [
      {
        title: 'DevOps',
        description: 'Delivery tooling',
        skills: [
          { label: 'Docker', count: 2, sources: ['lead-engineer'] },
          { label: 'Terraform', count: 1, sources: ['staff-dev'] }
        ]
      }
    ]

    additionalSkillsData.value = [
      { label: 'GraphQL', count: 1, sources: [] },
      { label: 'Storybook', count: 1, sources: [] }
    ]

    const wrapper = mountSkillStack()
    await nextTick()

    const header = wrapper.get('[data-section-title="Skills & Tools"]')
    expect(header.attributes()['data-section-description']).toBe('Skills intro copy')

    expect(capturedCoreGroups).toHaveLength(1)
    expect(capturedCoreGroups[0].title).toBe('Frontend')

    expect(capturedCategories).toHaveLength(1)
    expect(capturedCategories[0].title).toBe('DevOps')

    const pills = wrapper.findAll('[data-pill]')
    expect(pills).toHaveLength(2)
    expect(pills[0].text()).toContain('GraphQL')
  })

  it('limits additional skills on mobile and toggles visibility', async () => {
    additionalSkillsData.value = Array.from({ length: 7 }, (_, index) => ({
      label: `Skill ${index + 1}`,
      count: 1,
      sources: []
    }))

    const wrapper = mountSkillStack()
    await nextTick()

    let pills = wrapper.findAll('[data-pill]')
    expect(pills).toHaveLength(5)
    expect(wrapper.get('button').text()).toBe('Show more tools')

    await wrapper.get('button').trigger('click')
    await nextTick()

    pills = wrapper.findAll('[data-pill]')
    expect(pills).toHaveLength(7)
    expect(wrapper.get('button').text()).toBe('Show fewer tools')
  })

  it('shows all additional skills on larger screens without toggle', () => {
    mobileQuery.value = false

    additionalSkillsData.value = Array.from({ length: 6 }, (_, index) => ({
      label: `Desktop Skill ${index + 1}`,
      count: 1,
      sources: []
    }))

    const wrapper = mountSkillStack()

    const pills = wrapper.findAll('[data-pill]')
    expect(pills).toHaveLength(6)
    expect(wrapper.find('button').exists()).toBe(false)
  })
})
