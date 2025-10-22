<script setup lang="ts">
import { computed } from 'vue'
import ExperienceCardList from '~/components/experience/section/ExperienceCardList.vue'
import ExperienceSectionHeader from '~/components/experience/section/ExperienceSectionHeader.vue'
import type { ExperienceContent } from '~/types/content'
import { useExperienceSection } from '~/composables/useExperienceSection'

const props = defineProps<{
  experience: ExperienceContent
}>()

const entries = computed(() => props.experience.entries ?? [])

const {
  isHydrated,
  registerCard,
  isEntryVisible,
  getEntryDuration,
  getToolkitDisplay,
  isToolkitExpanded,
  toggleToolkit,
  getProjectHighlights,
  getActiveProjectHighlight,
  activeHighlightStyle,
  inactiveHighlightStyle,
  glowOverlayStyle
} = useExperienceSection(entries)

const cards = computed(() => entries.value.map((entry) => {
  const slug = entry.slug
  const isActive = isEntryVisible(slug)
  return {
    entry,
    isActive,
    registerCard: registerCard(slug),
    cardStyle: isActive ? activeHighlightStyle : inactiveHighlightStyle,
    glowOverlayStyle,
    isHydrated: isHydrated.value,
    toolkitDisplay: getToolkitDisplay(slug),
    toolkitExpanded: isToolkitExpanded(slug),
    onToggleToolkit: () => toggleToolkit(slug),
    entryDuration: getEntryDuration(slug),
    getProjectHighlights: (projectTitle: string) => getProjectHighlights(slug, projectTitle),
    getActiveProjectHighlight: (projectTitle: string) => getActiveProjectHighlight(slug, projectTitle)
  }
}))
</script>

<template>
  <section class="flex flex-col gap-12" data-testid="experience-section">
    <ExperienceSectionHeader title="Experience" />
    <ExperienceCardList :cards="cards" />
  </section>
</template>
