<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useFloating, offset, flip, shift, arrow } from '@floating-ui/vue'
import { autoUpdate } from '@floating-ui/dom'
import type { HeroContent } from '~/types/content'
import { useClipboard } from '~/composables/useClipboard'
import { onClickOutside, useEventListener, useIntersectionObserver } from '@vueuse/core'
import AppButton from '~/components/ui/AppButton.vue'
import AppLink from '~/components/ui/AppLink.vue'
import SectionHeader from '~/components/ui/SectionHeader.vue'

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
    class="relative isolate flex flex-col items-center overflow-hidden rounded-[2.2rem] bg-[#ECF5EF] px-6 py-14 text-center shadow-card sm:px-10"
  >
    <span
      class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#F9FDFC] via-[#ECF5EF] to-[#F2FBF6]"
      aria-hidden="true"
    ></span>
    <span
      class="pointer-events-none absolute -left-32 top-[-160px] h-72 w-72 -translate-y-4 rounded-full bg-[#C4E8D3] opacity-75 blur-[120px]"
      aria-hidden="true"
    ></span>
    <span
      class="pointer-events-none absolute right-[-140px] top-[120px] h-64 w-64 rotate-6 rounded-[3rem] bg-[#DDF3EA] opacity-65 blur-[110px]"
      aria-hidden="true"
    ></span>
    <span
      class="pointer-events-none absolute bottom-[-220px] left-1/4 h-80 w-[520px] -rotate-6 rounded-[4rem] bg-gradient-to-r from-[#E1F3EA] via-transparent to-[#D3EDDF] opacity-70 blur-[150px]"
      aria-hidden="true"
    ></span>
    <div
      class="relative z-10 w-full max-w-4xl rounded-[1.9rem] border border-white/70 bg-white/92 px-6 py-12 shadow-[0_32px_96px_-52px_rgba(45,72,52,0.35)] backdrop-blur-sm sm:px-12"
    >
      <SectionHeader :title="props.hero.name" align="center" class="w-full">
        <template #title>
          <h1
            class="font-display text-[clamp(2.25rem,5vw,3.25rem)] font-semibold tracking-tight text-sage-700 animate-fade-up"
            style="animation-delay: 20ms"
          >
          {{ props.hero.name }}
        </h1>
      </template>
      <template #description>
        <div class="flex flex-col gap-6">
          <p
            class="font-display text-sage-600 text-[clamp(1.05rem,2.4vw,1.55rem)] animate-fade-up"
            style="animation-delay: 60ms"
          >
            {{ props.hero.role }}
          </p>
          <p
            v-if="description"
            class="mx-auto max-w-2xl text-base sm:text-[1.05rem] text-sage-600 animate-fade-up"
            style="animation-delay: 110ms"
          >
            {{ description }}
          </p>
        </div>
      </template>
      </SectionHeader>


      <div class="mt-8 flex flex-wrap items-center justify-center gap-4 animate-fade-up" style="animation-delay: 190ms">
        <AppLink
          :href="props.hero.primaryCta.href"
          variant="cta"
          class="group relative overflow-hidden"
          aria-label="Download résumé"
        >
          <span class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.3),transparent_55%)] opacity-70 transition-opacity duration-200 group-hover:opacity-90"></span>
          <span class="relative flex items-center gap-2.5">
            <span class="grid h-7 w-7 place-items-center rounded-full bg-white/26 text-white shadow-inner transition duration-200 group-hover:bg-white/34">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="h-[1rem] w-[1rem]" aria-hidden="true">
                <path d="M12 4v9" />
                <polyline points="8 9 12 13 16 9" />
                <path d="M5 19h14" />
              </svg>
            </span>
            <span class="text-sm">{{ props.hero.primaryCta.label }}</span>
          </span>
        </AppLink>
      </div>

      <div
        v-if="socials.length"
        class="mt-10 flex w-full max-w-xl flex-col items-center animate-fade-up mx-auto"
        style="animation-delay: 230ms"
      >
        <transition name="fade" mode="out-in">
          <div
            v-if="showEmailPanel && activeEmailHref"
            key="email-inline"
            ref="emailPanelEl"
            role="group"
            class="flex flex-wrap items-center justify-center gap-3"
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
            <AppLink :href="activeEmailHref" variant="secondary" class="px-5 py-2" @click="closeEmailPanel">
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
                <path d="M7 17l9-9" />
                <path d="M7 7h10v10" />
              </svg>
              <span>Email Anthony</span>
            </AppLink>
            <AppButton
              variant="icon"
              class="h-10 w-10 border-sage-300"
              @click="closeEmailPanel"
              aria-label="Cancel email options"
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
                    <svg
                      v-if="tooltipVariant === 'error'"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="h-4 w-4"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="h-4 w-4"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span class="text-center text-xs leading-tight tracking-[0.02em]">{{ tooltipHeading }}</span>
                  <span
                    ref="tooltipArrowEl"
                    class="pointer-events-none absolute h-3.5 w-3.5 rotate-45 border"
                    :style="[
                      tooltipArrowStyle,
                      {
                        background: activeTooltipPreset.background,
                        borderColor: activeTooltipPreset.borderColor,
                        boxShadow: activeTooltipPreset.arrowShadow
                      }
                    ]"
                    aria-hidden="true"
                  ></span>
                </div>
              </Transition>
            </div>

            <AppLink
              v-for="link in otherSocials"
              :key="link.href"
              :href="link.href"
              variant="icon"
              class="group"
              :aria-label="link.label"
            >
              <span class="sr-only">{{ link.label }}</span>
              <svg
                v-if="link.label?.toLowerCase().includes('github')"
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
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5 text-sage-600 transition-transform duration-200"
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
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5 text-sage-600 transition-transform duration-200"
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

    <p class="sr-only" aria-live="polite">
      <template v-if="copyState === 'copied'">Email copied — expect a reply within 48 hours.</template>
      <template v-else-if="copyState === 'error'">Copy failed — please copy the address manually.</template>
    </p>
  </section>
</template>
