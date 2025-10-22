import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from '~/components/ui/AppButton.vue'

const getClassTokens = (wrapper: ReturnType<typeof mount>) =>
  wrapper.attributes('class')?.split(/\s+/).filter(Boolean) ?? []

const variantExpectations: Record<string, string[]> = {
  primary: ['bg-sage-600', 'hover:bg-sage-700'],
  secondary: ['border', 'border-sage-300', 'shadow-sm'],
  ghost: ['border', 'border-dashed', 'bg-white/60'],
  minimal: ['text-sage-500', 'font-medium'],
  icon: ['h-12', 'w-12']
}

describe('AppButton', () => {
  it('applies the primary variant classes by default and de-duplicates merged class tokens', () => {
    const wrapper = mount(AppButton, {
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
    const wrapper = mount(AppButton, {
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
    const wrapper = mount(AppButton, {
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
    const wrapper = mount(AppButton, {
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
    const wrapper = mount(AppButton, {
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
