<script setup lang="ts">
import { computed } from 'vue'
import CardSurface from '~/components/ui/CardSurface.vue'
import SectionHeader from '~/components/ui/SectionHeader.vue'
import type { ExperienceContent } from '~/types/content'
import AppLink from '~/components/ui/AppLink.vue'
import Pill from '~/components/ui/Pill.vue'

const props = defineProps<{
  experience: ExperienceContent
}>()

const entries = computed(() => props.experience.entries ?? [])
</script>

<template>
  <section class="flex flex-col gap-12">
    <SectionHeader title="Experience" accent="double-bar" />

    <div class="flex flex-col gap-8">
      <CardSurface
        v-for="entry in entries"
        :key="entry.slug"
        class="flex flex-col gap-6"
        hoverable
      >
        <header class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-1.5">
            <h3 class="font-display text-xl font-semibold text-sage-700">{{ entry.role }}</h3>
            <p class="text-sm font-semibold text-sage-600">{{ entry.organization }}</p>
            <p v-if="entry.location" class="text-sm text-sage-500">{{ entry.location }}</p>
          </div>
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-sage-500/90">
            {{ entry.period }}
          </p>
        </header>

        <div
          v-if="entry.toolkit?.length"
          class="flex flex-wrap gap-2"
          role="list"
          aria-label="Key tools and focus areas"
        >
          <Pill
            v-for="tool in entry.toolkit"
            :key="tool"
            tone="neutral"
            size="sm"
            uppercase
            class="items-center gap-1.5 tracking-[0.18em] text-sage-600/95"
          >
            {{ tool }}
          </Pill>
        </div>

        <ul
          v-if="entry.summary?.length"
          class="list-disc space-y-2 pl-5 text-left text-sm leading-relaxed text-sage-600 marker:text-sage-400"
        >
          <li v-for="point in entry.summary" :key="point">
            {{ point }}
          </li>
        </ul>

        <div
          v-for="project in entry.projects"
          :key="project.title"
          class="rounded-[1.4rem] border border-sage-200/70 bg-white/90 p-5 shadow-[0_18px_32px_-26px_rgba(47,70,49,0.28)] sm:p-6"
          role="article"
          :aria-label="`${project.title} project summary`"
        >
          <div class="flex flex-col gap-2">
            <h4 class="font-display text-lg font-semibold text-sage-700">
              {{ project.title }}
            </h4>
            <p class="text-sm text-sage-600">
              {{ project.summary }}
            </p>
          </div>

          <dl class="mt-4 grid gap-4 text-sm text-sage-600 sm:grid-cols-3">
            <div class="space-y-1.5">
              <dt class="text-xs font-semibold uppercase tracking-[0.24em] text-sage-500/80">Problem</dt>
              <dd class="leading-relaxed text-sage-600/95">{{ project.problem }}</dd>
            </div>
            <div class="space-y-1.5">
              <dt class="text-xs font-semibold uppercase tracking-[0.24em] text-sage-500/80">Contribution</dt>
              <dd class="leading-relaxed text-sage-600/95">{{ project.contribution }}</dd>
            </div>
            <div class="space-y-1.5 sm:col-span-1">
              <dt class="text-xs font-semibold uppercase tracking-[0.24em] text-sage-500/80">Impact</dt>
              <dd class="leading-relaxed text-sage-600/95">{{ project.impact }}</dd>
            </div>
          </dl>

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
      </CardSurface>
    </div>
  </section>
</template>
