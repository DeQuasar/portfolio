<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import HeroBackgroundLayers from '~/components/hero/HeroBackgroundLayers.vue'
import HeroPrimaryContent from '~/components/hero/HeroPrimaryContent.vue'
import type Button from '~/components/ui/Button.vue'
import type { ClipboardState } from '~/composables/useClipboard'
import type { HeroContent } from '~/types/content'

defineOptions({ name: 'HeroShell' })

type NormalizedSocialLink = {
  href: string
  label?: string
  iconKey?: string
}

type ButtonInstance = InstanceType<typeof Button>

type ElementOrInstanceRef<T> = { value: T } | ((value: T) => void)

const assignExternalRef = <T>(target: ElementOrInstanceRef<T> | null | undefined, value: T) => {
  if (!target) {
    return
  }

  if (typeof target === 'function') {
    target(value)
    return
  }

  target.value = value
}

const props = defineProps<{
  hero: HeroContent
  heroBackdropStyle: Record<string, string | number>
  heroTextureStyle: Record<string, string | number>
  heroNoiseStyle: Record<string, string | number>
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
  activeTooltipPreset: Record<string, string>
  tooltipArrowStyle: Record<string, string>
  floatingStyles: Record<string, string | number>
  tooltipAnchorSource: 'hero' | 'nav'
  tooltipReady: boolean
  emailPanelReady: boolean
  sectionRef: ElementOrInstanceRef<HTMLElement | null>
  emailTriggerRef: ElementOrInstanceRef<ButtonInstance | null>
  emailPanelRef: ElementOrInstanceRef<HTMLElement | null>
  emailCopyButtonRef: ElementOrInstanceRef<ButtonInstance | null>
  tooltipBubbleRef: ElementOrInstanceRef<HTMLElement | null>
  tooltipArrowRef: ElementOrInstanceRef<HTMLElement | null>
}>()

const emit = defineEmits<{
  (event: 'start-resume-download', payload?: MouseEvent | KeyboardEvent): void
  (event: 'toggle-hero-email', href: string): void
  (event: 'copy-email', href: string | null): void
  (event: 'mailto'): void
}>()

const sectionEl = ref<HTMLElement | null>(null)

watch(sectionEl, (current) => {
  assignExternalRef(props.sectionRef, current)
}, { immediate: true })

onBeforeUnmount(() => {
  assignExternalRef(props.sectionRef, null)
})

const handleStartResumeDownload = (payload?: MouseEvent | KeyboardEvent) => {
  emit('start-resume-download', payload)
}

const handleToggleHeroEmail = (href: string) => {
  emit('toggle-hero-email', href)
}

const handleCopyEmail = (href: string | null) => {
  emit('copy-email', href)
}

const handleMailto = () => {
  emit('mailto')
}
</script>

<template>
  <section
    ref="sectionEl"
    :style="props.heroBackdropStyle"
    class="relative isolate mt-6 flex min-h-[calc(100svh-1rem)] flex-col items-center overflow-visible rounded-none px-4 pb-[calc(env(safe-area-inset-bottom)+1.75rem)] pt-[calc(env(safe-area-inset-top)+2.5rem)] text-center shadow-none sm:mt-10 sm:min-h-0 sm:rounded-[2.2rem] sm:px-10 sm:py-14 sm:shadow-card"
    data-testid="hero-section"
  >
    <div
      class="absolute inset-0 z-0 overflow-hidden rounded-none bg-gradient-to-b from-sage-100/80 via-sage-50 to-sage-100 sm:rounded-[2.2rem]"
      aria-hidden="true"
    >
      <HeroBackgroundLayers
        :texture-style="props.heroTextureStyle"
        :noise-style="props.heroNoiseStyle"
      />
    </div>

    <HeroPrimaryContent
      :hero="props.hero"
      :description="props.description"
      :resume-is-downloading="props.resumeIsDownloading"
      :resume-download-progress-display="props.resumeDownloadProgressDisplay"
      :resume-announcement-text="props.resumeAnnouncementText"
      :email-link="props.emailLink"
      :other-socials="props.otherSocials"
      :show-hero-email-panel="props.showHeroEmailPanel"
      :active-email-href="props.activeEmailHref"
      :copy-state="props.copyState"
      :tooltip-variant="props.tooltipVariant"
      :tooltip-heading="props.tooltipHeading"
      :active-tooltip-preset="props.activeTooltipPreset"
      :tooltip-arrow-style="props.tooltipArrowStyle"
      :floating-styles="props.floatingStyles"
      :tooltip-anchor-source="props.tooltipAnchorSource"
      :tooltip-ready="props.tooltipReady"
      :email-trigger-ref="props.emailTriggerRef"
      :email-panel-ref="props.emailPanelRef"
      :email-copy-button-ref="props.emailCopyButtonRef"
      :tooltip-bubble-ref="props.tooltipBubbleRef"
      :tooltip-arrow-ref="props.tooltipArrowRef"
      :email-panel-ready="props.emailPanelReady"
      @start-resume-download="handleStartResumeDownload"
      @toggle-hero-email="handleToggleHeroEmail"
      @copy-email="handleCopyEmail"
      @mailto="handleMailto"
    />
  </section>
</template>
