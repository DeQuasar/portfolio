<script setup lang="ts">
import { computed } from 'vue'
import ExperienceProjectCard from '~/components/experience/ExperienceProjectCard.vue'
import type { ExperienceEntry } from '~/types/content'
import type { ExperienceProjectHighlightDisplay } from '~/composables/useExperienceSection'

const props = defineProps<{
  projects: ExperienceEntry['projects']
  getProjectHighlights: (projectTitle: string) => ExperienceProjectHighlightDisplay[]
  getActiveProjectHighlight: (projectTitle: string) => ExperienceProjectHighlightDisplay | null
}>()

const projectList = computed(() => props.projects ?? [])
</script>

<template>
  <ExperienceProjectCard
    v-for="project in projectList"
    :key="project.title"
    :project="project"
    :highlights="props.getProjectHighlights(project.title)"
    :active-highlight="props.getActiveProjectHighlight(project.title)"
  />
</template>
