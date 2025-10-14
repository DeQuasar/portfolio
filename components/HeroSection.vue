<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import type { HeroContent } from '~/types/content'
import HeroStickyNav from '~/components/hero/HeroStickyNav.vue'
import HeroPrimaryContent from '~/components/hero/HeroPrimaryContent.vue'
import HeroBackgroundLayers from '~/components/hero/HeroBackgroundLayers.vue'
import { useHeroContactControls } from '~/composables/useHeroContactControls'
import { useHeroVisuals } from '~/composables/useHeroVisuals'
import AppButton from '~/components/ui/AppButton.vue'

const props = defineProps<{ hero: HeroContent }>()

const socialsRaw = computed(() => props.hero.social ?? [])
const normalizedSocials = computed(() => socialsRaw.value.map((link) => {
  const iconKey = (link.icon || link.label || '').toLowerCase()
  const isEmail = iconKey.includes('email') || link.href.startsWith('mailto:')
  return { ...link, iconKey, isEmail }
}))
const description = computed(() => props.hero.subheadline ?? '')
const emailLink = computed(() => normalizedSocials.value.find((link) => link.isEmail) ?? null)
const otherSocials = computed(() => normalizedSocials.value.filter((link) => !link.isEmail))

const runtimeConfig = useRuntimeConfig()
const enableHeroTooltipTrace = Boolean((runtimeConfig.public as { heroTooltipTrace?: boolean }).heroTooltipTrace)
const tooltipProgressDuration = Number(runtimeConfig.public.tooltipProgressDuration ?? 5000)
const tooltipRestDelay = Number(runtimeConfig.public.tooltipRestDelay ?? 220)

const heroRef = computed(() => props.hero)

const {
  copyState,
  startResumeDownload,
  resumeIsDownloading,
  resumeAnnouncementText,
  resumeDownloadProgressDisplay,
  tooltipVariant,
  tooltipHeading,
  activeTooltipPreset,
  tooltipArrowStyle,
  floatingStyles,
  emailTriggerEl,
  navEmailTriggerEl,
  emailPanelEl,
  emailCopyButtonEl,
  tooltipBubbleEl,
  tooltipArrowEl,
  tooltipReady,
  emailPanelReady,
  showNavEmailPanel,
  showHeroEmailPanel,
  activeEmailHref,
  toggleHeroEmailPanel,
  toggleNavEmailPanel,
  copyEmail,
  handleMailtoLink,
  closeEmailPanel
} = useHeroContactControls({
  hero: heroRef,
  tooltipProgressDuration,
  tooltipRestDelay,
  enableTrace: enableHeroTooltipTrace
})

const heroSectionEl = ref<HTMLElement | null>(null)
const isHeroInView = ref(true)

useIntersectionObserver(heroSectionEl, ([entry]) => {
  isHeroInView.value = entry?.intersectionRatio ? entry.intersectionRatio >= 0.2 : entry?.isIntersecting ?? false
}, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] })

const showStickyNav = computed(() => !isHeroInView.value)

const stickyNavHeight = ref(0)

const applyStickyNavHeight = (height: number) => {
  stickyNavHeight.value = height
  if (!process.client) {
    return
  }
  const clamped = Math.max(0, Math.round(height))
  document.documentElement.style.setProperty('--sticky-nav-height', `${clamped}px`)
}

const handleStickyNavHeightChange = (height: number) => {
  if (showStickyNav.value) {
    applyStickyNavHeight(height)
  } else {
    stickyNavHeight.value = height
  }
}

const { heroBackdropStyle, heroTextureOverlayStyle, heroNoiseOverlayStyle } = useHeroVisuals()

const setHeroEmailTrigger = (instance: InstanceType<typeof AppButton> | null) => {
  emailTriggerEl.value = instance
}

const setNavEmailTrigger = (instance: InstanceType<typeof AppButton> | null) => {
  navEmailTriggerEl.value = instance
}

