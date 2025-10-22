import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import CardSurface from '~/components/ui/CardSurface.vue'

const getClassTokens = (wrapper: ReturnType<typeof mount>) =>
  wrapper.attributes('class')?.split(/\s+/).filter(Boolean) ?? []

describe('CardSurface', () => {
  it('renders with default classes and forwards attributes', () => {
    const wrapper = mount(CardSurface, {
      attrs: {
        id: 'card',
        'data-testid': 'card-surface'
      },
      slots: {
        default: () => h('p', null, 'Content')
      }
    })

    const classes = getClassTokens(wrapper)
    expect(classes).toContain('bg-white')
    expect(classes).toContain('shadow-card')
    expect(classes).toContain('rounded-3xl')
    expect(classes).toContain('p-6')
    expect(wrapper.attributes('id')).toBe('card')
    expect(wrapper.attributes('data-testid')).toBe('card-surface')
    expect(wrapper.html()).toContain('<p>Content</p>')
  })

  it('applies rounding, padding, hoverable, surfaceClass and merged class tokens', () => {
    const wrapper = mount(CardSurface, {
      props: {
        rounded: 'lg',
        padding: 'lg',
        hoverable: true,
        surfaceClass: 'border border-sage-200'
      },
      attrs: {
        class: ['custom', { 'border-sage-200': true }, 'custom']
      },
      slots: {
        default: () => h('span', null, 'Details')
      }
    })

    const classes = getClassTokens(wrapper)
    expect(classes).toContain('rounded-[2rem]')
    expect(classes).toContain('p-8')
    expect(classes).toContain('border')
    expect(classes).toContain('border-sage-200')
    expect(classes).toContain('custom')
    expect(classes.filter(token => token === 'custom')).toHaveLength(1)
    expect(classes).toContain('transition-shadow')
  })

  it('supports rendering as alternate tags', () => {
    const wrapper = mount(CardSurface, {
      props: {
        tag: 'section'
      }
    })

    expect(wrapper.element.tagName.toLowerCase()).toBe('section')
  })
})
