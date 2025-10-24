<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import Button from '~/components/ui/Button.vue'
import AppLink from '~/components/ui/AppLink.vue'
import type { ClipboardState } from '~/composables/useClipboard'
import type { HeroContent } from '~/types/content'
import ThemeToggle from './ThemeToggle.vue'
import type { NormalizedSocialLink } from './types'

type ButtonInstance = InstanceType<typeof Button>

const props = defineProps<{
  hero: HeroContent
  emailLink: NormalizedSocialLink | null
  resumeIsDownloading: boolean
  copyState: ClipboardState
  setNavEmailTrigger: (instance: ButtonInstance | null) => void
}>()

const emit = defineEmits<{
  (event: 'start-resume-download', payload?: MouseEvent | KeyboardEvent): void
  (event: 'toggle-nav-email', href: string): void
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
  <div class="flex w-full items-center justify-between sm:hidden">
    <div class="flex flex-col text-left leading-tight">
      <span class="font-display text-[0.95rem] font-semibold text-sage-700">{{ hero.name }}</span>
      <span class="text-xs font-semibold uppercase tracking-[0.16em] text-sage-600">
        {{ hero.role }}
      </span>
    </div>
    <div class="flex items-center gap-2">
      <AppLink
        :href="hero.primaryCta.href"
        variant="icon"
        class="!h-10 !w-10 !border-transparent !bg-sage-600 !text-white shadow-md transition hover:!bg-sage-600/90 hover:!text-white focus-visible:!ring-white/60"
        :aria-label="resumeIsDownloading ? 'Downloading résumé' : 'Download résumé'"
        @click="(event) => emit('start-resume-download', event)"
      >
        <svg
          v-if="!resumeIsDownloading"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-[0.9rem] w-[0.9rem]"
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
          stroke-width="1.7"
          class="h-[0.9rem] w-[0.9rem] animate-spin"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7" opacity="0.3" />
          <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-linecap="round" stroke-width="1.7" />
        </svg>
      </AppLink>

      <div v-if="emailLink" class="relative inline-flex">
      <Button
        ref="navEmailTriggerLocal"
        variant="icon"
        :data-copy-state="copyState"
        :class="[
          '!h-10 !w-10 border-sage-200/70 bg-white text-sage-600 shadow-sm transition hover:-translate-y-0.5 hover:border-sage-400 focus-visible:-translate-y-0.5 focus-visible:border-sage-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300',
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
            class="h-[0.9rem] w-[0.9rem]"
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
            class="h-[0.9rem] w-[0.9rem]"
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
            class="h-[0.9rem] w-[0.9rem]"
            aria-hidden="true"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M22 7l-9.5 6a.8.8 0 01-1 0L2 7" />
          </svg>
      </Button>
      </div>

      <ThemeToggle />
    </div>
  </div>
</template>
