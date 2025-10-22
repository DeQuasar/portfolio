<script setup lang="ts">
import SkillStackAdditional from '~/components/skills/stack/SkillStackAdditional.vue'
import SkillStackCoreGroups from '~/components/skills/stack/SkillStackCoreGroups.vue'
import SkillStackSupportingCategories from '~/components/skills/stack/SkillStackSupportingCategories.vue'
import type { SkillCategoryDisplay, SkillCoreGroupDisplay } from '~/composables/useSkillStack'

type ToolkitEntry = {
  label: string
  count: number
  sources: string[]
}

defineOptions({ name: 'SkillStackSections' })

const props = defineProps<{
  coreGroups: SkillCoreGroupDisplay[]
  coreDescription: string
  supportingCategories: SkillCategoryDisplay[]
  additionalSkills: ToolkitEntry[]
  hasAdditionalOverflow: boolean
  additionalExpanded: boolean
  onToggleAdditional: () => void
}>()
</script>

<template>
  <SkillStackCoreGroups :groups="props.coreGroups" :description="props.coreDescription" />

  <SkillStackSupportingCategories :categories="props.supportingCategories" />

  <SkillStackAdditional
    :skills="props.additionalSkills"
    :has-overflow="props.hasAdditionalOverflow"
    :expanded="props.additionalExpanded"
    :on-toggle="props.onToggleAdditional"
  />
</template>
