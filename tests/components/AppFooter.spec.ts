import { describe, expect, it, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, ref, Suspense } from 'vue'
import AppFooter from '~/components/AppFooter.vue'
import type { ContactContent } from '~/types/content'

const contactData = ref<ContactContent | null>(null)

vi.mock('~/composables/useContentSources', () => ({
  useContactContent: vi.fn(async () => ({
    data: contactData
  }))
}))

const SuspenseWrapper = defineComponent({
  setup () {
    return () => h(Suspense, null, {
      default: () => h(AppFooter)
    })
  }
})

const renderFooter = () =>
  mount(SuspenseWrapper, {
    attachTo: document.body
  })

describe('AppFooter', () => {
  beforeEach(() => {
    contactData.value = {
      email: 'anthony@example.com',
      github: 'https://github.com/dequasar',
      linkedin: 'https://www.linkedin.com/in/anthony-protano/',
      message: 'Let’s talk!',
      resumeUrl: '/download/resume',
      availability: 'Available'
    }
  })

  it('renders contact actions with expected links', async () => {
    const wrapper = renderFooter()
    await flushPromises()
    const footer = wrapper.getComponent(AppFooter)

    const email = footer.get('[href="mailto:anthony@example.com"]')
    const linkedin = footer.get('[href="https://www.linkedin.com/in/anthony-protano/"]')
    const github = footer.get('[href="https://github.com/dequasar"]')

    expect(email.text()).toBe('Email')
    expect(linkedin.attributes('target')).toBe('_blank')
    expect(linkedin.attributes('rel')).toContain('noopener')
    expect(github.attributes('target')).toBe('_blank')
  })

  it('omits links when data is missing', async () => {
    contactData.value = {
      message: 'Let’s talk!',
      resumeUrl: '/download/resume',
      availability: 'Available'
    } as ContactContent

    const wrapper = renderFooter()
    await flushPromises()
    const footer = wrapper.getComponent(AppFooter)

    expect(footer.find('[href^="mailto:"]').exists()).toBe(false)
    expect(footer.find('[href*="linkedin"]').exists()).toBe(false)
    expect(footer.find('[href*="github"]').exists()).toBe(false)
  })
})