const setEmailPanelEl = (element: HTMLElement | null) => {
  emailPanelEl.value = element
}

const setEmailCopyButton = (instance: InstanceType<typeof AppButton> | null) => {
  emailCopyButtonEl.value = instance
}

const setTooltipBubble = (element: HTMLElement | null) => {
  tooltipBubbleEl.value = element
}

const setTooltipArrow = (element: HTMLElement | null) => {
  tooltipArrowEl.value = element
}

watch(showStickyNav, (isSticky) => {
  if (isSticky) {
    applyStickyNavHeight(stickyNavHeight.value)
    if (showHeroEmailPanel.value) {
      closeEmailPanel({ returnFocus: false })
      return
    }
    return
  }

  applyStickyNavHeight(0)
  if (showNavEmailPanel.value) {
    closeEmailPanel()
  }
})

onMounted(() => {
  if (!process.client) {
    return
  }
  if (showStickyNav.value) {
    applyStickyNavHeight(stickyNavHeight.value)
  }
})

onBeforeUnmount(() => {
  if (!process.client) {
    return
  }
  document.documentElement.style.removeProperty('--sticky-nav-height')
})
</script>

<template>
  <HeroStickyNav
    :visible="showStickyNav"
    :hero="props.hero"
    :email-link="emailLink"
    :other-socials="otherSocials"
    :resume-is-downloading="resumeIsDownloading"
    :resume-download-progress-display="resumeDownloadProgressDisplay"
    :resume-announcement-text="resumeAnnouncementText"
    :show-nav-email-panel="showNavEmailPanel"
    :active-email-href="activeEmailHref"
    :copy-state="copyState"
    :email-panel-ready="emailPanelReady"
    :nav-email-trigger-ref="setNavEmailTrigger"
    :email-panel-ref="setEmailPanelEl"
    :email-copy-button-ref="setEmailCopyButton"
    @start-resume-download="startResumeDownload"
    @toggle-nav-email="toggleNavEmailPanel"
    @copy-email="copyEmail"
    @mailto="handleMailtoLink"
    @height-change="handleStickyNavHeightChange"
  />

  <section
    ref="heroSectionEl"
    :style="heroBackdropStyle"
    class="relative isolate flex flex-col items-center rounded-[2.2rem] px-6 py-14 text-center shadow-card sm:px-10"
  >
    <div
      class="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.2rem] -z-10"
      aria-hidden="true"
    >
      <HeroBackgroundLayers
        :texture-style="heroTextureOverlayStyle"
        :noise-style="heroNoiseOverlayStyle"
      />
    </div>

    <HeroPrimaryContent
      :hero="props.hero"
      :description="description"
      :resume-is-downloading="resumeIsDownloading"
      :resume-download-progress-display="resumeDownloadProgressDisplay"
      :resume-announcement-text="resumeAnnouncementText"
      :email-link="emailLink"
      :other-socials="otherSocials"
      :show-hero-email-panel="showHeroEmailPanel"
      :active-email-href="activeEmailHref"
      :copy-state="copyState"
      :tooltip-variant="tooltipVariant"
    :tooltip-heading="tooltipHeading"
    :active-tooltip-preset="activeTooltipPreset"
    :tooltip-arrow-style="tooltipArrowStyle"
    :floating-styles="floatingStyles"
    :tooltip-ready="tooltipReady"
    :email-trigger-ref="setHeroEmailTrigger"
      :email-panel-ref="setEmailPanelEl"
      :email-copy-button-ref="setEmailCopyButton"
      :tooltip-bubble-ref="setTooltipBubble"
      :tooltip-arrow-ref="setTooltipArrow"
      :email-panel-ready="emailPanelReady"
      @start-resume-download="startResumeDownload"
      @toggle-hero-email="toggleHeroEmailPanel"
      @copy-email="copyEmail"
      @mailto="handleMailtoLink"
    />
  </section>
</template>
