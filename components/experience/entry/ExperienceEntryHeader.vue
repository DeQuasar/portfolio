<script setup lang="ts">
import type { ExperienceEntry } from '~/types/content'

const props = defineProps<{
  entry: ExperienceEntry
  isActive: boolean
  entryDuration: string | null
}>()
</script>

<template>
  <header class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between transition-colors duration-500">
    <div class="space-y-1.5">
      <h3
        class="flex items-center font-display text-xl font-semibold transition-colors duration-500"
        :class="props.isActive ? 'text-sage-900' : 'text-sage-600'"
      >
        <span>{{ props.entry.role }}</span>
      </h3>
      <p
        class="text-sm font-semibold transition-colors duration-500"
        :class="props.isActive ? 'text-sage-600' : 'text-sage-500'"
      >
        {{ props.entry.organization }}
      </p>
      <p v-if="props.entry.location" class="text-sm text-sage-500">
        {{ props.entry.location }}
      </p>
    </div>
    <div class="flex flex-col items-start gap-1 text-left sm:items-end sm:text-right">
      <p
        class="text-sm font-semibold uppercase tracking-[0.18em] transition-colors duration-500"
        :class="props.isActive ? 'text-sage-600' : 'text-sage-500'"
      >
        {{ props.entry.period }}
      </p>
      <p
        v-if="props.entryDuration"
        class="text-xs text-sage-500 transition-colors duration-500"
        :class="props.isActive ? 'text-sage-600/90' : ''"
      >
        {{ props.entryDuration }}
      </p>
    </div>
  </header>
</template>
