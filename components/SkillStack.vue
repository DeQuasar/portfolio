<script setup lang="ts">
import SectionHeader from '~/components/ui/SectionHeader.vue'
import Pill from '~/components/ui/Pill.vue'
import type { SkillsContent } from '~/types/content'

const props = defineProps<{ skills: SkillsContent }>()
</script>

<template>
  <section class="flex flex-col gap-10 text-center">
    <SectionHeader title="Skill Stack" :description="props.skills.intro ?? ''" />

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
          class="mx-auto grid w-full max-w-3xl grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 justify-items-center"
          :aria-labelledby="`${category.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-skills`"
        >
          <li v-for="item in category.skills" :key="item">
            <Pill tone="neutral" size="sm" class="w-full max-w-[11rem] justify-center transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-26px_rgba(47,70,49,0.28)]">{{ item }}</Pill>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
