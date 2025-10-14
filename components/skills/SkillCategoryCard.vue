<script setup lang="ts">
import CardSurface from '~/components/ui/CardSurface.vue'
import Pill from '~/components/ui/Pill.vue'
import type { SkillCategoryDisplay } from '~/composables/useSkillStack'

defineProps<{ category: SkillCategoryDisplay }>()
</script>

<template>
  <CardSurface
    padding="sm"
    rounded="lg"
    :surface-class="'border border-sage-200/80 bg-white shadow-card'"
    class="flex h-full flex-col gap-5 text-left"
  >
    <div class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-[0.24em] text-sage-600">Category</p>
      <h3 class="font-display text-[1.25rem] font-semibold text-sage-700">{{ category.title }}</h3>
      <p v-if="category.description" class="text-sm leading-relaxed text-sage-600">
        {{ category.description }}
      </p>
    </div>
    <ul class="flex flex-wrap gap-2" role="list">
      <li v-for="item in category.skills" :key="item.label">
        <Pill
          tone="neutral"
          size="md"
          class="justify-center px-3.5 py-1.5 text-[0.82rem] tracking-[0.06em]"
        >
          {{ item.label }}
        </Pill>
      </li>
    </ul>
  </CardSurface>
</template>
