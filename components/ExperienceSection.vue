<script setup lang="ts">
import { computed } from 'vue'
import type { ExperienceContent } from '~/types/content'

const props = defineProps<{
  experience: ExperienceContent
}>()

const headingId = 'experience-heading'

const cards = computed(() => {
  const items = props.experience.entries ?? []
  return items.map((entry) => {
    const firstProjectWithLink = entry.projects?.find((project) => project.links?.length)
    return {
      entry,
      link: firstProjectWithLink?.links?.[0] ?? null
    }
  })
})
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
        v-for="card in cards"
        :key="card.entry.slug"
        class="rounded-3xl bg-white p-8 shadow-card transition-shadow hover:shadow-lg"
        :aria-labelledby="`${card.entry.slug}-title`"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3
              :id="`${card.entry.slug}-title`"
              class="font-display text-xl font-semibold text-sage-700"
            >
              {{ card.entry.role }}
            </h3>
            <p class="text-sm font-semibold text-sage-600">
              {{ card.entry.organization }}
            </p>
            <p class="mt-1 text-sm text-sage-500" v-if="card.entry.location">
              {{ card.entry.location }}
            </p>
          </div>
          <p class="text-sm font-semibold text-sage-500">
            {{ card.entry.period }}
          </p>
        </div>

        <ul class="mt-6 list-disc space-y-2 pl-5 text-left text-sm text-sage-600">
          <li v-for="point in card.entry.summary" :key="point" class="leading-relaxed">
            {{ point }}
          </li>
        </ul>

        <div class="mt-6">
          <NuxtLink
            v-if="card.link"
            :href="card.link.url"
            class="inline-flex items-center gap-2 rounded-full bg-sage-100 px-4 py-2 text-sm font-semibold text-sage-600 transition hover:bg-sage-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5" aria-hidden="true">
              <path
                d="M4.25 4A2.25 2.25 0 002 6.25v7.5A2.25 2.25 0 004.25 16h11.5A2.25 2.25 0 0018 13.75v-7.5A2.25 2.25 0 0015.75 4H4.25zm9.72 3.47a.75.75 0 011.06 1.06l-5 5a.75.75 0 01-1.06 0l-3-3a.75.75 0 011.06-1.06l2.47 2.47 4.47-4.47z"
              />
            </svg>
            <span>{{ card.link.text ?? 'View Projects' }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M8.22 5.22a.75.75 0 011.06 0L13.28 9.22a.75.75 0 010 1.06l-4 4a.75.75 0 11-1.06-1.06L10.94 10 8.22 7.28a.75.75 0 010-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </NuxtLink>
        </div>
      </article>
    </div>
  </section>
</template>
