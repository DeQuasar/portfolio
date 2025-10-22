import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import SectionHeader from '~/components/ui/SectionHeader.vue'

describe('SectionHeader', () => {
  it('renders eyebrow, title and description with center alignment by default', () => {
    const wrapper = mount(SectionHeader, {
      props: {
        title: 'Experience',
        eyebrow: 'Section',
        description: 'Highlights from recent projects.'
      }
    })

    const header = wrapper.get('header')
    expect(header.classes()).toContain('items-center')
    expect(header.classes()).toContain('text-center')
    expect(wrapper.get('p.text-xs').text()).toBe('Section')
    expect(wrapper.get('h2').text()).toBe('Experience')
    const description = wrapper.get('p.max-w-2xl')
    expect(description.text()).toContain('Highlights')
    expect(description.classes()).toContain('mx-auto')
  })

  it('supports left alignment and accent bars', () => {
    const wrapper = mount(SectionHeader, {
      props: {
        title: 'Skillset',
        description: 'Toolbox',
        align: 'left',
        accent: 'double-bar'
      }
    })

    const header = wrapper.get('header')
    expect(header.classes()).toContain('items-start')
    expect(header.classes()).toContain('text-left')

    const accentBars = wrapper.findAll('span.bg-sage-500, span.bg-sage-300')
    expect(accentBars).toHaveLength(2)

    const description = wrapper.get('p.max-w-2xl')
    expect(description.classes()).not.toContain('mx-auto')
  })

  it('allows slot overrides for eyebrow, title and description', () => {
    const wrapper = mount(SectionHeader, {
      props: {
        title: 'Ignored title'
      },
      slots: {
        eyebrow: () => h('p', { class: 'custom-eyebrow' }, 'Slot Eyebrow'),
        title: () => h('h3', { class: 'custom-title' }, 'Slot Title'),
        description: () => h('div', { class: 'custom-description' }, 'Slot Description')
      }
    })

    expect(wrapper.find('.text-xs').exists()).toBe(false)
    expect(wrapper.get('.custom-eyebrow').text()).toBe('Slot Eyebrow')
    expect(wrapper.get('.custom-title').text()).toBe('Slot Title')
    expect(wrapper.get('.custom-description').text()).toBe('Slot Description')
  })
})
