<script setup lang="ts">
import { computed } from 'vue'
import type { ExperienceContent } from '~/types/content'

const props = defineProps<{
  experience: ExperienceContent
}>()

const headingId = 'experience-heading'

const entries = computed(() => props.experience.entries ?? [])
</script>

<template>
  <section class="flex flex-col gap-12" :aria-labelledby="headingId">
    <div class="text-center">
      <h2 :id="headingId" class="font-display text-3xl font-semibold text-sage-700">Experience</h2>
      <div class="mx-auto mt-4 flex w-24 flex-col items-center gap-1">
        <span class="block h-1 w-full rounded-full bg-sage-500"></span>
        <span class="block h-1 w-10 rounded-full bg-sage-300"></span>
      </div>
    </div>

    <div class="flex flex-col gap-8">
      <article
        v-for="entry in entries"
        :key="entry.slug"
        class="rounded-3xl bg-white p-8 shadow-card transition-shadow hover:shadow-lg"
        :aria-labelledby="`${entry.slug}-title`"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3
              :id="`${entry.slug}-title`"
              class="font-display text-xl font-semibold text-sage-700"
            >
              {{ entry.role }}
            </h3>
            <p class="text-sm font-semibold text-sage-600">
              {{ entry.organization }}
            </p>
            <p class="mt-1 text-sm text-sage-500" v-if="entry.location">
              {{ entry.location }}
            </p>
          </div>
          <p class="text-sm font-semibold text-sage-500">
            {{ entry.period }}
          </p>
        </div>

        <ul class="mt-6 list-disc space-y-2 pl-5 text-left text-sm text-sage-600">
          <li v-for="point in entry.summary" :key="point" class="leading-relaxed">
            {{ point }}
          </li>
        </ul>

        <div
          v-if="entry.projects?.length"
          class="mt-6 space-y-5 rounded-2xl bg-sage-50/70 p-5"
          role="list"
          aria-label="Projects delivered"
        >
          <div
            v-for="project in entry.projects"
            :key="project.title"
            class="space-y-3 border-l-2 border-sage-200 pl-4"
            role="listitem"
          >
            <div class="flex flex-col gap-1">
              <h4 class="font-display text-lg font-semibold text-sage-700">
                {{ project.title }}
              </h4>
              <p class="text-sm text-sage-600">
                {{ project.summary }}
              </p>
            </div>

            <dl class="grid gap-3 text-sm text-sage-600 sm:grid-cols-2">
              <div class="space-y-1">
                <dt class="font-semibold text-sage-500">Problem</dt>
                <dd class="leading-relaxed">{{ project.problem }}</dd>
              </div>
              <div class="space-y-1">
                <dt class="font-semibold text-sage-500">Contribution</dt>
                <dd class="leading-relaxed">{{ project.contribution }}</dd>
              </div>
              <div class="space-y-1 sm:col-span-2">
                <dt class="font-semibold text-sage-500">Impact</dt>
                <dd class="leading-relaxed">{{ project.impact }}</dd>
              </div>
            </dl>

            <div
              v-if="project.links?.length"
              class="flex flex-wrap gap-3"
            >
              <NuxtLink
                v-for="link in project.links"
                :key="link.url"
                :href="link.url"
                class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-sage-600 shadow-sm transition hover:text-sage-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-600 focus-visible:ring-offset-2 focus-visible:ring-offset-sage-50"
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
              </NuxtLink>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
