<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useEventListener, useResizeObserver } from '@vueuse/core'
import NavigationDesktopActions from './NavigationDesktopActions.vue'
import NavigationEmailDropdown from './NavigationEmailDropdown.vue'
import NavigationIdentity from './NavigationIdentity.vue'
import NavigationMobileBar from './NavigationMobileBar.vue'
import NavigationMobileMenu from './NavigationMobileMenu.vue'
import type { ClipboardState } from '~/composables/useClipboard'
import type { HeroContent } from '~/types/content'
import type { NormalizedSocialLink } from './types'

import Button from '~/components/ui/Button.vue'

type ButtonInstance = InstanceType<typeof Button>

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
const mobileMenuOpen = ref(false)

const mobileMenuLinks = computed(() => {
  const links: Array<{ label: string; href: string; ariaLabel?: string }> = [
    { label: 'Experience', href: '#experience' },
    { label: 'Skills', href: '#skills' }
  ]

  if (props.emailLink?.href) {
    links.push({ label: 'Email', href: props.emailLink.href, ariaLabel: 'Email Anthony' })
  }

  if (props.hero?.primaryCta?.href) {
    links.push({ label: props.hero.primaryCta.label ?? 'Résumé', href: props.hero.primaryCta.href, ariaLabel: props.hero.primaryCta.label })
  }

  return links
})

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

const setNavEmailTriggerLocal = (instance: ButtonInstance | null) => {
  navEmailTriggerLocal.value = instance
}

const setEmailPanelLocal = (element: HTMLElement | null) => {
  emailPanelLocal.value = element
}

const setEmailCopyButtonLocal = (instance: ButtonInstance | null) => {
  emailCopyButtonLocal.value = instance
}

const scrollLockState: { docOverflow: string | null; bodyOverflow: string | null } = {
  docOverflow: null,
  bodyOverflow: null
}

const applyScrollLock = () => {
  if (!import.meta.client) {
    return
  }
  const doc = document.documentElement
  const body = document.body
  if (scrollLockState.docOverflow === null) {
    scrollLockState.docOverflow = doc.style.overflow
    scrollLockState.bodyOverflow = body.style.overflow
  }
  doc.style.overflow = 'hidden'
  body.style.overflow = 'hidden'
}

const releaseScrollLock = () => {
  if (!import.meta.client) {
    return
  }
  const doc = document.documentElement
  const body = document.body
  if (scrollLockState.docOverflow !== null) {
    doc.style.overflow = scrollLockState.docOverflow
    scrollLockState.docOverflow = null
  } else {
    doc.style.removeProperty('overflow')
  }
  if (scrollLockState.bodyOverflow !== null) {
    body.style.overflow = scrollLockState.bodyOverflow
    scrollLockState.bodyOverflow = null
  } else {
    body.style.removeProperty('overflow')
  }
}

const handleMobileMenuToggle = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  if (mobileMenuOpen.value && props.showNavEmailPanel) {
    const hrefToToggle = props.activeEmailHref ?? props.emailLink?.href ?? ''
    if (hrefToToggle) {
      emit('toggle-nav-email', hrefToToggle)
    }
  }
}

const handleMobileMenuClose = () => {
  if (!mobileMenuOpen.value) {
    return
  }
  mobileMenuOpen.value = false
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

function reportHeightAfterTick() {
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
    mobileMenuOpen.value = false
    syncHeight(0)
    assignExternalRef(props.emailPanelRef, null)
    return
  }
  reportHeightAfterTick()
})

watch(() => props.showNavEmailPanel, (isOpen) => {
  if (isOpen && mobileMenuOpen.value) {
    mobileMenuOpen.value = false
  }
})

watch(mobileMenuOpen, (isOpen) => {
  if (isOpen) {
    applyScrollLock()
  } else {
    releaseScrollLock()
  }
  if (props.visible) {
    reportHeightAfterTick()
  }
})

onMounted(() => {
  clampNavWidth()
  reportHeightAfterTick()
})

onBeforeUnmount(() => {
  releaseScrollLock()
  syncHeight(0)
})
</script>

<template>
  <Transition name="fade">
    <nav
      v-if="visible"
      ref="navRootEl"
      class="fixed left-0 top-0 z-[95] flex w-screen justify-center px-4 pb-2 pt-nav-safe sm:pb-3 sm:px-6 [--nav-padding:0.65rem] sm:[--nav-padding:1rem]"
      aria-label="Primary navigation"
    >
      <div
        class="flex w-full max-w-5xl flex-col gap-1.5 rounded-[1.3rem] border border-sage-200/70 bg-white/95 px-4 py-2 shadow-[0_20px_46px_-28px_rgba(31,52,36,0.48)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:rounded-[1.75rem] sm:px-5 sm:py-2.5"
      >
        <NavigationMobileBar
          :hero="hero"
          :menu-open="mobileMenuOpen"
          @toggle-menu="handleMobileMenuToggle"
        />

        <NavigationEmailDropdown
          variant="mobile"
          :show="showNavEmailPanel"
          :active-email-href="activeEmailHref"
          :copy-state="copyState"
          :email-link="emailLink"
          :dropdown-styles="navEmailDropdownStyles"
          :set-email-panel-ref="setEmailPanelLocal"
          :set-email-copy-button-ref="setEmailCopyButtonLocal"
          @copy-email="emit('copy-email', $event)"
          @mailto="emit('mailto')"
        />

        <NavigationIdentity :hero="hero" />

        <NavigationDesktopActions
          :hero="hero"
          :email-link="emailLink"
          :other-socials="otherSocials"
          :resume-is-downloading="resumeIsDownloading"
          :resume-download-progress-display="resumeDownloadProgressDisplay"
          :resume-announcement-text="resumeAnnouncementText"
          :copy-state="copyState"
          :show-nav-email-panel="showNavEmailPanel"
          :active-email-href="activeEmailHref"
          :set-nav-email-trigger="setNavEmailTriggerLocal"
          :set-email-panel-ref="setEmailPanelLocal"
          :set-email-copy-button-ref="setEmailCopyButtonLocal"
          @start-resume-download="(event) => emit('start-resume-download', event)"
          @toggle-nav-email="emit('toggle-nav-email', $event)"
          @copy-email="emit('copy-email', $event)"
          @mailto="emit('mailto')"
        />
      </div>
    </nav>
  </Transition>
  <Teleport to="body">
    <NavigationMobileMenu
      :hero="hero"
      :links="mobileMenuLinks"
      :open="visible && mobileMenuOpen"
      @close="handleMobileMenuClose"
    />
  </Teleport>
</template>
