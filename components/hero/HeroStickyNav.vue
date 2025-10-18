<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useEventListener, useResizeObserver } from '@vueuse/core'
import AppButton from '~/components/ui/AppButton.vue'
import AppLink from '~/components/ui/AppLink.vue'
import type { ClipboardState } from '~/composables/useClipboard'
import type { HeroContent } from '~/types/content'

type NormalizedSocialLink = {
  href: string
  label?: string
  iconKey?: string
}

type ButtonInstance = InstanceType<typeof AppButton>

type Emit = {
  (event: 'height-change', height: number): void
  (event: 'start-resume-download', payload?: MouseEvent | KeyboardEvent): void
  (event: 'toggle-nav-email', href: string): void
  (event: 'copy-email', href: string | null): void
  (event: 'mailto'): void
}

const props = defineProps<{
  visible: boolean
  hero: HeroContent
  emailLink: NormalizedSocialLink | null
  otherSocials: NormalizedSocialLink[]
  resumeIsDownloading: boolean
  resumeDownloadProgressDisplay: number | null
  resumeAnnouncementText: string | null
  showNavEmailPanel: boolean
  activeEmailHref: string | null
  copyState: ClipboardState
  emailPanelReady: boolean
  navEmailTriggerRef: { value: ButtonInstance | null } | ((value: ButtonInstance | null) => void)
  emailPanelRef: { value: HTMLElement | null } | ((value: HTMLElement | null) => void)
  emailCopyButtonRef: { value: ButtonInstance | null } | ((value: ButtonInstance | null) => void)
}>()

const emit = defineEmits<Emit>()

const navRootEl = ref<HTMLElement | null>(null)
const navEmailTriggerLocal = ref<ButtonInstance | null>(null)
const emailPanelLocal = ref<HTMLElement | null>(null)
const emailCopyButtonLocal = ref<ButtonInstance | null>(null)
const navEmailDropdownStyles = ref<Record<string, string>>({})

const clampNavWidth = () => {
  if (!navRootEl.value) {
    return
  }
  navRootEl.value.style.width = '100vw'
  navRootEl.value.style.maxWidth = '100vw'
  navRootEl.value.style.left = '0'
  navRootEl.value.style.right = ''
  navRootEl.value.style.overflowX = 'hidden'
  navRootEl.value.style.overflowY = 'visible'
  navRootEl.value.style.overflow = 'visible'
}

const assignExternalRef = <T>(target: { value: T } | ((value: T) => void) | null | undefined, value: T) => {
  if (!target) {
    return
  }
  if (typeof target === 'function') {
    target(value)
    return
  }
  target.value = value
}

if (import.meta.client) {
  watch(navEmailTriggerLocal, (current) => {
    assignExternalRef(props.navEmailTriggerRef, current)
  }, { immediate: true })

  watch(emailPanelLocal, (current) => {
    assignExternalRef(props.emailPanelRef, current)
  }, { immediate: true })

  watch(emailCopyButtonLocal, (current) => {
    assignExternalRef(props.emailCopyButtonRef, current)
  }, { immediate: true })
}

const getNavTriggerElement = () => {
  const trigger = navEmailTriggerLocal.value?.el ?? null
  if (!trigger) {
    return null
  }
  if (trigger instanceof HTMLElement) {
    return trigger
  }
  if (typeof trigger === 'object' && 'value' in trigger && trigger.value instanceof HTMLElement) {
    return trigger.value
  }
  return null
}

const updateNavEmailDropdownPosition = () => {
  if (!import.meta.client || !props.showNavEmailPanel) {
    return
  }
  const triggerEl = getNavTriggerElement()
  if (!triggerEl) {
    return
  }

  const rect = triggerEl.getBoundingClientRect()
  const viewportWidth = window.innerWidth || 0
  const viewportHeight = window.innerHeight || 0
  const horizontalGutter = 18
  const verticalOffset = 6
  const minWidth = 160
  const maxWidth = 304
  const availableWidth = Math.max(minWidth, viewportWidth - horizontalGutter * 2)
  const panelWidth = Math.min(maxWidth, availableWidth)

  let left = rect.right - panelWidth
  left = Math.min(left, viewportWidth - horizontalGutter - panelWidth)
  left = Math.max(left, horizontalGutter)

  const navRect = navRootEl.value?.getBoundingClientRect() ?? null
  const navBottom = navRect ? navRect.bottom : 0
  const desiredTop = Math.max(rect.bottom + verticalOffset, navBottom + verticalOffset)
  const top = Math.min(desiredTop, viewportHeight - horizontalGutter)

  navEmailDropdownStyles.value = {
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
    width: `${Math.round(panelWidth)}px`,
    visibility: props.emailPanelReady ? 'visible' : 'hidden'
  }
}

watch(() => props.showNavEmailPanel, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      updateNavEmailDropdownPosition()
    })
  } else {
    navEmailDropdownStyles.value = {}
  }
})

