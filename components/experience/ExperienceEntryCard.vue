<script setup lang="ts">
import ExperienceEntryCardShell from '~/components/experience/entry/ExperienceEntryCardShell.vue'
import ExperienceEntryHeader from '~/components/experience/entry/ExperienceEntryHeader.vue'
import ExperienceEntrySummary from '~/components/experience/entry/ExperienceEntrySummary.vue'
import ExperienceEntryToolkit from '~/components/experience/entry/ExperienceEntryToolkit.vue'
import ExperienceEntryProjects from '~/components/experience/entry/ExperienceEntryProjects.vue'
import type { ExperienceEntry } from '~/types/content'
import type {
  ExperienceProjectHighlightDisplay,
  ExperienceToolkitDisplay
} from '~/composables/useExperienceSection'

const props = defineProps<{
  entry: ExperienceEntry
  isActive: boolean
  registerCard: (value: Element | { $el?: Element } | null) => void
  cardStyle: Record<string, string>
  glowOverlayStyle: Record<string, string>
  isHydrated: boolean
  toolkitDisplay: ExperienceToolkitDisplay
  toolkitExpanded: boolean
  onToggleToolkit: () => void
  entryDuration: string | null
  getProjectHighlights: (projectTitle: string) => ExperienceProjectHighlightDisplay[]
  getActiveProjectHighlight: (projectTitle: string) => ExperienceProjectHighlightDisplay | null
}>()
</script>

<template>
  <ExperienceEntryCardShell
    :entry-slug="props.entry.slug"
    :is-active="props.isActive"
    :register-card="props.registerCard"
    :card-style="props.cardStyle"
    :glow-overlay-style="props.glowOverlayStyle"
  >
    <ExperienceEntryHeader
      :entry="props.entry"
      :is-active="props.isActive"
      :entry-duration="props.entryDuration"
    />

    <ExperienceEntrySummary :summary="props.entry.summary" />

    <ExperienceEntryToolkit
      :toolkit-display="props.toolkitDisplay"
      :toolkit-expanded="props.toolkitExpanded"
      :on-toggle-toolkit="props.onToggleToolkit"
      :is-hydrated="props.isHydrated"
    />

    <ExperienceEntryProjects
      :projects="props.entry.projects"
      :get-project-highlights="props.getProjectHighlights"
      :get-active-project-highlight="props.getActiveProjectHighlight"
    />
  </ExperienceEntryCardShell>
</template>
