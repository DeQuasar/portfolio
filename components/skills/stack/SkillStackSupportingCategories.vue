<script setup lang="ts">
import SkillCategoryCard from '~/components/skills/SkillCategoryCard.vue'
import type { SkillCategoryDisplay } from '~/composables/useSkillStack'

const props = defineProps<{
  categories: SkillCategoryDisplay[]
}>()
</script>

<template>
  <div v-if="props.categories.length" class="flex flex-col gap-6">
    <header class="flex flex-col gap-2">
      <span class="text-sm font-semibold uppercase tracking-[0.18em] text-sage-600">Supporting Toolkit</span>
      <p class="text-sm leading-relaxed text-sage-600">
        Everything that rounds out delivery around the core stack.
      </p>
    </header>
    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <SkillCategoryCard v-for="category in props.categories" :key="category.title" :category="category" />
    </div>
  </div>
</template>
