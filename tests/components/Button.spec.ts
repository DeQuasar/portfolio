import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '~/components/ui/Button.vue'

const getClassTokens = (wrapper: ReturnType<typeof mount>) =>
  wrapper.attributes('class')?.split(/\s+/).filter(Boolean) ?? []

const variantExpectations: Record<string, string[]> = {
  primary: ['bg-sage-600', 'hover:bg-sage-700', 'motion-safe:hover:-translate-y-0.5', 'active:translate-y-0.5'],
  secondary: ['border-sage-300', 'motion-safe:hover:-translate-y-0.5', 'motion-safe:hover:shadow-md', 'active:translate-y-0.5'],
  ghost: ['border-dashed', 'motion-safe:hover:-translate-y-0.5', 'active:translate-y-0.5'],
  minimal: ['text-sage-500', 'motion-safe:hover:-translate-y-0.5', 'active:translate-y-0.5'],
  icon: ['h-12', 'w-12', 'motion-safe:hover:-translate-y-0.5', 'active:translate-y-0.5']
}

describe('Button', () => {
  it('applies the primary variant classes by default and de-duplicates merged class tokens', () => {
    const wrapper = mount(Button, {
      attrs: {
        class: ['shadow-md', { 'shadow-md': true }, 'custom-token']
      },
      slots: {
        default: () => 'Primary'
      }
    })

    const classes = getClassTokens(wrapper)
    expect(classes).toContain('bg-sage-600')
    expect(classes).toContain('text-white')
    expect(classes.filter(token => token === 'shadow-md')).toHaveLength(1)
    expect(classes).toContain('custom-token')
  })

  it('adds the `w-full` token when block is true', () => {
    const wrapper = mount(Button, {
      props: {
        block: true
      },
      slots: {
        default: () => 'Full width'
      }
    })

    expect(getClassTokens(wrapper)).toContain('w-full')
  })

  it('applies alternate variants and forwards attributes', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'icon',
        type: 'submit'
      },
      attrs: {
        'data-testid': 'icon-button',
        disabled: true,
        title: 'Add project'
      },
      slots: {
        default: () => 'Icon'
      }
    })

    const classes = getClassTokens(wrapper)
    expect(classes).toContain('h-12')
    expect(classes).toContain('w-12')
    expect(wrapper.attributes('type')).toBe('submit')
    expect(wrapper.attributes('data-testid')).toBe('icon-button')
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('title')).toBe('Add project')
  })

  it.each(
    Object.entries(variantExpectations) as Array<[keyof typeof variantExpectations, string[]]>
  )('applies expected classes for the %s variant', (variant, expectedTokens) => {
    const wrapper = mount(Button, {
      props: {
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

  it('exposes the focus method that proxies to the underlying element', async () => {
    const wrapper = mount(Button, {
      attachTo: document.body,
      slots: {
        default: () => 'Focusable'
      }
    })

    const focusSpy = vi.spyOn(wrapper.element as HTMLButtonElement, 'focus')
    ;(wrapper.vm as unknown as { focus: (options?: FocusOptions) => void }).focus()

    expect(focusSpy).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })
})
