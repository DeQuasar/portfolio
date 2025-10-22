<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppLink from '~/components/ui/AppLink.vue'
import type { ClipboardState } from '~/composables/useClipboard'
import type { HeroContent } from '~/types/content'
import NavigationEmailDropdown from './NavigationEmailDropdown.vue'
import type { NormalizedSocialLink } from './types'

type ButtonInstance = InstanceType<typeof AppButton>

const props = defineProps<{
  hero: HeroContent
  emailLink: NormalizedSocialLink | null
  otherSocials: NormalizedSocialLink[]
  resumeIsDownloading: boolean
  resumeDownloadProgressDisplay: number | null
  resumeAnnouncementText: string | null
  copyState: ClipboardState
  showNavEmailPanel: boolean
  activeEmailHref: string | null
  setNavEmailTrigger: (instance: ButtonInstance | null) => void
  setEmailPanelRef: (element: HTMLElement | null) => void
  setEmailCopyButtonRef: (instance: ButtonInstance | null) => void
}>()

const emit = defineEmits<{
  (event: 'start-resume-download', payload?: MouseEvent | KeyboardEvent): void
  (event: 'toggle-nav-email', href: string): void
  (event: 'copy-email', href: string | null): void
  (event: 'mailto'): void
}>()

const navEmailTriggerLocal = ref<ButtonInstance | null>(null)

if (import.meta.client) {
  watch(navEmailTriggerLocal, (current) => {
    props.setNavEmailTrigger(current)
  }, { immediate: true })

  watch(() => props.emailLink, (link) => {
    if (!link) {
      props.setNavEmailTrigger(null)
    }
  }, { immediate: true })
}

onBeforeUnmount(() => {
  props.setNavEmailTrigger(null)
})
</script>

<template>
  <div class="hidden w-full flex-wrap items-center justify-center gap-2 sm:flex sm:w-auto sm:flex-nowrap sm:justify-end sm:gap-2.5 md:gap-3">
    <AppLink
      :href="hero.primaryCta.href"
      variant="cta"
      :class="[
        'group relative w-full min-h-[44px] justify-center overflow-hidden rounded-full bg-gradient-to-r from-sage-600 via-sage-600 to-sage-600 px-5 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_18px_34px_-20px_rgba(46,79,51,0.72)] transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300 sm:w-auto sm:min-w-[11rem] sm:px-6',
        resumeIsDownloading && 'pointer-events-none opacity-75'
      ]"
      :aria-label="resumeIsDownloading ? 'Downloading résumé' : 'Download résumé'"
      @click="(event) => emit('start-resume-download', event)"
    >
      <span class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_58%)] opacity-80 transition-opacity duration-200 group-hover:opacity-95"></span>
      <span class="relative flex items-center gap-1.5">
        <span class="grid h-7 w-7 place-items-center rounded-full bg-white/22 text-white shadow-inner transition group-hover:bg-white/28">
          <svg
            v-if="!resumeIsDownloading"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-[0.95rem] w-[0.95rem]"
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
            class="h-[0.95rem] w-[0.95rem] animate-spin"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" opacity="0.3" />
            <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" />
          </svg>
        </span>
        <span class="flex items-center gap-1">
          <span>{{ hero.primaryCta.label }}</span>
          <span v-if="resumeDownloadProgressDisplay !== null" class="text-xs font-semibold tracking-normal">
            {{ resumeDownloadProgressDisplay }}%
          </span>
        </span>
      </span>
      <span
        v-if="resumeAnnouncementText"
        class="sr-only"
        role="status"
        aria-live="polite"
        data-testid="hero-resume-status"
      >
        {{ resumeAnnouncementText }}
      </span>
    </AppLink>

    <div class="flex items-center gap-1.5 sm:gap-2">
      <div v-if="emailLink" class="relative inline-flex">
        <AppButton
          ref="navEmailTriggerLocal"
          variant="icon"
          :data-copy-state="copyState"
          :class="[
            '!h-11 !w-11 min-h-[42px] min-w-[42px] border-sage-200/70 bg-white text-sage-600 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-sage-400 focus-visible:-translate-y-0.5 focus-visible:border-sage-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300 sm:!h-11 sm:!w-11',
            copyState === 'copied' && '!bg-sage-600 !text-white !border-sage-500 shadow-[0_18px_30px_-20px_rgba(25,65,40,0.55)]',
            copyState === 'error' && '!bg-rose-500/95 !text-white !border-rose-600 shadow-[0_18px_30px_-24px_rgba(120,23,46,0.55)]'
          ]"
          :aria-label="'Toggle email options'"
          @click="emit('toggle-nav-email', emailLink.href)"
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
            class="h-[0.95rem] w-[0.95rem]"
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
            class="h-[0.95rem] w-[0.95rem]"
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
            class="h-[0.95rem] w-[0.95rem]"
            aria-hidden="true"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M22 7l-9.5 6a.8.8 0 01-1 0L2 7" />
          </svg>
        </AppButton>

        <NavigationEmailDropdown
          variant="desktop"
          :show="showNavEmailPanel"
          :active-email-href="activeEmailHref"
          :copy-state="copyState"
          :email-link="emailLink"
          :set-email-panel-ref="setEmailPanelRef"
          :set-email-copy-button-ref="setEmailCopyButtonRef"
          @copy-email="emit('copy-email', $event)"
          @mailto="emit('mailto')"
        />
      </div>

      <AppLink
        v-for="link in otherSocials"
        :key="link.href"
        :href="link.href"
        :aria-label="link.label"
        variant="icon"
        class="!h-10 !w-10 min-h-[42px] min-w-[42px] border-sage-200/70 bg-white text-sage-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sage-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300 sm:!h-10 sm:!w-10"
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
          class="h-[0.95rem] w-[0.95rem]"
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
          class="h-[0.95rem] w-[0.95rem]"
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
          class="h-[0.95rem] w-[0.95rem]"
          aria-hidden="true"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M22 7l-9.5 6a.8.8 0 01-1 0L2 7" />
        </svg>
      </AppLink>
    </div>
  </div>
</template>
