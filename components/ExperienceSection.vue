<script setup lang="ts">
import ExperienceSectionBase from '~/components/experience/ExperienceSectionBase.vue'
import type { ExperienceContent } from '~/types/content'

const props = defineProps<{ experience: ExperienceContent }>()
</script>

<template>
  <ExperienceSectionBase :experience="props.experience" />
</template>