watch(() => props.emailPanelReady, (isReady) => {
  if (isReady && props.showNavEmailPanel) {
    nextTick(() => {
      updateNavEmailDropdownPosition()
    })
  } else if (!isReady && props.showNavEmailPanel) {
    navEmailDropdownStyles.value = {
      ...navEmailDropdownStyles.value,
      visibility: 'hidden'
    }
  }
})

if (import.meta.client) {
  useEventListener(window, 'resize', () => {
    if (props.showNavEmailPanel) {
      updateNavEmailDropdownPosition()
    }
  })

  useEventListener(window, 'scroll', () => {
    if (props.showNavEmailPanel) {
      updateNavEmailDropdownPosition()
    }
  }, { passive: true })
}

const syncHeight = (height: number) => {
  emit('height-change', height)
}

if (import.meta.client) {
  useResizeObserver(navRootEl, (entries) => {
    const entry = entries[0]
    if (entry && props.visible) {
      syncHeight(entry.contentRect.height)
    }
  })
}

const reportHeightAfterTick = () => {
  if (!props.visible) {
    return
  }
  nextTick(() => {
    clampNavWidth()
    syncHeight(navRootEl.value?.offsetHeight ?? 0)
  })
}

watch(() => props.visible, (isVisible) => {
  if (!isVisible) {
    syncHeight(0)
    assignExternalRef(props.emailPanelRef, null)
    return
  }
  reportHeightAfterTick()
})

onMounted(() => {
  clampNavWidth()
  reportHeightAfterTick()
})

onBeforeUnmount(() => {
  syncHeight(0)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <nav
        v-if="visible"
        ref="navRootEl"
        class="fixed left-0 top-0 z-[95] flex w-screen justify-center px-4 pb-2 pt-nav-safe sm:pb-3 sm:px-6 [--nav-padding:0.65rem] sm:[--nav-padding:1rem]"
        aria-label="Primary navigation"
      >
        <div
          class="flex w-full max-w-5xl flex-col gap-2 rounded-[1.4rem] border border-sage-200/70 bg-white/95 px-4 py-2 shadow-[0_20px_46px_-28px_rgba(31,52,36,0.48)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:rounded-[1.75rem] sm:px-5 sm:py-2.5"
        >
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
                <AppButton
                  ref="navEmailTriggerLocal"
                  variant="icon"
                  class="!h-10 !w-10 border-sage-200/70 bg-white text-sage-600 shadow-sm transition hover:-translate-y-0.5 hover:border-sage-400 focus-visible:-translate-y-0.5 focus-visible:border-sage-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300"
                  :aria-label="'Toggle email options'"
                  @click="emit('toggle-nav-email', emailLink.href)"
                >
                  <svg
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
                </AppButton>
              </div>
            </div>
          </div>
          <Teleport to="body">
            <Transition name="dropdown-fade">
              <div
                v-if="showNavEmailPanel && activeEmailHref"
                ref="emailPanelLocal"
                class="fixed z-[140] flex flex-col gap-2 rounded-2xl border border-sage-200/80 bg-white/96 p-3 text-left shadow-xl backdrop-blur sm:hidden"
                :style="navEmailDropdownStyles"
                role="group"
                aria-label="Email options"
              >
                <AppButton
                  ref="emailCopyButtonLocal"
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
                </AppButton>
                <AppLink
                  :href="emailLink?.href"
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

          <div class="hidden flex-1 items-center justify-center gap-3 sm:flex sm:justify-start md:gap-4">
            <div class="flex flex-col items-center text-center leading-tight sm:items-start sm:text-left">
              <span class="font-display text-[0.95rem] font-semibold text-sage-700 sm:text-lg">{{ hero.name }}</span>
              <span class="text-sm font-semibold uppercase tracking-[0.16em] text-sage-600 sm:text-sm sm:tracking-[0.18em] md:text-base md:tracking-[0.2em]">
                {{ hero.role }}
              </span>
            </div>
          </div>

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
                  class="!h-11 !w-11 min-h-[42px] min-w-[42px] border-sage-200/70 bg-white text-sage-600 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-sage-400 focus-visible:-translate-y-0.5 focus-visible:border-sage-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300 sm:!h-11 sm:!w-11"
                  :aria-label="'Toggle email options'"
                  @click="emit('toggle-nav-email', emailLink.href)"
                >
                  <svg
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

                <Transition name="dropdown-fade">
                  <div
                    v-if="showNavEmailPanel && activeEmailHref"
                    ref="emailPanelLocal"
                    class="absolute right-0 top-[calc(100%+0.75rem)] z-[110] flex w-60 flex-col gap-2 rounded-2xl border border-sage-200/80 bg-white/96 p-3 shadow-xl backdrop-blur"
                    role="group"
                    aria-label="Email options"
                  >
                    <AppButton
                      ref="emailCopyButtonLocal"
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
                    </AppButton>
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
        </div>
      </nav>
    </Transition>
  </Teleport>
</template>
