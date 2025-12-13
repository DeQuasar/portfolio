import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SkillCoreGroupCard from '~/components/skills/SkillCoreGroupCard.vue'
import type { SkillCoreGroupDisplay } from '~/composables/useSkillStack'

const group: SkillCoreGroupDisplay = {
  title: 'Frontend Engineering',
  description: 'UI platforms and design systems.',
  skills: [
    { label: 'Nuxt', count: 4, sources: ['lead'] },
    { label: 'TypeScript', count: 5, sources: ['lead'] }
  ],
  organizations: ['Acme Corp', 'Globex'],
  roleCount: 2
}

describe('SkillCoreGroupCard', () => {
  it('renders group metadata, skills and role summary', () => {
    const wrapper = mount(SkillCoreGroupCard, {
      props: {
        group
      }
    })

    expect(wrapper.get('h3').text()).toBe(group.title)
    expect(wrapper.text()).not.toContain(group.description as string)

    const items = wrapper.findAll('li')
    expect(items).toHaveLength(group.skills.length)
    expect(items[0].text()).toContain('Nuxt')

    const summary = wrapper.findAll('p')
      .find(node => node.text().includes('Active across'))
    expect(summary).toBeDefined()
    expect(summary?.text()).toContain('Active across 2 roles')
    expect(summary?.text()).toContain('Acme Corp')
    expect(summary?.text()).toContain('Globex')
  })

  it('omits summary when roleCount is undefined', () => {
    const wrapper = mount(SkillCoreGroupCard, {
      props: {
        group: {
          ...group,
          roleCount: 0,
          organizations: []
        }
      }
    })

    const summary = wrapper.findAll('p')
      .find(node => node.text().includes('Active across'))
    expect(summary).toBeUndefined()
  })
})
