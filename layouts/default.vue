<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Navigation from '~/components/navigation/Navigation.vue'
import AppFooter from '~/components/AppFooter.vue'
import { useHeroContent } from '~/composables/useContentSources'
import { useHeroContactControls } from '~/composables/useHeroContactControls'
import { provideHeroContactControls } from '~/composables/heroContactControlsContext'
import { provideHeroVisibility } from '~/composables/heroVisibilityContext'
import ThemeFloatingToggle from '~/components/navigation/ThemeFloatingToggle.vue'
import type { HeroContent } from '~/types/content'

const { data: hero } = await useHeroContent()

const defaultHero: HeroContent = {
  name: '',
  role: '',
  headline: '',
  subheadline: '',
  metrics: [],
  primaryCta: { label: '', href: '' },
  secondaryCta: { label: '', href: '' },
  location: '',
  social: []
}

const runtimeConfig = useRuntimeConfig()
const enableHeroTooltipTrace = Boolean((runtimeConfig.public as { heroTooltipTrace?: boolean }).heroTooltipTrace)
const tooltipProgressDuration = Number(runtimeConfig.public.tooltipProgressDuration ?? 5000)
const tooltipRestDelay = Number(runtimeConfig.public.tooltipRestDelay ?? 220)

const heroContent = computed(() => hero.value ?? defaultHero)

const contactControls = useHeroContactControls({
  hero: heroContent,
  tooltipProgressDuration,
  tooltipRestDelay,
  enableTrace: enableHeroTooltipTrace
})

provideHeroContactControls(contactControls)

const heroInView = ref(true)
provideHeroVisibility(heroInView)

const showStickyNav = computed(() => !heroInView.value)
const stickyNavHeight = ref(0)
const resumeIsDownloading = computed(() => contactControls.resumeIsDownloading.value)
const resumeDownloadProgressDisplay = computed(() => contactControls.resumeDownloadProgressDisplay.value)
const resumeAnnouncementText = computed(() => contactControls.resumeAnnouncementText.value)
const showNavEmailPanel = computed(() => contactControls.showNavEmailPanel.value)
const activeEmailHref = computed(() => contactControls.activeEmailHref.value)
const copyState = computed(() => contactControls.copyState.value)
const emailPanelReady = computed(() => contactControls.emailPanelReady.value)

const applyStickyNavHeight = (height: number) => {
  stickyNavHeight.value = height
  if (!process.client) {
    return
  }
  const clamped = Math.max(0, Math.round(height))
  document.documentElement.style.setProperty('--sticky-nav-height', `${clamped}px`)
}

const handleNavHeightChange = (height: number) => {
  if (showStickyNav.value) {
    applyStickyNavHeight(height)
  } else {
    stickyNavHeight.value = height
  }
}

const normalizedSocials = computed(() => {
  const socials = heroContent.value.social ?? []
  return socials.map((link) => {
    const iconKey = (link.icon || link.label || '').toLowerCase()
    const isEmail = iconKey.includes('email') || link.href.startsWith('mailto:')
    return { ...link, iconKey, isEmail }
  })
})

const emailLink = computed(() => normalizedSocials.value.find((link) => link.isEmail) ?? null)
const otherSocials = computed(() => normalizedSocials.value.filter((link) => !link.isEmail))

watch(showStickyNav, (isSticky) => {
  if (isSticky) {
    applyStickyNavHeight(stickyNavHeight.value)
    if (contactControls.showHeroEmailPanel.value) {
      contactControls.closeEmailPanel({ returnFocus: false })
    }
    return
  }

  applyStickyNavHeight(0)
  if (contactControls.showNavEmailPanel.value) {
    contactControls.closeEmailPanel()
  }
})

onMounted(() => {
  if (showStickyNav.value) {
    applyStickyNavHeight(stickyNavHeight.value)
  }
})

onBeforeUnmount(() => {
  if (process.client) {
    document.documentElement.style.removeProperty('--sticky-nav-height')
  }
})
</script>

<template>
  <div class="min-h-screen bg-[var(--surface-page)] font-body text-[color:var(--text-primary)] transition-colors duration-300">
    <Navigation
      :visible="showStickyNav"
      :hero="heroContent"
      :email-link="emailLink"
      :other-socials="otherSocials"
      :resume-is-downloading="resumeIsDownloading"
      :resume-download-progress-display="resumeDownloadProgressDisplay"
      :resume-announcement-text="resumeAnnouncementText"
      :show-nav-email-panel="showNavEmailPanel"
      :active-email-href="activeEmailHref"
      :copy-state="copyState"
      :email-panel-ready="emailPanelReady"
      :nav-email-trigger-ref="contactControls.navEmailTriggerEl"
      :email-panel-ref="contactControls.emailPanelEl"
      :email-copy-button-ref="contactControls.emailCopyButtonEl"
      @start-resume-download="contactControls.startResumeDownload"
      @toggle-nav-email="contactControls.toggleNavEmailPanel"
      @copy-email="contactControls.copyEmail"
      @mailto="contactControls.handleMailtoLink"
      @height-change="handleNavHeightChange"
    />
    <slot />
    <AppFooter />
    <ThemeFloatingToggle />
  </div>
</template>
