<script setup lang="ts">
import CardSurface from '~/components/ui/CardSurface.vue'
import ExperienceProjectCard from '~/components/experience/ExperienceProjectCard.vue'
import type { ExperienceEntry } from '~/types/content'
import type {
  ExperienceProjectHighlightDisplay,
  ExperienceToolkitDisplay
} from '~/composables/useExperienceSection'

const {
  entry,
  isActive,
  registerCard,
  cardStyle,
  glowOverlayStyle,
  entryDuration,
  getProjectHighlights,
  getActiveProjectHighlight
} = defineProps<{
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
  <CardSurface
    :id="`experience-${entry.slug}`"
    :ref="registerCard"
    class="group relative flex flex-col gap-6 overflow-hidden border border-sage-200/70 bg-white shadow-md transition-shadow duration-300 ease-out sm:shadow-[0_18px_44px_-30px_rgba(28,40,31,0.35)]"
    :class="[
      isActive && 'shadow-lg sm:shadow-[0_38px_120px_-32px_rgba(18,45,32,0.92),0_28px_72px_-30px_rgba(20,118,82,0.78),0_0_48px_-8px_rgba(40,210,150,0.42),inset_0_0_0_2px_rgba(34,196,138,0.85)]'
    ]"
    :style="cardStyle"
  >
    <span
      class="pointer-events-none absolute inset-[-6%] -z-10 hidden rounded-[inherit] transition-opacity duration-300 ease-out sm:block"
      :class="isActive ? 'opacity-95' : 'opacity-0'"
      :style="glowOverlayStyle"
    ></span>

    <header class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between transition-colors duration-500">
      <div class="space-y-1.5">
        <h3
          class="flex items-center font-display text-xl font-semibold text-sage-600"
          :class="isActive ? 'text-sage-900' : ''"
        >
          <span>{{ entry.role }}</span>
        </h3>
        <p class="text-sm font-semibold transition-colors duration-500" :class="isActive ? 'text-sage-600' : 'text-sage-500'">{{ entry.organization }}</p>
        <p v-if="entry.location" class="text-sm text-sage-500">{{ entry.location }}</p>
      </div>
      <div class="flex flex-col items-start gap-1 text-left sm:items-end sm:text-right">
        <p
          class="text-sm font-semibold uppercase tracking-[0.18em] text-sage-600 transition-colors duration-500"
          :class="isActive ? 'text-sage-600' : ''"
        >
          {{ entry.period }}
        </p>
        <p
          v-if="entryDuration"
          class="text-xs text-sage-500 transition-colors duration-500"
          :class="isActive ? 'text-sage-600/90' : ''"
        >
          {{ entryDuration }}
        </p>
      </div>
    </header>

    <ul
      v-if="entry.summary?.length"
      class="list-disc space-y-2 pl-5 text-left text-sm leading-relaxed text-sage-600 marker:text-sage-400"
    >
      <li v-for="point in entry.summary" :key="point">
        {{ point }}
      </li>
    </ul>

    <ExperienceProjectCard
      v-for="project in entry.projects"
      :key="project.title"
      :project="project"
      :highlights="getProjectHighlights(project.title)"
      :active-highlight="getActiveProjectHighlight(project.title)"
    />
  </CardSurface>
</template>
