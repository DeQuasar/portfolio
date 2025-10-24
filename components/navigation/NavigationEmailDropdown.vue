<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Button from '~/components/ui/Button.vue'
import AppLink from '~/components/ui/AppLink.vue'
import type { ClipboardState } from '~/composables/useClipboard'
import type { NormalizedSocialLink } from './types'

type ButtonInstance = InstanceType<typeof Button>

const props = defineProps<{
  variant: 'mobile' | 'desktop'
  show: boolean
  activeEmailHref: string | null
  copyState: ClipboardState
  emailLink: NormalizedSocialLink | null
  dropdownStyles?: Record<string, string>
  setEmailPanelRef: (element: HTMLElement | null) => void
  setEmailCopyButtonRef: (instance: ButtonInstance | null) => void
}>()

const emit = defineEmits<{
  (event: 'copy-email', href: string | null): void
  (event: 'mailto'): void
}>()

const panelRef = ref<HTMLElement | null>(null)
const emailCopyButtonRef = ref<ButtonInstance | null>(null)

const isMobile = computed(() => props.variant === 'mobile')

if (import.meta.client) {
  watch(panelRef, (current) => {
    props.setEmailPanelRef(current)
  }, { immediate: true })

  watch(emailCopyButtonRef, (current) => {
    props.setEmailCopyButtonRef(current)
  }, { immediate: true })

  watch(() => props.show, (isShown) => {
    if (!isShown) {
      props.setEmailPanelRef(null)
      props.setEmailCopyButtonRef(null)
    }
  })
}

onBeforeUnmount(() => {
  props.setEmailPanelRef(null)
  props.setEmailCopyButtonRef(null)
})
</script>

<template>
  <Teleport v-if="isMobile" to="body">
    <Transition name="dropdown-fade">
      <div
        v-if="show && activeEmailHref"
        ref="panelRef"
        class="fixed z-[140] flex flex-col gap-2 rounded-2xl border border-sage-200/80 bg-white/96 p-3 text-left shadow-xl backdrop-blur sm:hidden"
        :style="dropdownStyles"
        role="group"
        aria-label="Email options"
      >
        <Button
          ref="emailCopyButtonRef"
          variant="secondary"
          class="flex min-h-[44px] items-center justify-between rounded-xl border-sage-200 bg-white/92 px-4 py-2.5 text-sm font-semibold text-sage-600 shadow-sm transition hover:border-sage-400 hover:text-sage-700"
          :class="copyState === 'copied' && 'border-sage-400 text-sage-700 shadow-[0_0_24px_-12px_rgba(74,108,77,0.45)]'"
          @click="emit('copy-email', activeEmailHref)"
        >
          <span>Copy email address</span>
          <Transition name="fade" mode="out-in">
            <svg
              v-if="copyState === 'copied'"
              key="mobile-nav-copied"
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
              v-else
              key="mobile-nav-idle"
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
        </Button>
        <AppLink
          v-if="emailLink"
          :href="emailLink.href"
          variant="minimal"
          class="flex min-h-[44px] items-center justify-between rounded-xl px-4 py-2 text-sm font-semibold text-sage-500 hover:text-sage-600"
          @click="emit('mailto')"
        >
          <span>Open in mail app</span>
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
        </AppLink>
      </div>
    </Transition>
  </Teleport>
  <Transition v-else name="dropdown-fade">
    <div
      v-if="show && activeEmailHref"
      ref="panelRef"
      class="absolute right-0 top-[calc(100%+0.75rem)] z-[110] flex w-60 flex-col gap-2 rounded-2xl border border-sage-200/80 bg-white/96 p-3 shadow-xl backdrop-blur"
      role="group"
      aria-label="Email options"
    >
      <Button
        ref="emailCopyButtonRef"
        variant="secondary"
        class="flex min-h-[44px] items-center justify-between rounded-xl border-sage-200 bg-white/92 px-4 py-2.5 text-sm font-semibold text-sage-600 shadow-sm transition hover:border-sage-400 hover:text-sage-700"
        :class="copyState === 'copied' && 'border-sage-400 text-sage-700 shadow-[0_0_24px_-12px_rgba(74,108,77,0.45)]'"
        @click="emit('copy-email', activeEmailHref)"
      >
        <span>Copy email address</span>
        <Transition name="fade" mode="out-in">
          <svg
            v-if="copyState === 'copied'"
            key="nav-copied"
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
            v-else
            key="nav-idle"
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
      </Button>
      <AppLink
        v-if="emailLink"
        :href="emailLink.href"
        variant="minimal"
        class="flex min-h-[44px] items-center justify-between rounded-xl px-4 py-2 text-sm font-semibold text-sage-500 hover:text-sage-600"
        @click="emit('mailto')"
      >
        <span>Open in mail app</span>
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
      </AppLink>
    </div>
  </Transition>
</template>
