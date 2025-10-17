import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { computed, ref, type Ref } from 'vue'
import type { HeroContent } from '../../types/content'
import { useHeroContactControls } from '../../composables/useHeroContactControls'

type Listener = {
  target: unknown
  event: string
  handler: (event: unknown) => void
}

let clipboardState: Ref<'idle' | 'copied' | 'error'>
let copySpy: ReturnType<typeof vi.fn>
let resetSpy: ReturnType<typeof vi.fn>
let downloadSpy: ReturnType<typeof vi.fn>
let resumeIsDownloading: Ref<boolean>
let resumeAnnouncement: Ref<string>
let resumeProgress: Ref<number>
let floatingUpdateSpy: ReturnType<typeof vi.fn>
const registeredListeners: Listener[] = []

const stopListener = (listener: Listener) => {
  const index = registeredListeners.indexOf(listener)
  if (index >= 0) {
    registeredListeners.splice(index, 1)
  }
}

vi.mock('@vueuse/core', () => ({
  useEventListener: (target: unknown, event: string, handler: (event: unknown) => void) => {
    const listener = { target, event, handler }
    registeredListeners.push(listener)
    return () => stopListener(listener)
  },
  onClickOutside: vi.fn()
}))

const middlewareFns = vi.hoisted(() => {
  const create = (name: string) => {
    const fn = vi.fn((options?: unknown) => ({ name, options }))
    return fn
  }
  return {
    offset: create('offset'),
    shift: create('shift'),
    flip: create('flip'),
    arrow: create('arrow')
  }
})

vi.mock('@floating-ui/vue', () => ({
  offset: middlewareFns.offset,
  shift: middlewareFns.shift,
  flip: middlewareFns.flip,
  arrow: middlewareFns.arrow,
  useFloating: () => ({
    floatingStyles: ref<Record<string, unknown>>({ top: '12px', left: '10px' }),
    middlewareData: ref({ arrow: { x: 4, y: 8 } }),
    placement: ref('bottom'),
    update: floatingUpdateSpy
  })
}))

vi.mock('@floating-ui/dom', () => ({
  autoUpdate: vi.fn()
}))

vi.mock('~/components/ui/AppButton.vue', () => ({
  default: { name: 'AppButton', template: '<button />' }
}))

vi.mock('~/composables/useClipboard', () => ({
  useClipboard: () => ({
    state: clipboardState,
    copy: copySpy,
    reset: resetSpy
  })
}))

vi.mock('~/composables/useResumeDownload', () => ({
  useResumeDownload: () => ({
    download: downloadSpy,
    isDownloading: resumeIsDownloading,
    announcement: resumeAnnouncement,
    progressPercent: resumeProgress
  }),
  RESUME_DEFAULT_FILENAME: 'resume.pdf'
}))

const getScrollHandler = () => {
  return registeredListeners.find((listener) => listener.event === 'scroll' && listener.target === globalThis.window)?.handler
}

const createControls = () => {
  const hero = computed(() => ({
    primaryCta: { href: 'mailto:anthony@example.com' }
  } as HeroContent))
  return useHeroContactControls({
    hero,
    tooltipProgressDuration: 250,
    tooltipRestDelay: 500,
    enableTrace: true
  })
}

const originalWindow = globalThis.window
const originalDocument = globalThis.document
const originalGetComputedStyle = globalThis.getComputedStyle
const originalRequestAnimationFrame = globalThis.requestAnimationFrame
const originalProcessClient = (process as unknown as { client?: boolean }).client

