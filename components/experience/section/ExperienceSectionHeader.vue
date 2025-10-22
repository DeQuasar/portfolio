<script setup lang="ts">
import SectionHeader from '~/components/ui/SectionHeader.vue'

defineOptions({ name: 'ExperienceSectionHeader' })

const props = defineProps<{
  title: string
  accent?: 'single-bar' | 'double-bar' | 'dot'
}>()
</script>

<template>
  <SectionHeader :title="props.title" :accent="props.accent ?? 'double-bar'" />
</template>
