<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppLink from '~/components/ui/AppLink.vue'
import type { ClipboardState } from '~/composables/useClipboard'
import type { HeroContent } from '~/types/content'

type NormalizedSocialLink = {
  href: string
  label?: string
  iconKey?: string
}

type TooltipPreset = {
  background: string
  borderColor: string
  bubbleShadow: string
  iconBackground: string
  iconShadow: string
  textColor: string
  arrowShadow: string
}

type ButtonInstance = InstanceType<typeof AppButton>

type Emit = {
  (event: 'start-resume-download', payload?: MouseEvent | KeyboardEvent): void
  (event: 'toggle-hero-email', href: string): void
  (event: 'copy-email', href: string | null): void
  (event: 'mailto'): void
}

const props = defineProps<{
  hero: HeroContent
  description: string
  resumeIsDownloading: boolean
  resumeDownloadProgressDisplay: number | null
  resumeAnnouncementText: string | null
  emailLink: NormalizedSocialLink | null
  otherSocials: NormalizedSocialLink[]
  showHeroEmailPanel: boolean
  activeEmailHref: string | null
  copyState: ClipboardState
  tooltipVariant: 'idle' | 'success' | 'error'
  tooltipHeading: string
  activeTooltipPreset: TooltipPreset
  tooltipArrowStyle: Record<string, string>
  floatingStyles: Record<string, string | number>
  emailTriggerRef: { value: ButtonInstance | null }
  emailPanelRef: { value: HTMLElement | null }
  emailCopyButtonRef: { value: ButtonInstance | null }
  tooltipBubbleRef: { value: HTMLElement | null }
  tooltipArrowRef: { value: HTMLElement | null }
}>()

const emit = defineEmits<Emit>()

const heroEmailTriggerLocal = ref<ButtonInstance | null>(null)
const heroEmailPanelLocal = ref<HTMLElement | null>(null)
const heroEmailCopyButtonLocal = ref<ButtonInstance | null>(null)
const tooltipBubbleLocal = ref<HTMLElement | null>(null)
const tooltipArrowLocal = ref<HTMLElement | null>(null)

const assignExternalRef = <T>(target: { value: T } | null | undefined, value: T) => {
  if (!target) {
    return
  }
  target.value = value
}

if (import.meta.client) {
  watch(heroEmailTriggerLocal, (current) => {
    assignExternalRef(props.emailTriggerRef, current)
  }, { immediate: true })
  watch(heroEmailPanelLocal, (current) => {
    assignExternalRef(props.emailPanelRef, current)
  }, { immediate: true })
  watch(heroEmailCopyButtonLocal, (current) => {
    assignExternalRef(props.emailCopyButtonRef, current)
  }, { immediate: true })
  watch(tooltipBubbleLocal, (current) => {
    assignExternalRef(props.tooltipBubbleRef, current)
  }, { immediate: true })
  watch(tooltipArrowLocal, (current) => {
    assignExternalRef(props.tooltipArrowRef, current)
  }, { immediate: true })
}

onBeforeUnmount(() => {
  assignExternalRef(props.emailTriggerRef, null)
  assignExternalRef(props.emailPanelRef, null)
  assignExternalRef(props.emailCopyButtonRef, null)
  assignExternalRef(props.tooltipBubbleRef, null)
  assignExternalRef(props.tooltipArrowRef, null)
})
</script>