beforeEach(() => {
  middlewareFns.offset.mockClear()
  middlewareFns.shift.mockClear()
  middlewareFns.flip.mockClear()
  middlewareFns.arrow.mockClear()
  clipboardState = ref<'idle' | 'copied' | 'error'>('idle')
  copySpy = vi.fn(async () => {
    clipboardState.value = 'copied'
    return true
  })
  resetSpy = vi.fn(() => {
    clipboardState.value = 'idle'
  })
  downloadSpy = vi.fn()
  resumeIsDownloading = ref(false)
  resumeAnnouncement = ref('')
  resumeProgress = ref(0)
  floatingUpdateSpy = vi.fn(async () => {})
  registeredListeners.splice(0, registeredListeners.length)
  vi.spyOn(console, 'info').mockImplementation(() => {})

  const fakeDocument = {
    documentElement: {}
  } as Document

  globalThis.document = fakeDocument
  const requestAnimationFrame = (cb: (time: number) => void) => {
    cb(0)
    return 1
  }
  globalThis.window = {
    scrollY: 0,
    scrollTo: vi.fn(),
    requestAnimationFrame
  } as unknown as Window
  globalThis.requestAnimationFrame = requestAnimationFrame
  globalThis.getComputedStyle = vi.fn(() => ({
    getPropertyValue: (name: string) => (name === '--sticky-nav-height' ? '64' : '')
  })) as unknown as typeof getComputedStyle
  ;(process as unknown as { client?: boolean }).client = true
})

afterEach(() => {
  vi.restoreAllMocks()
  globalThis.window = originalWindow
  globalThis.document = originalDocument
  globalThis.getComputedStyle = originalGetComputedStyle
  globalThis.requestAnimationFrame = originalRequestAnimationFrame
  ;(process as unknown as { client?: boolean }).client = originalProcessClient
})

describe('useHeroContactControls', () => {
  it('copies sanitized email addresses without resetting copy state', async () => {
    const controls = createControls()
    controls.copyState.value = 'copied'
    await controls.toggleHeroEmailPanel('mailto:first@example.com')
    resetSpy.mockClear()
    await controls.copyEmail('mailto:second@example.com')
    expect(copySpy).toHaveBeenCalledWith('second@example.com')
    expect(controls.showEmailPanel.value).toBe(false)
    expect(resetSpy).not.toHaveBeenCalled()
    expect(controls.copyState.value).toBe('copied')
  })

  it('toggles the hero email panel open and closed', async () => {
    const controls = createControls()
    await controls.toggleHeroEmailPanel('mailto:hero@example.com')
    expect(controls.showHeroEmailPanel.value).toBe(true)
    expect(controls.activeEmailHref.value).toBe('mailto:hero@example.com')

    resetSpy.mockClear()
    await controls.toggleHeroEmailPanel('mailto:hero@example.com')
    expect(controls.showHeroEmailPanel.value).toBe(false)
    expect(controls.activeEmailHref.value).toBeNull()
    expect(resetSpy).toHaveBeenCalledTimes(1)
  })

  it('closes the nav email panel and resets state after significant scroll', async () => {
    const controls = createControls()
    await controls.toggleNavEmailPanel('mailto:nav@example.com')
    expect(controls.showNavEmailPanel.value).toBe(true)
    resetSpy.mockClear()

    const scrollHandler = getScrollHandler()
    expect(scrollHandler).toBeTruthy()

    globalThis.window.scrollY = 40
    scrollHandler?.({})

    expect(controls.showNavEmailPanel.value).toBe(false)
    expect(resetSpy).toHaveBeenCalledTimes(1)
  })

  it('resets tooltip state when nav tooltip is active during scroll', async () => {
    const controls = createControls()
    await controls.toggleNavEmailPanel('mailto:nav@example.com')
    await controls.toggleNavEmailPanel('mailto:nav@example.com')

    controls.copyState.value = 'copied'
    controls.tooltipReady.value = true
    resetSpy.mockClear()

    const scrollHandler = getScrollHandler()
    expect(scrollHandler).toBeTruthy()

    globalThis.window.scrollY = 45
    scrollHandler?.({})

    expect(controls.tooltipReady.value).toBe(false)
    expect(resetSpy).toHaveBeenCalledTimes(1)
    expect(controls.copyState.value).toBe('idle')
  })
})
