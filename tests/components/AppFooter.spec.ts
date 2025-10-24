import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '~/components/AppFooter.vue'

describe('AppFooter', () => {
  it('renders the legal notice without any links', () => {
    const wrapper = mount(AppFooter)
    const footer = wrapper.get('footer')
    const currentYear = new Date().getFullYear().toString()

    expect(footer.text()).toContain(`© ${currentYear} Anthony Protano — Senior Software Developer`)
    expect(footer.find('a').exists()).toBe(false)
  })
})
