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
  <article
    class="relative overflow-hidden rounded-[1.4rem] border border-[color:var(--border-soft)] bg-white/90 p-5 shadow-md transition-shadow sm:p-6 sm:shadow-[0_18px_32px_-26px_rgba(47,70,49,0.28)]"
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
        class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[color:var(--border-soft)] bg-white/90 shadow-[0_12px_36px_-20px_rgba(37,60,45,0.45)]"
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
      class="mt-6 hidden space-y-5 border-t border-[color:var(--border-muted)] pt-6 sm:block"
    >
      <div class="space-y-3 text-base leading-[1.65] text-sage-700">
        <div v-for="facet in projectFacetOrder" :key="facet" class="space-y-1.5">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-sage-600">
            {{ projectFacetLabels[facet] }}
          </p>
          <p>
            {{ activeHighlight[facet] }}
          </p>
        </div>
      </div>
    </div>

    <details
      v-if="highlights.length && activeHighlight"
      class="group mt-5 rounded-2xl border border-[color:var(--border-soft)] bg-white/95 px-4 py-3 text-left text-sm leading-relaxed text-sage-600 shadow-sm sm:hidden"
    >
      <summary
        class="flex w-full cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-sage-600 transition-colors group-open:text-sage-700"
      >
        <span>Project impact</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4 shrink-0 text-sage-500 transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <div class="mt-3 space-y-3">
        <div v-for="facet in projectFacetOrder" :key="`mobile-${facet}`" class="space-y-1.5">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-sage-500">
            {{ projectFacetLabels[facet] }}
          </p>
          <p>
            {{ activeHighlight[facet] }}
          </p>
        </div>
      </div>
    </details>

    <div v-if="project.links?.length" class="mt-4 flex flex-wrap gap-3">
      <AppLink
        v-for="link in project.links"
        :key="link.url"
        :href="link.url"
        variant="secondary"
        class="flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2"
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
  </article>
</template>
