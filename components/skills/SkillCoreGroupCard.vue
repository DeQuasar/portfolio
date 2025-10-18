<script setup lang="ts">
import CardSurface from '~/components/ui/CardSurface.vue'
import Pill from '~/components/ui/Pill.vue'
import type { SkillCoreGroupDisplay } from '~/composables/useSkillStack'

defineProps<{ group: SkillCoreGroupDisplay }>()
</script>

<template>
  <CardSurface
    padding="sm"
    rounded="lg"
    :surface-class="'border border-sage-200/80 bg-white shadow-card'"
    class="flex h-full flex-col gap-4"
  >
    <header class="space-y-1.5">
      <p class="text-xs font-semibold uppercase tracking-[0.24em] text-sage-600">Core Focus</p>
      <h3 class="font-display text-[1.3rem] font-semibold text-sage-700">{{ group.title }}</h3>
      <p v-if="group.description" class="text-sm leading-relaxed text-sage-600">
        {{ group.description }}
      </p>
    </header>
    <ul class="flex flex-col gap-2">
      <li v-for="item in group.skills" :key="item.label" class="flex flex-col gap-1">
        <Pill
          tone="sage"
          size="md"
          class="justify-center px-4 py-1.5 text-[0.9rem]"
        >
          {{ item.label }}
        </Pill>
      </li>
    </ul>
    <p v-if="group.roleCount" class="text-xs text-sage-500">
      Active across {{ group.roleCount }} role<span v-if="group.roleCount !== 1">s</span>
      <span v-if="group.organizations.length"> · {{ group.organizations.join(' · ') }}</span>
    </p>
  </CardSurface>
</template>
