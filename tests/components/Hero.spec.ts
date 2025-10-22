/* eslint-disable vue/one-component-per-file */
import { beforeAll, beforeEach, afterEach, afterAll, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import Hero from '../../components/hero/Hero.vue'
import type { HeroContent } from '../../types/content'
import { heroContactControlsInjectionKey } from '~/composables/heroContactControlsContext'
import { heroVisibilityInjectionKey } from '~/composables/heroVisibilityContext'

const observerState = vi.hoisted(() => ({
  callbacks: [] as Array<(entries: Array<Pick<IntersectionObserverEntry, 'intersectionRatio' | 'isIntersecting'>>) => void>
}))

const contactControlsState = vi.hoisted(() => ({
  current: null as ReturnType<typeof createContactControlsState> | null
}))

const heroVisibilityRef = ref(true)

vi.mock('@vueuse/core', () => ({
  useIntersectionObserver: vi.fn((_target: unknown, callback: (entries: Array<Pick<IntersectionObserverEntry, 'intersectionRatio' | 'isIntersecting'>>) => void) => {
    observerState.callbacks.push(callback)
    return () => {}
  })
}))

vi.mock('~/composables/useHeroVisuals', () => ({
  useHeroVisuals: () => ({
    heroBackdropStyle: ref({ backgroundColor: '#18291f' }),
    heroTextureOverlayStyle: ref({}),
    heroNoiseOverlayStyle: ref({})
  })
}))

const HeroPrimaryContentStub = defineComponent({
  name: 'HeroPrimaryContent',
  props: {
    resumeIsDownloading: { type: null, default: false },
    resumeDownloadProgressDisplay: { type: null, default: null },
    resumeAnnouncementText: { type: null, default: null },
    emailTriggerRef: { type: [Object, Function], required: true },
    emailPanelRef: { type: [Object, Function], required: true },
    emailCopyButtonRef: { type: [Object, Function], required: true },
    tooltipBubbleRef: { type: [Object, Function], required: true },
    tooltipArrowRef: { type: [Object, Function], required: true }
  },
  emits: ['start-resume-download', 'toggle-hero-email', 'copy-email', 'mailto'],
  setup(props, { emit, expose }) {
    type ButtonInstance = { el: HTMLButtonElement | null }
    const triggerDownload = () => emit('start-resume-download')
    const triggerToggleEmail = () => emit('toggle-hero-email', 'mailto:anthony@example.com')

    const buttonRef = ref<HTMLButtonElement | null>(null)
    const panelRef = ref<HTMLDivElement | null>(null)
    const copyButtonRef = ref<HTMLButtonElement | null>(null)
    const bubbleRef = ref<HTMLDivElement | null>(null)
    const arrowRef = ref<HTMLDivElement | null>(null)

    onMounted(() => {
      const triggerInstance: ButtonInstance = { el: buttonRef.value }
      const copyInstance: ButtonInstance = { el: copyButtonRef.value }
      if (typeof props.emailTriggerRef === 'function') {
        props.emailTriggerRef(triggerInstance)
      } else if (props.emailTriggerRef && 'value' in props.emailTriggerRef) {
        // @ts-expect-error loose assignment for test stub
        props.emailTriggerRef.value = triggerInstance
      }
      if (typeof props.emailPanelRef === 'function') {
        props.emailPanelRef(panelRef.value)
      } else if (props.emailPanelRef && 'value' in props.emailPanelRef) {
        // @ts-expect-error loose assignment for test stub
        props.emailPanelRef.value = panelRef.value
      }
      if (typeof props.emailCopyButtonRef === 'function') {
        props.emailCopyButtonRef(copyInstance)
      } else if (props.emailCopyButtonRef && 'value' in props.emailCopyButtonRef) {
        // @ts-expect-error loose assignment for test stub
        props.emailCopyButtonRef.value = copyInstance
      }
      if (typeof props.tooltipBubbleRef === 'function') {
        props.tooltipBubbleRef(bubbleRef.value)
      } else if (props.tooltipBubbleRef && 'value' in props.tooltipBubbleRef) {
        // @ts-expect-error loose assignment for test stub
        props.tooltipBubbleRef.value = bubbleRef.value
      }
      if (typeof props.tooltipArrowRef === 'function') {
        props.tooltipArrowRef(arrowRef.value)
      } else if (props.tooltipArrowRef && 'value' in props.tooltipArrowRef) {
        // @ts-expect-error loose assignment for test stub
        props.tooltipArrowRef.value = arrowRef.value
      }
    })

    onBeforeUnmount(() => {
      if (typeof props.emailTriggerRef === 'function') {
        props.emailTriggerRef(null)
      } else if (props.emailTriggerRef && 'value' in props.emailTriggerRef) {
        // @ts-expect-error loose assignment for test stub
        props.emailTriggerRef.value = null
      }
      if (typeof props.emailPanelRef === 'function') {
        props.emailPanelRef(null)
      } else if (props.emailPanelRef && 'value' in props.emailPanelRef) {
        // @ts-expect-error loose assignment for test stub
        props.emailPanelRef.value = null
      }
      if (typeof props.emailCopyButtonRef === 'function') {
        props.emailCopyButtonRef(null)
      } else if (props.emailCopyButtonRef && 'value' in props.emailCopyButtonRef) {
        // @ts-expect-error loose assignment for test stub
        props.emailCopyButtonRef.value = null
      }
      if (typeof props.tooltipBubbleRef === 'function') {
        props.tooltipBubbleRef(null)
      } else if (props.tooltipBubbleRef && 'value' in props.tooltipBubbleRef) {
        // @ts-expect-error loose assignment for test stub
        props.tooltipBubbleRef.value = null
      }
      if (typeof props.tooltipArrowRef === 'function') {
        props.tooltipArrowRef(null)
      } else if (props.tooltipArrowRef && 'value' in props.tooltipArrowRef) {
        // @ts-expect-error loose assignment for test stub
        props.tooltipArrowRef.value = null
      }
    })

    expose({ triggerDownload, triggerToggleEmail })

    return () =>
      h('div', { 'data-testid': 'hero-primary-content-wrapper' }, [
        h('button', {
          ref: buttonRef,
          'data-testid': 'hero-primary-content',
          onClick: triggerDownload,
          onContextmenu: (event: MouseEvent) => {
            event.preventDefault()
            triggerToggleEmail()
          }
        }),
        h('div', { ref: panelRef, style: 'display:none' }),
        h('button', { ref: copyButtonRef, style: 'display:none' }),
        h('div', { ref: bubbleRef, style: 'display:none' }),
        h('div', { ref: arrowRef, style: 'display:none' })
      ])
  }
})

const HeroBackgroundLayersStub = defineComponent({
  name: 'HeroBackgroundLayers',
  setup() {
    return () => h('div', { 'data-testid': 'hero-background-layers' })
  }
})

const heroContent: HeroContent = {
  name: 'Anthony Protano',
  role: 'Senior Full-Stack Engineer',
  headline: 'Build resilient, high-impact products',
  subheadline: 'Helping teams ship steady, measurable improvements across the full stack.',
  primaryCta: { href: '/resume.pdf', label: 'Download résumé' },
  secondaryCta: { href: '/contact', label: 'Get in touch' },
  metrics: [],
  location: 'Remote',
  social: [
    { href: 'mailto:anthony@example.com', label: 'Email', icon: 'email' },
    { href: 'https://github.com/dequasar', label: 'GitHub', icon: 'github' }
  ]
}

beforeAll(() => {
  ;(process as unknown as { client?: boolean }).client = true
})

afterEach(() => {
  observerState.callbacks.length = 0
  document.body.innerHTML = ''
  heroVisibilityRef.value = true
})

beforeEach(() => {
  contactControlsState.current = createContactControlsState()
})

afterAll(() => {
  contactControlsState.current = null
})

function createContactControlsState() {
  return {
    copyState: ref<'idle' | 'copied' | 'error'>('idle'),
    startResumeDownload: vi.fn(),
    resumeIsDownloading: ref(false),
    resumeAnnouncementText: ref<string | null>(null),
    resumeDownloadProgressDisplay: ref<number | null>(null),
    tooltipVariant: ref<'idle' | 'success' | 'error'>('idle'),
    tooltipHeading: ref('Copy email address'),
    activeTooltipPreset: ref({}),
    tooltipArrowStyle: ref({}),
    floatingStyles: ref({}),
    tooltipAnchorSource: ref<'hero' | 'nav'>('hero'),
    tooltipReady: ref(false),
    emailPanelReady: ref(false),
    emailTriggerEl: ref(null),
    navEmailTriggerEl: ref(null),
    emailPanelEl: ref(null),
    emailCopyButtonEl: ref(null),
    tooltipBubbleEl: ref(null),
    tooltipArrowEl: ref(null),
    showNavEmailPanel: ref(false),
    showHeroEmailPanel: ref(false),
    showEmailPanel: ref(false),
    activeEmailHref: ref<string | null>(null),
    toggleHeroEmailPanel: vi.fn(),
    toggleNavEmailPanel: vi.fn(),
    copyEmail: vi.fn(),
    handleMailtoLink: vi.fn(),
    closeEmailPanel: vi.fn(),
    recordHeroTooltipTrace: vi.fn()
  }
}

const mountHero = () => {
  const wrapper = mount(Hero, {
    attachTo: document.body,
    props: {
      hero: heroContent
    },
    global: {
      stubs: {
        HeroPrimaryContent: HeroPrimaryContentStub,
        HeroBackgroundLayers: HeroBackgroundLayersStub,
        Transition: false,
        Teleport: true
      },
      provide: {
        [heroContactControlsInjectionKey as symbol]: contactControlsState.current!,
        [heroVisibilityInjectionKey as symbol]: heroVisibilityRef
      }
    }
  })
  return wrapper
}

const triggerIntersection = async (ratio: number) => {
  observerState.callbacks.forEach((callback) => {
    callback([{ intersectionRatio: ratio, isIntersecting: ratio >= 0.2 }])
  })
  await nextTick()
}

describe('Hero', () => {
  it('forwards resume download events to the contact controls', async () => {
    const wrapper = mountHero()
    const controls = contactControlsState.current!
    controls.startResumeDownload.mockClear()

    const button = wrapper.get('[data-testid="hero-primary-content"]')

    await button.trigger('click')
    await nextTick()
    expect(controls.startResumeDownload).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('updates provided hero visibility when intersection observer changes', async () => {
    const wrapper = mountHero()
    heroVisibilityRef.value = true

    await triggerIntersection(0)
    expect(heroVisibilityRef.value).toBe(false)

    await triggerIntersection(0.6)
    expect(heroVisibilityRef.value).toBe(true)

    wrapper.unmount()
  })

  it('registers hero email trigger reference with contact controls', async () => {
    const wrapper = mountHero()
    const controls = contactControlsState.current!

    await nextTick()

    expect(controls.emailTriggerEl.value).not.toBeNull()
    expect(controls.emailPanelEl.value).not.toBeNull()
    expect(controls.emailCopyButtonEl.value).not.toBeNull()

    wrapper.unmount()
  })
})
