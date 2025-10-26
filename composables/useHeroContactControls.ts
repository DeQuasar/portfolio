import { computed, nextTick, onMounted, ref, type ComputedRef, watch } from 'vue'
import { useEventListener, onClickOutside } from '@vueuse/core'
import { useFloating, offset, flip, shift, arrow } from '@floating-ui/vue'
import { autoUpdate } from '@floating-ui/dom'
import Button from '~/components/ui/Button.vue'
import { useClipboard } from '~/composables/useClipboard'
import { useResumeDownload, RESUME_DEFAULT_FILENAME } from '~/composables/useResumeDownload'
import type { HeroContent } from '~/types/content'

type PanelSource = 'hero' | 'nav'

type TooltipPreset = {
  background: string
  borderColor: string
  bubbleShadow: string
  iconBackground: string
  iconShadow: string
  textColor: string
  arrowShadow: string
}

type Options = {
  hero: ComputedRef<HeroContent>
  tooltipProgressDuration: number
  tooltipRestDelay: number
  enableTrace: boolean
}

export function useHeroContactControls({ hero, tooltipProgressDuration, tooltipRestDelay, enableTrace }: Options) {
  const CLIPBOARD_RESET_DELAY = tooltipProgressDuration + tooltipRestDelay

  const { state: copyState, copy: copyToClipboard, reset: resetCopyState } = useClipboard(CLIPBOARD_RESET_DELAY)
  const {
    download: downloadResume,
    isDownloading: resumeIsDownloading,
    announcement: resumeAnnouncementText,
    progressPercent: resumeDownloadProgressDisplay
  } = useResumeDownload()

  const recordHeroTooltipTrace = (event: string, payload: Record<string, unknown> = {}) => {
    if (!process.client || !enableTrace) {
      return
    }
    const now = typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now()
    const entry = {
      event,
      at: now,
      iso: new Date().toISOString(),
      payload
    }
    const target = globalThis as typeof globalThis & { __heroTooltipTrace__?: typeof entry[] }
    const trace = target.__heroTooltipTrace__ ||= []
    trace.push(entry)
    if (trace.length > 120) {
      trace.splice(0, trace.length - 120)
    }
    console.info('[hero tooltip trace]', { event, payload })
  }

  const startResumeDownload = async (event?: MouseEvent | KeyboardEvent) => {
    event?.preventDefault()
    event?.stopPropagation()

    const href = hero.value.primaryCta?.href
    if (!href) {
      return
    }

    try {
      await downloadResume({ href, suggestedFilename: RESUME_DEFAULT_FILENAME })
    } catch (error) {
      console.error('Failed to download résumé', error)
    }
  }

  const activeEmailHref = ref<string | null>(null)
  const activePanelSource = ref<PanelSource | null>(null)

  const emailTriggerEl = ref<InstanceType<typeof Button> | null>(null)
  const navEmailTriggerEl = ref<InstanceType<typeof Button> | null>(null)
  const emailPanelEl = ref<HTMLElement | null>(null)
  const emailCopyButtonEl = ref<InstanceType<typeof Button> | null>(null)
  const tooltipBubbleEl = ref<HTMLElement | null>(null)
  const tooltipArrowEl = ref<HTMLElement | null>(null)
  const tooltipReferenceSource = ref<PanelSource>('hero')
  const emailPanelReady = ref(false)
  const ignoreOutsideUntil = ref(0)
  const tooltipReady = ref(false)
  const navPanelRecentlyClosed = ref(false)

  const tooltipPresets: Record<'success' | 'error', TooltipPreset> = {
    success: {
      background: 'linear-gradient(140deg, #5f8f69, #2f5236)',
      borderColor: '#4c6b50',
      bubbleShadow: '0 18px 28px -18px #1d291f',
      iconBackground: '#6aa772',
      iconShadow: '0 14px 32px -22px #1d2f21',
      textColor: '#f8faf7',
      arrowShadow: '0 10px 20px -16px #1d291f'
    },
    error: {
      background: 'linear-gradient(140deg, #e05d7b, #91283f)',
      borderColor: '#78294d',
      bubbleShadow: '0 18px 28px -18px #36101b',
      iconBackground: '#e36a86',
      iconShadow: '0 14px 32px -22px #3d1019',
      textColor: '#fef2f5',
      arrowShadow: '0 10px 20px -16px #36101b'
    }
  }

  const showNavEmailPanel = computed(() => activePanelSource.value === 'nav')
  const showHeroEmailPanel = computed(() => activePanelSource.value === 'hero')
  const showEmailPanel = computed(() => activePanelSource.value !== null)

  const resolveTriggerElement = (source: PanelSource) => {
    if (source === 'nav') {
      return navEmailTriggerEl.value?.el ?? null
    }
    return emailTriggerEl.value?.el ?? null
  }

  const referenceEl = computed(() => {
    return resolveTriggerElement(tooltipReferenceSource.value) ?? emailTriggerEl.value?.el ?? navEmailTriggerEl.value?.el ?? null
  })

  const { floatingStyles, middlewareData, placement, update: updateFloating } = useFloating(referenceEl, tooltipBubbleEl, {
    placement: 'bottom',
    strategy: 'fixed',
    middleware: [offset(12), shift({ padding: 12 }), flip({ fallbackPlacements: ['top', 'bottom'] }), arrow({ element: tooltipArrowEl })],
    whileElementsMounted: autoUpdate
  })

  const isNavReference = computed(() => tooltipReferenceSource.value === 'nav')
  const tooltipAnchorSource = computed(() => tooltipReferenceSource.value)

  const tooltipArrowStyle = computed(() => {
    const arrowData = middlewareData.value.arrow
    const coords: Record<string, string> = { left: '', top: '' }
    if (!isNavReference.value && arrowData?.x != null) {
      coords.left = `${arrowData.x}px`
    }
    if (arrowData?.y != null) {
      coords.top = `${arrowData.y}px`
    }
    const staticSideMap = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const
    const basePlacement = placement.value.split('-')[0] as keyof typeof staticSideMap
    const staticSide = staticSideMap[basePlacement] ?? 'bottom'
    coords[staticSide] = isNavReference.value ? '-0.35rem' : '-0.45rem'
    if (isNavReference.value && (staticSide === 'bottom' || staticSide === 'top')) {
      coords.left = 'calc(100% - 1.6rem)'
    }
    return coords
  })

  const heroTriggerElement = computed(() => emailTriggerEl.value?.el ?? null)
  const navTriggerElement = computed(() => navEmailTriggerEl.value?.el ?? null)

  const tooltipFloatingStyles = computed(() => {
    const base = floatingStyles.value ?? {}

    const parsePx = (value: string | number | undefined): number => {
      if (value === undefined) {
        return 0
      }
      if (typeof value === 'number') {
        return value
      }
      const match = value.match(/-?\d+(\.\d+)?/)
      return match ? Number(match[0]) : 0
    }

    const toPx = (value: string | number | undefined): string | undefined => {
      if (value === undefined) {
        return undefined
      }
      return typeof value === 'number' ? `${value}px` : value
    }

    const style: Record<string, string | number> = {}

    Object.assign(style, base)
    style.position = 'fixed'

    let top = parsePx(base.top as string | number | undefined)

    if (tooltipAnchorSource.value === 'nav') {
      let stickyNavHeight = 0
      if (typeof window !== 'undefined') {
        const rootStyle = getComputedStyle(document.documentElement)
        const varValue = rootStyle.getPropertyValue('--sticky-nav-height')
        stickyNavHeight = Number.parseFloat(varValue) || 0
      }
      const minimumTop = stickyNavHeight + 10
      top = Math.max(top + 6, minimumTop)

      style.top = `${top}px`
      style.left = 'clamp(1rem, 4vw, 1.5rem)'
      style.right = 'clamp(1rem, 4vw, 1.5rem)'
      style.transform = 'none'
    } else {
      style.top = `${top}px`
      const leftValue = toPx(base.left as string | number | undefined)
      if (leftValue !== undefined) {
        style.left = leftValue
      }
      if ('right' in style) {
        delete style.right
      }
    }

    return style
  })

  const tooltipVariant = computed<'idle' | 'success' | 'error'>(() => {
    if (tooltipReferenceSource.value === 'nav') {
      return 'idle'
    }
    if (copyState.value === 'error') {
      return 'error'
    }
    if (copyState.value === 'copied') {
      return 'success'
    }
    return 'idle'
  })
  const tooltipHeading = computed(() => {
    if (copyState.value === 'error') {
      return 'Copy failed — please grab it manually.'
    }
    if (copyState.value === 'copied') {
      return 'Email address copied to clipboard!'
    }
    return 'Copy email address'
  })

  const activeTooltipPreset = computed(() => (tooltipVariant.value === 'error' ? tooltipPresets.error : tooltipPresets.success))

  const copyEmail = async (href: string | null) => {
    if (!href) {
      return
    }

    const email = href.startsWith('mailto:') ? href.replace('mailto:', '') : href
    if (!email) {
      return
    }

    recordHeroTooltipTrace('copy-email:begin', { href, email })
    if (copyState.value !== 'idle') {
      resetCopyState()
    }
    const didCopy = await copyToClipboard(email)
    if (didCopy) {
      copyState.value = 'copied'
      await nextTick()
    }
    recordHeroTooltipTrace('copy-email:end', { href, email, didCopy })
    closeEmailPanel({ preserveCopyState: true })
  }

  const openEmailPanel = async (href: string, source: PanelSource) => {
    recordHeroTooltipTrace('email-panel:open', { href, source })
    resetCopyState()
    emailPanelReady.value = false
    activeEmailHref.value = href
    activePanelSource.value = source
    tooltipReferenceSource.value = source
    const now = typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now()
    ignoreOutsideUntil.value = now + 120
    await nextTick()
    if (source === 'hero') {
      emailCopyButtonEl.value?.focus()
    }
    if (!process.client) {
      emailPanelReady.value = true
      return
    }
    await updateFloating()
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          emailPanelReady.value = true
          resolve()
        })
      })
    })
  }

  const closeEmailPanel = (options?: { preserveCopyState?: boolean, returnFocus?: boolean }) => {
    if (!showEmailPanel.value) {
      return
    }
    const previousSource = activePanelSource.value
    recordHeroTooltipTrace('email-panel:close', {
      previousSource,
      preserveCopyState: Boolean(options?.preserveCopyState),
      returnFocus: options?.returnFocus ?? true
    })
    emailPanelReady.value = false
    activeEmailHref.value = null
    activePanelSource.value = null
    if (!options?.preserveCopyState) {
      resetCopyState()
    }
    ignoreOutsideUntil.value = 0
    const shouldReturnFocus = options?.returnFocus ?? true
    const closedFromNav = previousSource === 'nav'

    if (closedFromNav) {
      navPanelRecentlyClosed.value = true
      if (process.client) {
        requestAnimationFrame(() => {
          navPanelRecentlyClosed.value = false
        })
      }
    }

    const effectiveReturnFocus = shouldReturnFocus && !closedFromNav
    const restoreScroll = process.client && effectiveReturnFocus
      ? (() => {
          const { scrollX, scrollY } = window
          return () => {
            window.scrollTo({ left: scrollX, top: scrollY })
          }
        })()
      : null

    nextTick(() => {
      if (!effectiveReturnFocus) {
        return
      }
      if (previousSource === 'hero') {
        emailTriggerEl.value?.focus({ preventScroll: true })
      } else if (previousSource === 'nav') {
        navEmailTriggerEl.value?.focus({ preventScroll: true })
      }
      restoreScroll?.()
    })
  }

  const toggleHeroEmailPanel = async (href: string) => {
    if (showHeroEmailPanel.value) {
      closeEmailPanel()
      return
    }

    if (!href) {
      return
    }

    await openEmailPanel(href, 'hero')
  }

  const toggleNavEmailPanel = async (href: string) => {
    if (showNavEmailPanel.value) {
      closeEmailPanel({ returnFocus: false })
      return
    }

    if (navPanelRecentlyClosed.value) {
      navPanelRecentlyClosed.value = false
      return
    }

    await openEmailPanel(href, 'nav')
  }

  const handleMailtoLink = () => {
    closeEmailPanel({ preserveCopyState: true })
  }

  watch(copyState, (state) => {
    recordHeroTooltipTrace('copy-state', { state })
    ;(globalThis as typeof globalThis & { __heroTooltipState__?: typeof state }).__heroTooltipState__ = state
  }, { immediate: true })

  watch(tooltipVariant, async (variant) => {
    if (variant === 'idle') {
      tooltipReady.value = false
      return
    }
    tooltipReady.value = false
    await nextTick()
    await updateFloating()
    if (!process.client) {
      tooltipReady.value = true
      return
    }
    requestAnimationFrame(() => {
      tooltipReady.value = true
    })
  })

  watch(tooltipReferenceSource, async (source) => {
    tooltipReady.value = false
    if (source === 'nav') {
      return
    }
    await nextTick()
    await updateFloating()
    if (!process.client) {
      tooltipReady.value = true
      return
    }
    requestAnimationFrame(() => {
      tooltipReady.value = true
    })
  })

  watch(showEmailPanel, (isOpen) => {
    if (!isOpen) {
      emailPanelReady.value = false
    }
  })

  onClickOutside(emailPanelEl, () => {
    const now = typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now()
    if (now < ignoreOutsideUntil.value) {
      return
    }
    if (showEmailPanel.value && emailPanelReady.value) {
      closeEmailPanel()
    }
  }, {
    ignore: [heroTriggerElement, navTriggerElement]
  })

  useEventListener(document, 'keydown', (event) => {
    if (!showEmailPanel.value) {
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      closeEmailPanel()
    }
  })

  const lastNavScrollY = ref(0)

  if (process.client) {
    lastNavScrollY.value = window.scrollY
    useEventListener(window, 'scroll', () => {
      const current = window.scrollY
      const delta = Math.abs(current - lastNavScrollY.value)
      if (delta > 20) {
        if (showNavEmailPanel.value) {
          closeEmailPanel({ returnFocus: false })
        }
      }
      lastNavScrollY.value = current
    }, { passive: true })
  }

  onMounted(() => {
    if (process.client) {
      lastNavScrollY.value = window.scrollY
    }
  })

  return {
    copyState,
    startResumeDownload,
    resumeIsDownloading,
    resumeAnnouncementText,
    resumeDownloadProgressDisplay,
    tooltipVariant,
    tooltipHeading,
    activeTooltipPreset,
    tooltipArrowStyle,
    floatingStyles: tooltipFloatingStyles,
    emailTriggerEl,
    navEmailTriggerEl,
    emailPanelEl,
    emailCopyButtonEl,
    tooltipBubbleEl,
    tooltipArrowEl,
    tooltipAnchorSource,
    tooltipReady,
    emailPanelReady,
    showNavEmailPanel,
    showHeroEmailPanel,
    showEmailPanel,
    activeEmailHref,
    toggleHeroEmailPanel,
    toggleNavEmailPanel,
    copyEmail,
    handleMailtoLink,
    closeEmailPanel,
    recordHeroTooltipTrace
  }
}

export type HeroContactControlsBindings = ReturnType<typeof useHeroContactControls>
