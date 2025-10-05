<script setup lang="ts">
import { computed } from 'vue'
import SectionHeader from '~/components/ui/SectionHeader.vue'
import ExperienceEntryCard from '~/components/experience/ExperienceEntryCard.vue'
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
</script>

<template>
  <section class="flex flex-col gap-12">
    <SectionHeader title="Experience" accent="double-bar" />

    <div class="flex flex-col gap-8">
      <ExperienceEntryCard
        v-for="entry in entries"
        :key="entry.slug"
        :entry="entry"
        :is-active="isEntryVisible(entry.slug)"
        :register-card="registerCard(entry.slug)"
        :card-style="isEntryVisible(entry.slug) ? activeHighlightStyle : inactiveHighlightStyle"
        :glow-overlay-style="glowOverlayStyle"
        :is-hydrated="isHydrated"
        :toolkit-display="getToolkitDisplay(entry.slug)"
        :toolkit-expanded="isToolkitExpanded(entry.slug)"
        :on-toggle-toolkit="() => toggleToolkit(entry.slug)"
        :entry-duration="getEntryDuration(entry.slug)"
        :get-project-highlights="(projectTitle) => getProjectHighlights(entry.slug, projectTitle)"
        :get-active-project-highlight="(projectTitle) => getActiveProjectHighlight(entry.slug, projectTitle)"
      />
    </div>
  </section>
</template>
