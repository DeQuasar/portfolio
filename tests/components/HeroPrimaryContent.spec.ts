import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick, defineComponent, ref } from 'vue'
import HeroPrimaryContent from '../../components/hero/HeroPrimaryContent.vue'
import type { HeroContent } from '../../types/content'

const AppButtonStub = defineComponent({
  name: 'AppButtonStub',
  inheritAttrs: false,
  emits: ['click'],
  setup(_props, { attrs, slots, emit, expose }) {
    const root = ref<HTMLButtonElement | null>(null)
    expose({ el: root })
    return () =>
      h(
        'button',
        {
          type: 'button',
          ref: root,
          ...attrs,
          onClick: (event: MouseEvent) => emit('click', event)
        },
        slots.default?.()
      )
  }
})

const AppLinkStub = defineComponent({
  name: 'AppLinkStub',
  inheritAttrs: false,
  props: {
    href: { type: String, required: true }
  },
  emits: ['click'],
  setup(props, { attrs, slots, emit }) {
    return () =>
      h(
        'a',
        {
          href: props.href,
          ...attrs,
          onClick: (event: MouseEvent) => {
            event.preventDefault()
            emit('click', event)
          }
        },
        slots.default?.()
      )
  }
})

const baseHero: HeroContent = {
  name: 'Anthony Protano',
  role: 'Senior Full-Stack Engineer',
  headline: 'Build resilient, high-impact products',
  subheadline: 'Helping teams ship steady, measurable improvements across the full stack.',
  primaryCta: {
    href: '/resume.pdf',
    label: 'Download résumé'
  },
  visual: null,
  social: []
}

const tooltipPreset = {
  background: '#000',
  borderColor: '#111',
  bubbleShadow: 'none',
  iconBackground: '#222',
  iconShadow: 'none',
  textColor: '#fff',
  arrowShadow: 'none'
}

const mountHeroPrimary = (overrides: Record<string, unknown> = {}) => {
  return mount(HeroPrimaryContent, {
    props: {
      hero: baseHero,
      description: baseHero.subheadline ?? '',
      resumeIsDownloading: false,
      resumeDownloadProgressDisplay: null,
      resumeAnnouncementText: null,
      emailLink: {
        href: 'mailto:anthony@example.com',
        label: 'Email Anthony',
        iconKey: 'email'
      },
      otherSocials: [
        { href: 'https://github.com/dequasar', label: 'GitHub', iconKey: 'github' },
        { href: 'https://linkedin.com/in/anthony', label: 'LinkedIn', iconKey: 'linkedin' }
      ],
      showHeroEmailPanel: false,
      activeEmailHref: null,
      copyState: 'idle',
      tooltipVariant: 'idle',
      tooltipHeading: 'Copy email address',
      activeTooltipPreset: tooltipPreset,
      tooltipArrowStyle: {},
      floatingStyles: {},
      tooltipAnchorSource: 'hero',
      tooltipReady: false,
      emailTriggerRef: { value: null },
      emailPanelRef: { value: null },
      emailCopyButtonRef: { value: null },
      tooltipBubbleRef: { value: null },
      tooltipArrowRef: { value: null },
      emailPanelReady: false,
      ...overrides
    },
    global: {
      stubs: {
        AppButton: AppButtonStub,
        AppLink: AppLinkStub
      }
    }
  })
}

const buildLongDescription = () =>
  'Shipping resilient experiences for high-growth teams with disciplined testing, steady delivery, and thoughtful mentorship across the stack while partnering closely with design, product, and support to ensure dependable outcomes.'

describe('HeroPrimaryContent', () => {
  it('truncates and expands the mobile summary when toggled', async () => {
    const wrapper = mountHeroPrimary({
      description: buildLongDescription()
    })

    const summary = wrapper.get('[data-testid="hero-mobile-summary-text"]')
    expect(summary.text().endsWith('…')).toBe(true)

    const toggleButton = wrapper.get('[data-testid="hero-mobile-summary"] button')
    expect(toggleButton.text()).toContain('Show full summary')
    expect(toggleButton.attributes()['aria-expanded']).toBe('false')

    await toggleButton.trigger('click')
    await nextTick()

    expect(wrapper.get('[data-testid="hero-mobile-summary-text"]').text()).toBe(buildLongDescription())
    const updatedToggle = wrapper.get('[data-testid="hero-mobile-summary"] button')
    expect(updatedToggle.text()).toContain('Show less')
    expect(updatedToggle.attributes()['aria-expanded']).toBe('true')
  })

  it('emits start-resume-download and displays progress text when provided', async () => {
    const wrapper = mountHeroPrimary({
      resumeDownloadProgressDisplay: 42,
      resumeAnnouncementText: 'Download starting'
    })

    const cta = wrapper.get('a[aria-label="Download résumé"]')
    expect(cta.text()).toContain('42%')

    await cta.trigger('click')

    const emitted = wrapper.emitted('start-resume-download')
    expect(emitted).toBeTruthy()
    expect(emitted?.length).toBe(1)
  })

  it('emits toggle event for email button and reflects open state', async () => {
    const wrapper = mountHeroPrimary({
      showHeroEmailPanel: true,
      activeEmailHref: 'mailto:anthony@example.com'
    })

    const emailButton = wrapper.get('button[aria-label="View email options"]')
    await emailButton.trigger('click')
    const emitted = wrapper.emitted('toggle-hero-email')
    expect(emitted?.[0]?.[0]).toBe('mailto:anthony@example.com')

    await nextTick()
    const caret = emailButton.get('svg[viewBox="0 0 24 24"]')
    expect(emailButton.html()).toContain('rotate-180')
  })

  it('renders download CTA in loading state when resume is downloading', () => {
    const wrapper = mountHeroPrimary({
      resumeIsDownloading: true
    })

    const cta = wrapper.get('a[aria-label="Downloading résumé"]')
    expect(cta.classes()).toContain('pointer-events-none')
  })
})
