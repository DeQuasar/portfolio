import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import SkillCategoryCard from '~/components/skills/SkillCategoryCard.vue'
import type { SkillCategoryDisplay } from '~/composables/useSkillStack'

const mobileQuery = ref(false)

vi.mock('@vueuse/core', () => ({
  useBreakpoints: () => ({
    smaller: () => mobileQuery
  })
}))

const category: SkillCategoryDisplay = {
  title: 'Delivery Tooling',
  description: 'Automation and release support.',
  skills: Array.from({ length: 8 }, (_, index) => ({
    label: `Skill ${index + 1}`,
    count: 1,
    sources: []
  }))
}

const mountCategory = () =>
  mount(SkillCategoryCard, {
    props: {
      category
    },
    attachTo: document.body
  })

beforeEach(() => {
  mobileQuery.value = false
})

describe('SkillCategoryCard', () => {
  it('renders all category skills on desktop without expansion control', async () => {
    const wrapper = mountCategory()
    await nextTick()

    const pills = wrapper.findAll('li')
    expect(pills).toHaveLength(category.skills.length)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('limits skills on mobile and toggles expanded state', async () => {
    mobileQuery.value = true
    const wrapper = mountCategory()
    await nextTick()
    await nextTick()

    expect(wrapper.findAll('li')).toHaveLength(5)
    const toggle = wrapper.get('button')
    expect(toggle.text()).toBe('Show more')
    expect(toggle.attributes('aria-expanded')).toBe('false')

    await toggle.trigger('click')
    await nextTick()

    expect(wrapper.findAll('li')).toHaveLength(category.skills.length)
    expect(toggle.text()).toBe('Show fewer')
    expect(toggle.attributes('aria-expanded')).toBe('true')
  })
})
