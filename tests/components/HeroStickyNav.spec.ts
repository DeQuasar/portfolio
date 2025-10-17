import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import HeroStickyNav from '../../components/hero/HeroStickyNav.vue'
import type { HeroContent } from '../../types/content'

vi.mock('@vueuse/core', () => ({
  useEventListener: vi.fn(() => vi.fn()),
  useResizeObserver: vi.fn(() => vi.fn())
}))

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

const createWrapper = (overrides: Record<string, unknown> = {}) => {
  return mount(HeroStickyNav, {
    attachTo: document.body,
    props: {
      visible: true,
      hero: baseHero,
      emailLink: {
        href: 'mailto:anthony@example.com',
        label: 'Email Anthony',
        iconKey: 'email'
      },
      otherSocials: [
        { href: 'https://github.com/dequasar', label: 'GitHub', iconKey: 'github' }
      ],
      resumeIsDownloading: false,
      resumeDownloadProgressDisplay: null,
      resumeAnnouncementText: null,
      showNavEmailPanel: false,
      activeEmailHref: null,
      copyState: 'idle',
      emailPanelReady: false,
      navEmailTriggerRef: { value: null },
      emailPanelRef: { value: null },
      emailCopyButtonRef: { value: null },
      ...overrides
    },
    global: {
      stubs: {
        AppButton: AppButtonStub,
        AppLink: AppLinkStub,
        Transition: false,
        Teleport: true
      }
    }
  })
}

let originalOffsetHeight: PropertyDescriptor | undefined

beforeAll(() => {
  originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get() {
      return 128
    }
  })
})

afterAll(() => {
  if (originalOffsetHeight) {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight)
  } else {
    delete (HTMLElement.prototype as { offsetHeight?: number }).offsetHeight
  }
})

describe('HeroStickyNav', () => {
  it('emits height-change after mounting when visible', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    const emitted = wrapper.emitted<'height-change', [number]>('height-change')
    expect(emitted).toBeTruthy()
    const lastHeight = emitted?.[emitted.length - 1]?.[0]
    expect(lastHeight).toBe(128)
  })

  it('emits toggle event for nav email button and renders panel when open', async () => {
    const wrapper = createWrapper({
      showNavEmailPanel: true,
      activeEmailHref: 'mailto:anthony@example.com',
      emailPanelReady: true
    })

    await flushPromises()

    const toggleButton = wrapper.get('button[aria-label="Toggle email options"]')
    await toggleButton.trigger('click')
    const emitted = wrapper.emitted<'toggle-nav-email', [string]>('toggle-nav-email')
    expect(emitted?.at(-1)?.[0]).toBe('mailto:anthony@example.com')

    const panel = document.body.querySelector('div[role="group"][aria-label="Email options"]')
    expect(panel).toBeTruthy()
  })

  it('emits copy-email and mailto events from dropdown actions', async () => {
    const wrapper = createWrapper({
      showNavEmailPanel: true,
      activeEmailHref: 'mailto:anthony@example.com',
      emailPanelReady: true
    })

    await flushPromises()

    const copyButton = wrapper.findAllComponents(AppButtonStub).find((button) => button.text().includes('Copy email address'))
    expect(copyButton).toBeTruthy()
    await copyButton!.trigger('click')
    const copyEmitted = wrapper.emitted<'copy-email', [string]>('copy-email')
    expect(copyEmitted?.at(-1)?.[0]).toBe('mailto:anthony@example.com')

    const mailLink = wrapper.findAllComponents(AppLinkStub).find((link) => link.text().includes('Open in mail app'))
    expect(mailLink).toBeTruthy()
    await mailLink!.trigger('click')
    const mailtoEmitted = wrapper.emitted<'mailto', []>('mailto')
    expect(mailtoEmitted?.length).toBeGreaterThan(0)
  })

  it('disables resume button when downloading', async () => {
    const wrapper = createWrapper({
      resumeIsDownloading: true
    })
    await flushPromises()
    const ctas = wrapper.findAll('a[aria-label="Downloading résumé"]')
    expect(ctas.length).toBeGreaterThan(0)
    expect(ctas.some((cta) => cta.classes().includes('pointer-events-none'))).toBe(true)
  })
})
