<script setup lang="ts">
import type { SkillsContent } from '~/types/content'

const props = defineProps<{ skills: SkillsContent }>()

const headingId = 'skills-heading'
</script>

<template>
<section class="flex flex-col gap-10 text-center" :aria-labelledby="headingId">
    <div>
      <h2 :id="headingId" class="font-display text-3xl font-semibold text-sage-700">Skill Stack</h2>
      <div class="mx-auto mt-4 flex w-24 flex-col items-center gap-1">
        <span class="block h-1 w-full rounded-full bg-sage-500"></span>
        <span class="block h-1 w-10 rounded-full bg-sage-300"></span>
      </div>
      <p v-if="props.skills.intro" class="mx-auto mt-6 max-w-2xl text-sm text-sage-600">
        {{ props.skills.intro }}
      </p>
    </div>

    <div class="flex flex-col gap-10">
      <div
        v-for="category in props.skills.categories"
        :key="category.title"
        class="flex flex-col items-center gap-4"
      >
        <h3
          class="font-display text-lg font-semibold uppercase tracking-[0.25em] text-sage-600"
          :id="`${category.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-skills`"
        >
          {{ category.title }}
        </h3>
        <ul
          class="flex flex-wrap justify-center gap-3 text-sm font-semibold text-sage-600"
          :aria-labelledby="`${category.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-skills`"
        >
          <li
            v-for="item in category.skills"
            :key="item"
            class="rounded-full bg-white px-4 py-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
