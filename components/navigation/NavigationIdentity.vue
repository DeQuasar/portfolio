<script setup lang="ts">
import type { HeroContent } from '~/types/content'

defineProps<{
  hero: HeroContent
}>()
</script>

<template>
  <div class="hidden flex-1 items-center justify-center gap-3 sm:flex sm:justify-start md:gap-4">
    <div class="flex flex-col items-center text-center leading-tight sm:items-start sm:text-left">
      <span class="font-display text-[0.95rem] font-semibold text-sage-700 sm:text-lg">{{ hero.name }}</span>
      <span class="text-sm font-semibold uppercase tracking-[0.16em] text-sage-600 sm:text-sm sm:tracking-[0.18em] md:text-base md:tracking-[0.2em]">
        {{ hero.role }}
      </span>
    </div>
  </div>
</template>
