<script setup lang="ts">
import { computed } from 'vue'
import type { HeroContent } from '~/types/content'

const props = defineProps<{ hero: HeroContent }>()

const socials = computed(() => props.hero.social ?? [])

const description = computed(() => props.hero.subheadline ?? '')

const metrics = computed(() => props.hero.metrics ?? [])
</script>

<template>
  <section class="flex flex-col items-center text-center">
    <h1
      class="font-display font-semibold tracking-tight text-sage-700 animate-fade-up text-[clamp(2.5rem,6vw,3.5rem)]"
      style="animation-delay: 40ms"
    >
      {{ props.hero.name }}
    </h1>
    <p
      class="mt-2 font-display text-sage-600 animate-fade-up text-[clamp(1.1rem,2.8vw,1.75rem)]"
      style="animation-delay: 120ms"
    >
      {{ props.hero.role }}
    </p>
    <p
      v-if="description"
      class="mt-6 max-w-2xl text-base sm:text-[1.05rem] text-sage-600 animate-fade-up"
      style="animation-delay: 200ms"
    >
      {{ description }}
    </p>

    <dl
      v-if="metrics.length"
      class="mt-8 flex flex-wrap justify-center gap-3 animate-fade-up"
      style="animation-delay: 260ms"
    >
      <div
        v-for="metric in metrics"
        :key="metric.label"
        class="group flex min-w-[180px] flex-col items-center gap-1 rounded-full border border-sage-200 bg-white px-5 py-3 text-sm shadow-sm transition hover:border-sage-500 hover:shadow-md focus-within:border-sage-500"
      >
        <dt class="text-xs uppercase tracking-wider text-sage-500">
          {{ metric.label }}
        </dt>
        <dd class="text-base font-semibold text-sage-700">
          {{ metric.value }}
        </dd>
      </div>
    </dl>

    <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
      <a
        :href="props.hero.primaryCta.href"
        class="inline-flex items-center gap-2 rounded-full bg-sage-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform duration-300 hover:-translate-y-0.5 hover:bg-sage-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sage-600/30 focus-visible:ring-offset-2 focus-visible:ring-offset-sage-50"
        aria-label="Download résumé"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M10 2a.75.75 0 01.75.75v7.29l2.22-2.22a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 011.06-1.06l2.22 2.22V2.75A.75.75 0 0110 2zm-6 11.5a1 1 0 011-1h10a1 1 0 011 1V16a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.5z"
            clip-rule="evenodd"
          />
        </svg>
        {{ props.hero.primaryCta.label }}
      </a>
    </div>

    <div v-if="socials.length" class="mt-10 flex flex-wrap items-center justify-center gap-5">
      <a
        v-for="link in socials"
        :key="link.href"
        :href="link.href"
        class="group inline-flex h-12 w-12 items-center justify-center rounded-full border border-transparent bg-white/80 text-sage-600 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sage-400 hover:text-sage-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sage-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-sage-50"
        :aria-label="link.label"
      >
        <span class="sr-only">{{ link.label }}</span>
        <svg
          v-if="link.label.toLowerCase().includes('github')"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-5 w-5 transition duration-300 group-hover:scale-105"
          aria-hidden="true"
        >
          <path
            d="M9 19c-4 1.5-4-2-6-2m12 4v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0018 3.77 5.07 5.07 0 0017.91 1S16.73.65 14 2.48a13.38 13.38 0 00-5 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 3.77a5.44 5.44 0 00-1.5 3.79c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"
          />
        </svg>
        <svg
          v-else-if="link.label.toLowerCase().includes('linkedin')"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-5 w-5 transition duration-300 group-hover:scale-105"
          aria-hidden="true"
        >
          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-5 w-5 transition duration-300 group-hover:scale-105"
          aria-hidden="true"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M22 7l-9.5 6a.8.8 0 01-1 0L2 7" />
        </svg>
      </a>
    </div>
  </section>
</template>
