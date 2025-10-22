import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppLink from '~/components/ui/AppLink.vue'

const getClassTokens = (wrapper: ReturnType<typeof mount>) =>
  wrapper.attributes('class')?.split(/\s+/).filter(Boolean) ?? []

const variantExpectations = {
  primary: ['bg-sage-500', 'text-white'],
  secondary: ['border-sage-300', 'shadow-sm'],
  ghost: ['border-dashed', 'bg-white/60'],
  icon: ['h-12', 'w-12'],
  minimal: ['text-sage-600', 'hover:text-sage-700'],
  cta: ['bg-gradient-to-r', 'uppercase', 'tracking-[0.16em]']
} as const

describe('AppLink', () => {
  it('renders with secondary variant by default and merges custom classes', () => {
    const wrapper = mount(AppLink, {
      props: {
        href: '/about'
      },
      attrs: {
        class: ['border', { border: true }, 'custom-link']
      },
      slots: {
        default: () => 'About'
      }
    })

    const classes = getClassTokens(wrapper)
    expect(classes).toContain('border-sage-300')
    expect(classes).toContain('border')
    expect(classes).toContain('custom-link')
    expect(classes.filter(token => token === 'border')).toHaveLength(1)
    expect(wrapper.attributes('href')).toBe('/about')
  })

  it('applies block display and derives noopener rel for target blank', () => {
    const wrapper = mount(AppLink, {
      props: {
        href: 'https://example.com',
        target: '_blank',
        block: true
      },
      slots: {
        default: () => 'External'
      }
    })

    const classes = getClassTokens(wrapper)
    expect(classes).toContain('w-full')
    expect(wrapper.attributes('target')).toBe('_blank')
    expect(wrapper.attributes('rel')).toContain('noopener')
    expect(wrapper.attributes('rel')).toContain('noreferrer')
  })

  it('respects explicit rel and emits click events', async () => {
    const onClick = vi.fn()
    const wrapper = mount(AppLink, {
      props: {
        href: '#cta',
        target: '_blank',
        rel: 'noreferrer',
        onClick
      },
      attrs: {
        'data-testid': 'cta-link'
      },
      slots: {
        default: () => 'CTA'
      }
    })

    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
   expect(wrapper.attributes('rel')).toBe('noreferrer')
   expect(wrapper.attributes('data-testid')).toBe('cta-link')
 })

  it.each(
    Object.entries(variantExpectations) as Array<[keyof typeof variantExpectations, string[]]>
  )('applies expected classes for %s variant', (variant, expectedTokens) => {
    const wrapper = mount(AppLink, {
      props: {
        href: '#variant',
        variant: variant as never
      },
      slots: {
        default: () => variant
      }
    })

    const classes = getClassTokens(wrapper)
    expectedTokens.forEach(token => {
      expect(classes).toContain(token)
    })
  })
})
