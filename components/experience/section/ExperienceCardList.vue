<script setup lang="ts">
import ExperienceEntryCard from '~/components/experience/ExperienceEntryCard.vue'
import type { ExperienceEntry } from '~/types/content'
import type {
  ExperienceProjectHighlightDisplay,
  ExperienceToolkitDisplay
} from '~/composables/useExperienceSection'

defineOptions({ name: 'ExperienceCardList' })

type ExperienceCardViewModel = {
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
}

const props = defineProps<{
  cards: ExperienceCardViewModel[]
}>()
</script>

<template>
  <div class="flex flex-col gap-8">
    <ExperienceEntryCard
      v-for="card in props.cards"
      :key="card.entry.slug"
      :entry="card.entry"
      :is-active="card.isActive"
      :register-card="card.registerCard"
      :card-style="card.cardStyle"
      :glow-overlay-style="card.glowOverlayStyle"
      :is-hydrated="card.isHydrated"
      :toolkit-display="card.toolkitDisplay"
      :toolkit-expanded="card.toolkitExpanded"
      :on-toggle-toolkit="card.onToggleToolkit"
      :entry-duration="card.entryDuration"
      :get-project-highlights="card.getProjectHighlights"
      :get-active-project-highlight="card.getActiveProjectHighlight"
    />
  </div>
</template>
