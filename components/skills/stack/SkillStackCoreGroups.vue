<script setup lang="ts">
import SkillCoreGroupCard from '~/components/skills/SkillCoreGroupCard.vue'
import type { SkillCoreGroupDisplay } from '~/composables/useSkillStack'

const props = defineProps<{
  groups: SkillCoreGroupDisplay[]
  description: string
}>()
</script>

<template>
  <div v-if="props.groups.length" class="flex flex-col gap-5">
    <header class="flex flex-col gap-2">
      <span class="text-sm font-semibold uppercase tracking-[0.18em] text-sage-600">Core Stack</span>
      <p class="text-sm leading-relaxed text-sage-600">{{ props.description }}</p>
    </header>
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <SkillCoreGroupCard v-for="group in props.groups" :key="group.title" :group="group" />
    </div>
  </div>
</template>
