<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useFloating, offset, flip, shift, arrow } from '@floating-ui/vue'
import { autoUpdate } from '@floating-ui/dom'
import type { HeroContent } from '~/types/content'
import { useClipboard } from '~/composables/useClipboard'
import { onClickOutside, useEventListener, useIntersectionObserver } from '@vueuse/core'
import AppButton from '~/components/ui/AppButton.vue'
import AppLink from '~/components/ui/AppLink.vue'

const props = defineProps<{ hero: HeroContent }>()

const socials = computed(() => props.hero.social ?? [])
const description = computed(() => props.hero.subheadline ?? '')
const emailLink = computed(() => socials.value.find((link) => link.label?.toLowerCase().includes('email')) ?? null)
const otherSocials = computed(() => socials.value.filter((link) => !link.label?.toLowerCase().includes('email')))

const runtimeConfig = useRuntimeConfig()

const TOOLTIP_PROGRESS_DURATION = Number(runtimeConfig.public.tooltipProgressDuration ?? 5000)
const TOOLTIP_REST_DELAY = Number(runtimeConfig.public.tooltipRestDelay ?? 220)
const CLIPBOARD_RESET_DELAY = TOOLTIP_PROGRESS_DURATION + TOOLTIP_REST_DELAY

const { state: copyState, copy: copyToClipboard, reset: resetCopyState } = useClipboard(CLIPBOARD_RESET_DELAY)
const activeEmailHref = ref<string | null>(null)
const emailTriggerEl = ref<InstanceType<typeof AppButton> | null>(null)
const emailPanelEl = ref<HTMLElement | null>(null)
const emailCopyButtonEl = ref<InstanceType<typeof AppButton> | null>(null)
const tooltipPresets = {
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
} as const

const tooltipBubbleEl = ref<HTMLElement | null>(null)
const tooltipArrowEl = ref<HTMLElement | null>(null)

const heroSectionEl = ref<HTMLElement | null>(null)
const isHeroInView = ref(true)

useIntersectionObserver(heroSectionEl, ([entry]) => {
  isHeroInView.value = entry?.intersectionRatio ? entry.intersectionRatio >= 0.2 : entry?.isIntersecting ?? false
}, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] })

const showStickyNav = computed(() => !isHeroInView.value)

const heroTextureSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">
    <rect width="480" height="480" fill="#2F4632" />
    <g opacity="0.32">
      <circle cx="364" cy="96" r="124" fill="#4A6C4D" />
      <circle cx="86" cy="368" r="152" fill="#6A916C" />
    </g>
    <g opacity="0.18" stroke="#ECF5EF" stroke-width="34" stroke-linecap="round">
      <path d="M-48 168L196 -76" />
      <path d="M128 372L372 128" />
      <path d="M304 548L548 304" />
    </g>
  </svg>
