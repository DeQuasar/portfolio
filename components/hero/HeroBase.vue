<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import HeroShell from '~/components/hero/HeroShell.vue'
import { useHeroContactControlsContext } from '~/composables/heroContactControlsContext'
import { useHeroVisibility } from '~/composables/heroVisibilityContext'
import { useHeroVisuals } from '~/composables/useHeroVisuals'
import type AppButton from '~/components/ui/AppButton.vue'
import type { HeroContent } from '~/types/content'

defineOptions({ name: 'HeroBase' })

const props = defineProps<{ hero: HeroContent }>()

type NormalizedSocialLink = {
  href: string
  label?: string
  iconKey?: string
}

type ButtonInstance = InstanceType<typeof AppButton>

type ElementOrInstanceRef<T> = { value: T } | ((value: T) => void)

const socialsRaw = computed(() => props.hero.social ?? [])
const isEmailLink = (link: NormalizedSocialLink) => {
  const iconKey = (link.iconKey ?? '').toLowerCase()
  return iconKey.includes('email') || link.href.startsWith('mailto:')
}

const normalizedSocials = computed<NormalizedSocialLink[]>(() => socialsRaw.value.map((link) => {
  const iconKey = (link.icon || link.label || '').toLowerCase()
  return { ...link, iconKey }
}))
const description = computed(() => props.hero.subheadline ?? '')
const emailLink = computed<NormalizedSocialLink | null>(() => normalizedSocials.value.find(isEmailLink) ?? null)
const otherSocials = computed(() => normalizedSocials.value.filter((link) => !isEmailLink(link)))

const contactControls = useHeroContactControlsContext()
const heroVisibility = useHeroVisibility()

const heroSectionEl = ref<HTMLElement | null>(null)
const isHeroInView = ref(true)
const resumeIsDownloading = computed(() => contactControls.resumeIsDownloading.value)
const resumeDownloadProgressDisplay = computed(() => contactControls.resumeDownloadProgressDisplay.value)
const resumeAnnouncementText = computed(() => contactControls.resumeAnnouncementText.value)
const showHeroEmailPanel = computed(() => contactControls.showHeroEmailPanel.value)
const activeEmailHref = computed(() => contactControls.activeEmailHref.value)
const copyState = computed(() => contactControls.copyState.value)
const tooltipVariant = computed(() => contactControls.tooltipVariant.value)
const tooltipHeading = computed(() => contactControls.tooltipHeading.value)
const activeTooltipPreset = computed(() => contactControls.activeTooltipPreset.value)
const tooltipArrowStyle = computed(() => contactControls.tooltipArrowStyle.value)
const floatingStyles = computed(() => contactControls.floatingStyles.value)
const tooltipAnchorSource = computed(() => contactControls.tooltipAnchorSource.value)
const tooltipReady = computed(() => contactControls.tooltipReady.value)
const emailPanelReady = computed(() => contactControls.emailPanelReady.value)

useIntersectionObserver(heroSectionEl, ([entry]) => {
  isHeroInView.value = entry?.intersectionRatio ? entry.intersectionRatio >= 0.2 : entry?.isIntersecting ?? false
}, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] })

watch(isHeroInView, (value) => {
  heroVisibility.value = value
}, { immediate: true })

const { heroBackdropStyle, heroTextureOverlayStyle, heroNoiseOverlayStyle } = useHeroVisuals()

const setExternalRef = <T>(target: ElementOrInstanceRef<T> | null | undefined, value: T) => {
  if (!target) {
    return
  }

  if (typeof target === 'function') {
    target(value)
    return
  }

  target.value = value
}

const setHeroSectionEl = (element: HTMLElement | null) => {
  heroSectionEl.value = element
}

const setHeroEmailTrigger = (instance: ButtonInstance | null) => {
  setExternalRef(contactControls.emailTriggerEl, instance)
}

const setEmailPanelEl = (element: HTMLElement | null) => {
  contactControls.emailPanelEl.value = element
}

const setEmailCopyButton = (instance: ButtonInstance | null) => {
  setExternalRef(contactControls.emailCopyButtonEl, instance)
}

const setTooltipBubble = (element: HTMLElement | null) => {
  contactControls.tooltipBubbleEl.value = element
}

const setTooltipArrow = (element: HTMLElement | null) => {
  contactControls.tooltipArrowEl.value = element
}

onBeforeUnmount(() => {
  heroVisibility.value = true
  contactControls.closeEmailPanel({ returnFocus: false })
})
</script>

<template>
  <HeroShell
    :hero="props.hero"
    :hero-backdrop-style="heroBackdropStyle"
    :hero-texture-style="heroTextureOverlayStyle"
    :hero-noise-style="heroNoiseOverlayStyle"
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
    :tooltip-anchor-source="tooltipAnchorSource"
    :tooltip-ready="tooltipReady"
    :email-panel-ready="emailPanelReady"
    :section-ref="setHeroSectionEl"
    :email-trigger-ref="setHeroEmailTrigger"
    :email-panel-ref="setEmailPanelEl"
    :email-copy-button-ref="setEmailCopyButton"
    :tooltip-bubble-ref="setTooltipBubble"
    :tooltip-arrow-ref="setTooltipArrow"
    @start-resume-download="contactControls.startResumeDownload"
    @toggle-hero-email="contactControls.toggleHeroEmailPanel"
    @copy-email="contactControls.copyEmail"
    @mailto="contactControls.handleMailtoLink"
  />
</template>
