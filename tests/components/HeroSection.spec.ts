import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import HeroSection from '../../components/HeroSection.vue'
import type { HeroContent } from '../../types/content'

const observerState = vi.hoisted(() => ({
  callbacks: [] as Array<(entries: Array<Pick<IntersectionObserverEntry, 'intersectionRatio' | 'isIntersecting'>>) => void>
}))

const contactControlsState = vi.hoisted(() => ({
  current: null as ReturnType<typeof createContactControlsState> | null
}))

const heroContactControlsArgs = vi.hoisted(() => ({
  last: null as null | Record<string, unknown>
}))

const heroContactControlsFactory = vi.hoisted(() => ({
  mock: vi.fn((options: Record<string, unknown>) => {
    heroContactControlsArgs.last = options
    return contactControlsState.current as ReturnType<typeof createContactControlsState>
  })
}))

const runtimeConfigState = vi.hoisted(() => ({
  heroTooltipTrace: false,
  tooltipProgressDuration: 4000,
  tooltipRestDelay: 220
}))

vi.mock('@vueuse/core', () => ({
  useIntersectionObserver: vi.fn((_target: unknown, callback: (entries: Array<Pick<IntersectionObserverEntry, 'intersectionRatio' | 'isIntersecting'>>) => void) => {
    observerState.callbacks.push(callback)
    return () => {}
  }),
  useEventListener: vi.fn(() => vi.fn()),
  useResizeObserver: vi.fn(() => vi.fn())
}))

vi.mock('~/composables/useHeroContactControls', () => ({
  useHeroContactControls: heroContactControlsFactory.mock
}))

const useHeroContactControlsMock = heroContactControlsFactory.mock

vi.mock('~/composables/useHeroVisuals', () => {
  const { ref } = require('vue') as typeof import('vue')
  return {
    useHeroVisuals: () => ({
      heroBackdropStyle: ref({ backgroundColor: '#18291f' }),
      heroTextureOverlayStyle: ref({}),
      heroNoiseOverlayStyle: ref({})
    })
  }
})

const HeroStickyNavStub = defineComponent({
  name: 'HeroStickyNav',
  props: {
    visible: { type: Boolean, default: false },
    resumeIsDownloading: { type: Boolean, default: false },
    resumeDownloadProgressDisplay: { type: Number, default: null },
    resumeAnnouncementText: { type: String, default: null }
  },
  emits: ['height-change', 'start-resume-download', 'toggle-nav-email', 'copy-email', 'mailto'],
  setup(props, { emit, expose }) {
    const triggerHeight = (height: number) => emit('height-change', height)
    const triggerToggleEmail = (href: string) => emit('toggle-nav-email', href)
    const triggerResumeDownload = () => emit('start-resume-download')
    expose({ triggerHeight, triggerToggleEmail, triggerResumeDownload })
    return () =>
      props.visible
        ? h('button', { 'data-testid': 'hero-sticky-nav', onClick: triggerResumeDownload })
        : null
  }
})

