<script setup lang="ts">
import SkillStackBase from '~/components/skills/SkillStackBase.vue'
import type { SkillsContent, ExperienceContent } from '~/types/content'

const props = defineProps<{ skills: SkillsContent; experience?: ExperienceContent | null }>()
</script>

<template>
  <SkillStackBase :skills="props.skills" :experience="props.experience" />
</template>
