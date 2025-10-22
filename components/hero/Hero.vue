<script setup lang="ts">
import HeroBase from './HeroBase.vue'
import type { HeroContent } from '~/types/content'

const props = defineProps<{ hero: HeroContent }>()
</script>

<template>
  <HeroBase :hero="props.hero" />
</template>