const HeroPrimaryContentStub = defineComponent({
  name: 'HeroPrimaryContent',
  props: {
    resumeIsDownloading: { type: Boolean, required: true },
    resumeDownloadProgressDisplay: { type: [Number, null], default: null },
    resumeAnnouncementText: { type: [String, null], default: null }
  },
  emits: ['start-resume-download', 'toggle-hero-email', 'copy-email', 'mailto'],
  setup(_props, { emit }) {
    return () =>
      h('button', { 'data-testid': 'hero-primary-content', onClick: () => emit('start-resume-download') })
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
  visual: null,
  social: [
    { href: 'mailto:anthony@example.com', label: 'Email', icon: 'email' },
    { href: 'https://github.com/dequasar', label: 'GitHub', icon: 'github' }
  ]
}

beforeAll(() => {
  vi.stubGlobal('useRuntimeConfig', () => ({
    public: {
      heroTooltipTrace: runtimeConfigState.heroTooltipTrace,
      tooltipProgressDuration: runtimeConfigState.tooltipProgressDuration,
      tooltipRestDelay: runtimeConfigState.tooltipRestDelay
    }
  }))
})

afterEach(() => {
  document.body.innerHTML = ''
})

afterAll(() => {
  vi.unstubAllGlobals()
})

beforeEach(() => {
  contactControlsState.current = createContactControlsState()
  observerState.callbacks.length = 0
  ;(process as unknown as { client?: boolean }).client = true
  document.documentElement.style.removeProperty('--sticky-nav-height')
  vi.clearAllMocks()
  runtimeConfigState.heroTooltipTrace = false
  heroContactControlsArgs.last = null
})

function createContactControlsState() {
  const closeEmailPanel = vi.fn()
  const showHeroEmailPanel = ref(false)
  const showNavEmailPanel = ref(false)
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
    showNavEmailPanel,
    showHeroEmailPanel,
    activeEmailHref: ref<string | null>(null),
    toggleHeroEmailPanel: vi.fn(),
    toggleNavEmailPanel: vi.fn(),
    copyEmail: vi.fn(),
    handleMailtoLink: vi.fn(),
    closeEmailPanel,
    recordHeroTooltipTrace: vi.fn()
  }
}

const mountHeroSection = () => {
  const wrapper = mount(HeroSection, {
    attachTo: document.body,
    props: {
      hero: heroContent
    },
    global: {
      components: {
        HeroStickyNav: HeroStickyNavStub,
        HeroPrimaryContent: HeroPrimaryContentStub,
        HeroBackgroundLayers: HeroBackgroundLayersStub
      },
      stubs: {
        Transition: false,
        Teleport: true
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

describe('HeroSection', () => {
  it('closes the hero email panel when sticky nav becomes visible', async () => {
    const wrapper = mountHeroSection()
    const controls = contactControlsState.current!
    controls.showHeroEmailPanel.value = true
    controls.activeEmailHref.value = 'mailto:anthony@example.com'

    await triggerIntersection(0)

    expect(controls.closeEmailPanel).toHaveBeenCalledWith({ returnFocus: false })
    wrapper.unmount()
  })

  it('closes the nav email panel when sticky nav hides again', async () => {
    const wrapper = mountHeroSection()
    const controls = contactControlsState.current!

    await triggerIntersection(0)
    controls.showNavEmailPanel.value = true
    controls.closeEmailPanel.mockClear()

    await triggerIntersection(1)

    expect(controls.closeEmailPanel).toHaveBeenCalled()
    expect(controls.closeEmailPanel.mock.calls.at(-1)?.[0]).toBeUndefined()
    wrapper.unmount()
  })

  it('applies and clears the sticky nav height CSS variable', async () => {
    const wrapper = mountHeroSection()
    await triggerIntersection(0)

    const sticky = wrapper.findComponent(HeroStickyNavStub)
    expect(sticky.exists()).toBe(true)
    sticky.vm.$emit('height-change', 142)
    await nextTick()

    expect(document.documentElement.style.getPropertyValue('--sticky-nav-height')).toBe('142px')

    wrapper.unmount()
    const afterValue = document.documentElement.style.getPropertyValue('--sticky-nav-height')
    expect(afterValue).not.toBe('142px')
    expect(['', '0px']).toContain(afterValue)
  })

  it('forwards resume download events from the hero primary content to the composable', async () => {
    const wrapper = mountHeroSection()
    const controls = contactControlsState.current!
    controls.startResumeDownload.mockClear()

    const primary = wrapper.findComponent(HeroPrimaryContentStub)
    expect(primary.exists()).toBe(true)

    primary.vm.$emit('start-resume-download')
    expect(controls.startResumeDownload).toHaveBeenCalledTimes(1)

    controls.resumeIsDownloading.value = true
    controls.resumeDownloadProgressDisplay.value = 68
   controls.resumeAnnouncementText.value = 'Preparing résumé download'
    await nextTick()

    const updatedPrimary = wrapper.findComponent(HeroPrimaryContentStub)
    expect(updatedPrimary.props('resumeIsDownloading')).toBe(true)
    expect(updatedPrimary.props('resumeDownloadProgressDisplay')).toBe(68)
    expect(updatedPrimary.props('resumeAnnouncementText')).toBe('Preparing résumé download')

    wrapper.unmount()
  })

  it('forwards resume download events from the sticky nav and syncs download state', async () => {
    const wrapper = mountHeroSection()
    const controls = contactControlsState.current!
    await triggerIntersection(0)

    const sticky = wrapper.findComponent(HeroStickyNavStub)
    expect(sticky.exists()).toBe(true)
    controls.startResumeDownload.mockClear()

    sticky.vm.$emit('start-resume-download')
    expect(controls.startResumeDownload).toHaveBeenCalledTimes(1)

    controls.resumeIsDownloading.value = true
    controls.resumeDownloadProgressDisplay.value = 32
    controls.resumeAnnouncementText.value = 'Résumé downloading'
    await nextTick()

    const refreshedSticky = wrapper.findComponent(HeroStickyNavStub)
    expect(refreshedSticky.props('resumeIsDownloading')).toBe(true)
    expect(refreshedSticky.props('resumeDownloadProgressDisplay')).toBe(32)
    expect(refreshedSticky.props('resumeAnnouncementText')).toBe('Résumé downloading')

    wrapper.unmount()
  })

  it('enables tooltip trace mode when runtime configuration requests it', () => {
    runtimeConfigState.heroTooltipTrace = true
    contactControlsState.current = createContactControlsState()

    const wrapper = mountHeroSection()

    expect(heroContactControlsArgs.last).not.toBeNull()
    expect(heroContactControlsArgs.last).toEqual(
      expect.objectContaining({
        enableTrace: true
      })
    )

    wrapper.unmount()
  })
})
