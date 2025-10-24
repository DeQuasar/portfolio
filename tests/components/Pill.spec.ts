import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Pill from '~/components/ui/Pill.vue'

const getClassTokens = (wrapper: ReturnType<typeof mount>) =>
  wrapper.attributes('class')?.split(/\s+/).filter(Boolean) ?? []

describe('Pill', () => {
  it('renders default tone and size with merged class tokens', () => {
    const wrapper = mount(Pill, {
      slots: {
        default: () => 'Neutral'
      },
      attrs: {
        class: ['extra-token', { uppercase: true }, 'extra-token']
      }
    })

    const classes = getClassTokens(wrapper)
    expect(classes).toContain('bg-sage-100')
    expect(classes).toContain('text-sage-700')
    expect(classes).toContain('extra-token')
    expect(classes.filter(token => token === 'extra-token')).toHaveLength(1)
    expect(wrapper.text()).toBe('Neutral')
  })

  it('applies tone, size and uppercase modifiers while forwarding attributes', () => {
    const wrapper = mount(Pill, {
      props: {
        tone: 'neutral',
        size: 'sm',
        uppercase: true,
        tag: 'a'
      },
      attrs: {
        href: '#cta',
        'data-testid': 'cta-pill'
      },
      slots: {
        default: () => 'Take Action'
      }
    })

    const classes = getClassTokens(wrapper)
    expect(classes).toContain('bg-white')
    expect(classes).toContain('text-xs')
    expect(classes).toContain('uppercase')

    expect(wrapper.element.tagName.toLowerCase()).toBe('a')
    expect(wrapper.attributes('href')).toBe('#cta')
    expect(wrapper.attributes('data-testid')).toBe('cta-pill')
  })
})