<template>
  <div
    class="relative z-10 w-full max-w-4xl rounded-[1.9rem] border border-white/75 bg-white/98 px-6 py-10 shadow-[0_48px_120px_-62px_rgba(17,31,22,0.72)] backdrop-blur-lg sm:px-10"
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
      <h1 class="font-display text-[clamp(2.2rem,4.3vw,3.3rem)] font-semibold leading-[1.08] text-sage-900">
        {{ hero.name }}
      </h1>
      <p class="text-xs font-semibold uppercase tracking-[0.28em] text-sage-600">
        {{ hero.role }}
      </p>
      <p v-if="description" class="max-w-2xl text-base leading-relaxed text-sage-600 sm:text-[1.05rem]">
        {{ description }}
      </p>

      <div class="flex flex-wrap items-center justify-center gap-3">
        <AppLink
          :href="hero.primaryCta.href"
          variant="cta"
          :class="[
            'group relative min-h-[48px] overflow-hidden rounded-full border border-sage-500/80 bg-gradient-to-r from-sage-600 via-sage-600 to-sage-500 px-6 text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_24px_48px_-28px_rgba(46,79,51,0.68)] transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-200 sm:px-8',
            resumeIsDownloading && 'pointer-events-none brightness-95'
          ]"
          :aria-label="resumeIsDownloading ? 'Downloading résumé' : 'Download résumé'"
          @click="(event) => emit('start-resume-download', event)"
        >
          <span class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_62%)] opacity-75 transition-opacity duration-200 group-hover:opacity-95"></span>
          <span class="relative flex items-center gap-2.5">
            <span class="grid h-8 w-8 place-items-center rounded-full bg-white/24 text-white shadow-inner transition duration-200 group-hover:bg-white/32">
              <svg
                v-if="!resumeIsDownloading"
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
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                class="h-[1rem] w-[1rem] animate-spin"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" opacity="0.28" fill="none" />
                <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" />
              </svg>
            </span>
            <span class="flex items-center gap-1.5 text-[0.78rem] tracking-[0.18em] uppercase">
              <span>{{ hero.primaryCta.label }}</span>
              <span v-if="resumeDownloadProgressDisplay !== null" class="text-[0.68rem] font-semibold tracking-normal">
                {{ resumeDownloadProgressDisplay }}%
              </span>
            </span>
          </span>
          <span v-if="resumeAnnouncementText" class="sr-only" role="status" aria-live="polite">
            {{ resumeAnnouncementText }}
          </span>
        </AppLink>

        <div class="relative flex flex-wrap items-center justify-center gap-3">
          <AppButton
            v-if="emailLink"
            ref="heroEmailTriggerLocal"
            variant="secondary"
            class="flex min-h-[48px] items-center gap-2 rounded-full border-sage-200/80 bg-white/90 !px-5 !py-0 text-sm font-semibold text-sage-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sage-400 hover:text-sage-700 focus-visible:-translate-y-0.5 focus-visible:border-sage-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300"
            :aria-pressed="showHeroEmailPanel"
            @click="emit('toggle-hero-email', emailLink.href)"
          >
            <span class="grid h-9 w-9 place-items-center rounded-full border border-sage-100 bg-sage-50 text-sage-600 shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-[1rem] w-[1rem]"
                aria-hidden="true"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M22 7l-9.5 6a.8.8 0 01-1 0L2 7" />
              </svg>
            </span>
            <span class="flex flex-col text-left leading-tight">
              <span class="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-sage-500">
                {{ emailLink.label || 'Email' }}
              </span>
              <span class="text-[0.82rem] font-semibold tracking-[0.02em] text-sage-700">
                Compose message
              </span>
            </span>
          </AppButton>

          <div
            role="group"
            aria-labelledby="hero-socials-label"
            class="flex flex-wrap items-center justify-center gap-3"
          >
            <AppLink
              v-for="link in otherSocials"
              :key="link.href"
              :href="link.href"
              :aria-label="link.label"
              variant="icon"
              class="!h-11 !w-11 min-h-[44px] min-w-[44px] border-sage-200/70 bg-white text-sage-600 opacity-90 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sage-400 hover:opacity-100 focus-visible:-translate-y-0.5 focus-visible:border-sage-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300 sm:!h-12 sm:!w-12"
            >
              <span class="sr-only">{{ link.label }}</span>
              <svg
                v-if="link.iconKey?.includes('github') || link.href.toLowerCase().includes('github')"
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
                v-else-if="link.iconKey?.includes('linkedin') || link.href.toLowerCase().includes('linkedin')"
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

          <Transition name="fade">
            <div
              v-if="showHeroEmailPanel && activeEmailHref"
              key="email-inline"
              class="pointer-events-auto absolute inset-0 flex min-h-[4.5rem] w-full items-center justify-center"
              aria-labelledby="hero-socials-label"
              role="group"
            >
              <div
                ref="heroEmailPanelLocal"
                role="group"
                aria-label="Email options"
                class="flex flex-wrap items-center justify-center gap-3"
              >
                <AppButton
                  ref="heroEmailCopyButtonLocal"
                  variant="primary"
                  class="flex h-12 items-center gap-2 rounded-full !px-6 !py-0 text-sm shadow-md transition hover:shadow-lg"
                  :class="[
                    copyState === 'copied' && 'ring-2 ring-sage-200/80 shadow-[0_0_0_4px_rgba(74,108,77,0.12)]',
                    copyState === 'error' && 'ring-2 ring-rose-200/80 shadow-[0_0_0_4px_rgba(251,113,133,0.12)]'
                  ]"
                  @click="emit('copy-email', activeEmailHref)"
                >
                  <svg
                    v-if="copyState === 'copied'"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-[1rem] w-[1rem]"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <svg
                    v-else-if="copyState === 'error'"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-[1rem] w-[1rem]"
                    aria-hidden="true"
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
                    class="h-[1rem] w-[1rem]"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l8.89 5.56a2 2 0 002.22 0L23 7" />
                  </svg>
                  <span class="text-sm font-semibold tracking-[0.02em]">
                    Copy email address
                  </span>
                </AppButton>

                <AppLink
                  v-if="emailLink"
                  :href="emailLink.href"
                  variant="secondary"
                  class="flex min-h-[48px] items-center gap-2 rounded-full border-sage-200/70 bg-white/90 !px-6 !py-0 text-sm font-semibold text-sage-600 shadow-sm transition hover:border-sage-400 hover:text-sage-700"
                  @click="emit('mailto')"
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
                    <path d="M7 17L17 7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                  <span>Open in mail app</span>
                </AppLink>

                <AppButton
                  variant="icon"
                  class="!h-12 !w-12 min-h-[48px] min-w-[48px] border-sage-200/60 bg-white/80 text-sage-600 transition hover:border-sage-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300"
                  @click="emit('toggle-hero-email', activeEmailHref || '')"
                  aria-label="Close email options"
                >
                  <svg
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
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </AppButton>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <p id="hero-socials-label" class="sr-only">
        Links to social profiles
      </p>

      <Transition name="tooltip-fade">
        <div
          v-if="tooltipVariant !== 'idle'"
          ref="tooltipBubbleLocal"
          class="absolute z-[80] inline-grid w-52 grid-cols-[auto_1fr] items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-sm font-semibold tracking-[0.01em]"
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
              v-if="tooltipVariant === 'success'"
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
            <svg
              v-else-if="tooltipVariant === 'error'"
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
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l8.89 5.56a2 2 0 002.22 0L23 7" />
            </svg>
          </span>
          <span>
            {{ tooltipHeading }}
          </span>
          <span
            ref="tooltipArrowLocal"
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
  </div>
</template>
