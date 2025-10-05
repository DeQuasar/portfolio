<script setup lang="ts">
import AppLink from '~/components/ui/AppLink.vue'
import type { ExperienceProject } from '~/types/content'
import type { ExperienceProjectHighlightDisplay } from '~/composables/useExperienceSection'

const projectFacetOrder = ['problem', 'contribution', 'impact'] as const

const projectFacetLabels = Object.freeze({
  problem: 'Problem',
  contribution: 'Contribution',
  impact: 'Impact'
})

defineProps<{
  project: ExperienceProject
  highlights: ExperienceProjectHighlightDisplay[]
  activeHighlight: ExperienceProjectHighlightDisplay | null
}>()
</script>

<template>
  <div
    class="relative overflow-hidden rounded-[1.4rem] border border-sage-200/70 bg-white/90 p-5 shadow-[0_18px_32px_-26px_rgba(47,70,49,0.28)] sm:p-6"
    role="article"
    :aria-label="`${project.title} project summary`"
  >
    <div class="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="space-y-2">
        <h4 class="font-display text-lg font-semibold text-sage-700">
          {{ project.title }}
        </h4>
        <p class="text-sm text-sage-600">
          {{ project.summary }}
        </p>
      </div>
      <div
        v-if="project.media?.length"
        class="flex flex-wrap justify-end gap-2"
        aria-label="Project visuals"
      >
        <div
          v-for="visual in project.media"
          :key="`${visual.type}-${visual.src}`"
          class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-sage-200/70 bg-white/90 shadow-[0_12px_36px_-20px_rgba(37,60,45,0.45)]"
        >
          <img
            v-if="visual.type === 'image'"
            :src="visual.src"
            :alt="visual.alt ?? `${project.title} visual`"
            class="h-full w-full object-cover"
            loading="lazy"
          />
          <img
            v-else-if="visual.type === 'icon'"
            :src="visual.src"
            :alt="visual.alt ?? `${project.title} icon`"
            class="h-8 w-8 object-contain"
            loading="lazy"
          />
        </div>
      </div>
    </div>

    <div
      v-if="highlights.length && activeHighlight"
      class="mt-6 space-y-5 border-t border-sage-200/70 pt-6"
    >
      <div class="space-y-3 text-[0.95rem] leading-[1.65] text-sage-700">
        <div v-for="facet in projectFacetOrder" :key="facet" class="space-y-1.5">
          <p class="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-sage-600">
            {{ projectFacetLabels[facet] }}
          </p>
          <p>
            {{ activeHighlight[facet] }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="project.links?.length" class="mt-4 flex flex-wrap gap-3">
      <AppLink
        v-for="link in project.links"
        :key="link.url"
        :href="link.url"
        variant="secondary"
        class="px-3 py-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M10 13a5 5 0 007.54.54l1.92-1.92a4 4 0 10-5.66-5.66l-.88.88" />
          <path d="M14 11a5 5 0 00-7.54-.54l-1.92 1.92a4 4 0 105.66 5.66l.88-.88" />
        </svg>
        <span>{{ link.text }}</span>
      </AppLink>
    </div>
  </div>
</template>
