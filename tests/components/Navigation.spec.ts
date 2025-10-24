/* eslint-disable vue/one-component-per-file */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, ref, computed } from 'vue'
import Navigation from '../../components/navigation/Navigation.vue'
import type { HeroContent } from '../../types/content'
import { isExternalUrl } from '../../utils/url'

vi.mock('@vueuse/core', () => ({
  useEventListener: vi.fn(() => vi.fn()),
  useResizeObserver: vi.fn(() => vi.fn()),
  useIntersectionObserver: vi.fn(() => vi.fn())
}))

const ButtonStub = defineComponent({
  name: 'ButtonStub',
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
    href: { type: String, required: true },
    target: { type: String, default: undefined },
    rel: { type: String, default: undefined }
  },
  emits: ['click'],
  setup(props, { attrs, slots, emit }) {
    const resolvedTarget = computed(() => props.target ?? (isExternalUrl(props.href) ? '_blank' : undefined))
    const resolvedRel = computed(() => {
      if (resolvedTarget.value === '_blank') {
        return props.rel ?? 'noopener noreferrer'
      }
      return props.rel
    })

    return () =>
      h(
        'a',
        {
          href: props.href,
          target: resolvedTarget.value,
          rel: resolvedRel.value,
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

const ThemeToggleStub = defineComponent({
  name: 'ThemeToggleStub',
  setup() {
    return () => h('button', { 'data-testid': 'theme-toggle-stub' })
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
  return mount(Navigation, {
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
        Button: ButtonStub,
        AppLink: AppLinkStub,
        ThemeToggle: ThemeToggleStub,
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

describe('Navigation', () => {
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

    const copyButton = wrapper.findAllComponents(ButtonStub).find((button) => button.text().includes('Copy email address'))
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

  it('applies success styling and icon to nav toggle when copyState is copied', async () => {
    const wrapper = createWrapper({
      copyState: 'copied'
    })
    await flushPromises()
    const toggleButtons = wrapper.findAll('button[aria-label="Toggle email options"]')
    expect(toggleButtons.length).toBeGreaterThan(0)
    toggleButtons.forEach((button) => {
      expect(button.attributes()['data-copy-state']).toBe('copied')
      expect(button.html()).toContain('polyline points="20 6 9 17 4 12"')
      expect(button.classes()).toContain('!bg-sage-600')
    })
  })

  it('applies error styling to nav toggle when copyState is error', async () => {
    const wrapper = createWrapper({
      copyState: 'error'
    })
    await flushPromises()
    const toggleButton = wrapper.find('button[aria-label="Toggle email options"]')
    expect(toggleButton.attributes()['data-copy-state']).toBe('error')
    expect(toggleButton.classes()).toContain('!bg-rose-500/95')
  })

  it('opens external social links in a new tab without forcing internal links to new windows', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    const socialLink = wrapper.get('a[aria-label="GitHub"]')
    expect(socialLink.attributes('target')).toBe('_blank')

    const resumeLinks = wrapper.findAll('a[aria-label="Download résumé"]')
    expect(resumeLinks.length).toBeGreaterThan(0)
    resumeLinks.forEach((link) => {
      expect(link.attributes('target')).toBeUndefined()
    })

    const mailLinks = wrapper.findAll('a[href="mailto:anthony@example.com"]')
    mailLinks.forEach((link) => {
      expect(link.attributes('target')).toBeUndefined()
    })
  })
})