`)

const heroBackdropStyle = computed(() => ({
  backgroundColor: '#18291f'
}))

const heroTextureOverlayStyle = computed(() => ({
  backgroundImage: [
    'radial-gradient(ellipse at 18% 12%, rgba(236, 245, 239, 0.32) 0%, rgba(236, 245, 239, 0) 58%)',
    'radial-gradient(ellipse at 76% 90%, rgba(106, 145, 108, 0.18) 0%, rgba(106, 145, 108, 0) 65%)',
    'linear-gradient(132deg, rgba(24, 42, 30, 0.94) 0%, rgba(74, 108, 77, 0.82) 52%, rgba(236, 245, 239, 0.12) 100%)',
    `url("data:image/svg+xml,${heroTextureSvg}")`
  ].join(', '),
  backgroundSize: '160% 160%, 140% 140%, 118% 118%, 820px 820px',
  backgroundPosition: '12% 120px, 80% calc(100% + 140px), center, 52% 180px',
  backgroundRepeat: 'no-repeat, no-repeat, no-repeat, no-repeat'
}))

const referenceEl = computed(() => emailTriggerEl.value?.el ?? null)

const { floatingStyles, middlewareData, placement, update: updateFloating } = useFloating(referenceEl, tooltipBubbleEl, {
  placement: 'top',
  middleware: [offset(12), shift({ padding: 12 }), flip({ fallbackPlacements: ['top', 'bottom'] }), arrow({ element: tooltipArrowEl })],
  whileElementsMounted: autoUpdate
})

const tooltipArrowStyle = computed(() => {
  const arrowData = middlewareData.value.arrow
  const coords: Record<string, string> = { left: '', top: '' }
  if (arrowData?.x != null) {
    coords.left = `${arrowData.x}px`
  }
  if (arrowData?.y != null) {
    coords.top = `${arrowData.y}px`
  }
  const staticSideMap = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const
  const basePlacement = placement.value.split('-')[0] as keyof typeof staticSideMap
  const staticSide = staticSideMap[basePlacement] ?? 'bottom'
  coords[staticSide] = '-0.45rem'
  return coords
})

const tooltipVariant = computed(() => (copyState.value === 'error' ? 'error' : copyState.value === 'copied' ? 'success' : 'idle'))
const tooltipHeading = computed(() => {
  if (copyState.value === 'error') {
    return 'Copy failed — please grab it manually.'
  }
  if (copyState.value === 'copied') {
    return 'Email ready — expect a reply in 48 hours.'
  }
  return 'Copy email address'
})

const activeTooltipPreset = computed(() => (tooltipVariant.value === 'error' ? tooltipPresets.error : tooltipPresets.success))

const showEmailPanel = computed(() => Boolean(activeEmailHref.value))

watch(copyState, (state) => {
  ;(globalThis as typeof globalThis & { __heroTooltipState__?: typeof state }).__heroTooltipState__ = state
}, { immediate: true })

watch([tooltipVariant, showEmailPanel], async () => {
  await nextTick()
  updateFloating()
})

const copyEmail = async (href: string | null) => {
  if (!href) {
    return
  }

  const email = href.startsWith('mailto:') ? href.replace('mailto:', '') : href

  if (!email) {
    return
  }

  await copyToClipboard(email)
  closeEmailPanel({ preserveCopyState: true })
}

const openEmailPanel = async (href: string) => {
  resetCopyState()
  activeEmailHref.value = href
  await nextTick()
  emailCopyButtonEl.value?.focus()
}

const closeEmailPanel = (options?: { preserveCopyState?: boolean }) => {
  if (!showEmailPanel.value) {
    return
  }
  activeEmailHref.value = null
  if (!options?.preserveCopyState) {
    resetCopyState()
  }
  nextTick(() => {
    emailTriggerEl.value?.focus()
  })
}

const toggleEmailPanel = async (href: string) => {
  if (activeEmailHref.value) {
    closeEmailPanel()
  } else {
    await openEmailPanel(href)
  }
}

onClickOutside(emailPanelEl, () => {
  if (showEmailPanel.value) {
    closeEmailPanel()
  }
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
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <nav
        v-if="showStickyNav"
        class="fixed inset-x-0 top-0 z-[95] flex justify-center px-4 py-3 sm:px-6 sm:py-4"
        aria-label="Primary navigation"
      >
        <div
          class="flex w-full max-w-5xl items-center justify-between gap-3.5 rounded-[1.75rem] border border-sage-200/80 bg-white/98 px-5 py-2.5 shadow-[0_20px_46px_-28px_rgba(31,52,36,0.5)] backdrop-blur"
        >
          <div class="flex flex-1 items-center gap-4">
            <div class="flex flex-col text-left leading-tight">
              <span class="font-display text-sm font-semibold text-sage-700 sm:text-base">{{ props.hero.name }}</span>
              <span class="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-sage-500/90 sm:text-[0.68rem]">{{ props.hero.role }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 sm:gap-2.5">
            <AppLink
              :href="props.hero.primaryCta.href"
              variant="cta"
              class="group relative overflow-hidden px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.18em]"
              aria-label="Download résumé"
            >
              <span class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_55%)] opacity-70 transition-opacity duration-200 group-hover:opacity-90"></span>
              <span class="relative flex items-center gap-1.5">
                <span class="grid h-6 w-6 place-items-center rounded-full bg-white/22 text-white shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="h-[0.95rem] w-[0.95rem]" aria-hidden="true">
                    <path d="M12 4v9" />
                    <polyline points="8 9 12 13 16 9" />
                    <path d="M5 19h14" />
                  </svg>
                </span>
                <span>Download Résumé</span>
              </span>
            </AppLink>
            <div class="flex items-center gap-1.5 sm:gap-2">
              <AppLink
                v-for="link in socials"
                :key="link.href"
                :href="link.href"
                :aria-label="link.label"
                variant="icon"
                class="!h-10 !w-10 border-sage-200/70 bg-white text-sage-600 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-sage-400 sm:!h-11 sm:!w-11"
              >
                <span class="sr-only">{{ link.label }}</span>
                <svg
                  v-if="link.label?.toLowerCase().includes('github')"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="M9 19c-4 1.5-4-2-6-2m12 4v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0018 3.77 5.07 5.07 0 0017.91 1S16.73.65 14 2.48a13.38 13.38 0 00-5 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 3.77a5.44 5.44 0 00-1.5 3.79c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"
                  />
                </svg>
                <svg
                  v-else-if="link.label?.toLowerCase().includes('linkedin')"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-5 w-5"
                  aria-hidden="true"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M22 7l-9.5 6a.8.8 0 01-1 0L2 7" />
                </svg>
              </AppLink>
            </div>
          </div>
        </div>
      </nav>
    </Transition>
  </Teleport>

  <section
    ref="heroSectionEl"
    :style="heroBackdropStyle"
    class="relative isolate flex flex-col items-center overflow-hidden rounded-[2.2rem] px-6 py-14 text-center shadow-card sm:px-10"
  >
    <span
      :style="heroTextureOverlayStyle"
      class="pointer-events-none absolute inset-0 -z-10 opacity-90"
      aria-hidden="true"
    ></span>
    <span
      class="pointer-events-none absolute inset-0 -z-10"
      style="background: linear-gradient(180deg, rgba(24, 41, 31, 0.96) 0%, rgba(24, 41, 31, 0.72) 10%, rgba(24, 41, 31, 0.35) 26%, rgba(24, 41, 31, 0) 48%)"
      aria-hidden="true"
    ></span>
    <span
      class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_22%_18%,rgba(236,245,239,0.05),transparent_66%)]"
      aria-hidden="true"
    ></span>
    <span
      class="pointer-events-none absolute -left-[240px] -top-[260px] -z-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(106,145,108,0.49)_0%,rgba(106,145,108,0)_72%)] opacity-80 blur-[44px]"
      aria-hidden="true"
    ></span>
    <span
      class="pointer-events-none absolute -right-[280px] -bottom-[280px] -z-10 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(63,91,67,0.56)_0%,rgba(63,91,67,0)_74%)] opacity-85 blur-[52px]"
      aria-hidden="true"
    ></span>
    <span
      class="pointer-events-none absolute left-1/2 top-[18%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(236,245,239,0.18)_0%,rgba(236,245,239,0)_75%)] opacity-60"
      aria-hidden="true"
    ></span>
    <span
      class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(28,46,32,0)_38%,rgba(16,28,20,0.52)_100%)]"
      aria-hidden="true"
    ></span>
    <div
      class="relative z-10 w-full max-w-4xl rounded-[1.9rem] border border-white/65 bg-white/96 px-6 py-10 shadow-[0_42px_110px_-58px_rgba(17,31,22,0.7)] backdrop-blur-md sm:px-10"
    >
      <span
        class="pointer-events-none absolute -right-20 -top-24 -z-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(108,180,138,0.45)_0%,_rgba(108,180,138,0)_68%)]"
        aria-hidden="true"
      ></span>
      <span
        class="pointer-events-none absolute -left-24 bottom-[-80px] -z-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(56,94,70,0.38)_0%,_rgba(56,94,70,0)_72%)]"
        aria-hidden="true"
      ></span>
      <span
        class="pointer-events-none absolute inset-x-16 top-14 -z-10 h-24 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.45)_0%,_rgba(255,255,255,0)_75%)] opacity-55 blur-[38px]"
        aria-hidden="true"
      ></span>
      <span
        class="pointer-events-none absolute inset-x-10 bottom-[22px] -z-10 h-[140px] rounded-[1.6rem] border border-white/24 opacity-55"
        aria-hidden="true"
      ></span>

      <div class="relative flex flex-col items-center gap-8 text-center">
        <h1 class="font-display text-[clamp(2.2rem,4.3vw,3.3rem)] font-semibold leading-[1.08] text-sage-800">
          {{ props.hero.name }}
        </h1>
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-sage-500/90">
          {{ props.hero.role }}
        </p>
        <p v-if="description" class="max-w-2xl text-base leading-relaxed text-sage-600 sm:text-[1.05rem]">
          {{ description }}
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <AppLink
            :href="props.hero.primaryCta.href"
            variant="cta"
            class="group relative overflow-hidden"
            aria-label="Download résumé"
          >
            <span class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.34),transparent_60%)] opacity-80 transition-opacity duration-200 group-hover:opacity-100"></span>
            <span class="relative flex items-center gap-2.5">
              <span class="grid h-7 w-7 place-items-center rounded-full bg-white/28 text-white shadow-inner transition duration-200 group-hover:bg-white/36">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-[1rem] w-[1rem]"
                  aria-hidden="true"
                >
                  <path d="M12 4v9" />
                  <polyline points="8 9 12 13 16 9" />
                  <path d="M5 19h14" />
                </svg>
              </span>
              <span class="text-sm">{{ props.hero.primaryCta.label }}</span>
            </span>
          </AppLink>
        </div>

        <div v-if="socials.length" class="w-full max-w-lg">
          <transition name="fade" mode="out-in">
            <div
              v-if="showEmailPanel && activeEmailHref"
              key="email-inline"
              ref="emailPanelEl"
              role="group"
              class="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-sage-200/70 bg-white/92 px-3.5 py-3 shadow-sm"
              aria-label="Email options"
            >
              <AppButton
                ref="emailCopyButtonEl"
                variant="primary"
                class="relative px-5 py-2 transition-shadow"
                :class="[
                  copyState === 'copied' && 'ring-2 ring-sage-200/80 shadow-[0_0_0_4px_rgba(74,108,77,0.12)]',
                  copyState === 'error' && 'ring-2 ring-rose-300/80 bg-rose-600 hover:bg-rose-600'
                ]"
                @click="copyEmail(activeEmailHref)"
              >
                <span class="relative flex items-center gap-2">
                  <span class="grid h-4 w-4 place-items-center">
                    <Transition name="fade" mode="out-in">
                      <svg
                        v-if="copyState === 'copied'"
                        key="copied"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="h-4 w-4"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <svg
                        v-else-if="copyState === 'error'"
                        key="error"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="h-4 w-4"
                        aria-hidden="true"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      <svg
                        v-else
                        key="idle"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="h-4 w-4"
                        aria-hidden="true"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    </Transition>
                  </span>
                  <span class="font-medium">Copy email</span>
                </span>
              </AppButton>
              <AppButton
                variant="icon"
                class="h-10 w-10 border-sage-300"
                @click="closeEmailPanel"
                aria-label="Close email options"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-4 w-4"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </AppButton>
            </div>
            <div
              v-else
              key="social-links"
              class="flex flex-wrap items-center justify-center gap-5"
            >
              <div v-if="emailLink" :key="emailLink.href" class="relative inline-flex">
                <AppButton
                  ref="emailTriggerEl"
                  variant="icon"
                  class="group"
                  :aria-label="'View email options'"
                  @click="toggleEmailPanel(emailLink.href)"
                >
                  <span class="sr-only">{{ emailLink.label }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-5 w-5 text-sage-600 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M22 7l-9.5 6a.8.8 0 01-1 0L2 7" />
                  </svg>
                </AppButton>

                <Transition name="tooltip-fade">
                  <div
                    v-if="tooltipVariant !== 'idle'"
                    ref="tooltipBubbleEl"
                    class="absolute z-[80] inline-grid w-48 grid-cols-[auto_1fr] items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-sm font-semibold tracking-[0.01em]"
                    :style="[
                      floatingStyles,
                      {
                        background: activeTooltipPreset.background,
                        borderColor: activeTooltipPreset.borderColor,
                        boxShadow: activeTooltipPreset.bubbleShadow,
                        color: activeTooltipPreset.textColor
                      }
                    ]"
                    data-testid="email-tooltip"
                    :data-variant="tooltipVariant === 'error' ? 'error' : 'success'"
                    role="status"
                  >
                    <span
                      class="grid h-8 w-8 place-items-center rounded-full text-current"
                      :style="{
                        background: activeTooltipPreset.iconBackground,
                        boxShadow: activeTooltipPreset.iconShadow,
                        color: activeTooltipPreset.textColor
                      }"
                      aria-hidden="true"
                    >
                      <component :is="activeTooltipPreset.icon" class="h-4 w-4" />
                    </span>
                    <span>
                      {{ activeTooltipPreset.label }}
                    </span>
                    <span
                      ref="tooltipArrowEl"
                      class="pointer-events-none absolute h-3 w-3 rotate-45 border"
                      :style="[
                        tooltipArrowStyle,
                        {
                          background: activeTooltipPreset.background,
                          borderColor: activeTooltipPreset.borderColor,
                          boxShadow: activeTooltipPreset.arrowShadow
                        }
                      ]"
                    ></span>
                  </div>
                </Transition>
              </div>

              <AppLink
                v-for="link in otherSocials"
                :key="link.href"
                :href="link.href"
                :aria-label="link.label"
                variant="icon"
                class="!h-12 !w-12 border-sage-200/70 bg-white text-sage-600 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-sage-400 sm:!h-12 sm:!w-12"
              >
                <span class="sr-only">{{ link.label }}</span>
                <svg
                  v-if="link.label?.toLowerCase().includes('github')"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="M9 19c-4 1.5-4-2-6-2m12 4v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0018 3.77 5.07 5.07 0 0017.91 1S16.73.65 14 2.48a13.38 13.38 0 00-5 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 3.77a5.44 5.44 0 00-1.5 3.79c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"
                />
              </svg>
              <svg
                v-else-if="link.label?.toLowerCase().includes('linkedin')"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5"
                aria-hidden="true"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M22 7l-9.5 6a.8.8 0 01-1 0L2 7" />
              </svg>
            </AppLink>
          </div>
        </transition>
        </div>
      </div>
    </div>
    <p class="sr-only" aria-live="polite">
      <template v-if="copyState === 'copied'">Email copied — expect a reply within 48 hours.</template>
      <template v-else-if="copyState === 'error'">Copy failed — please copy the address manually.</template>
    </p>
  </section>
</template>
