<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useBreakpoints } from '@vueuse/core'
import SkillStackLayout from '~/components/skills/stack/SkillStackLayout.vue'
import SkillStackSections from '~/components/skills/stack/SkillStackSections.vue'
import { useSkillStack } from '~/composables/useSkillStack'
import type { SkillsContent, ExperienceContent } from '~/types/content'

defineOptions({ name: 'SkillStackBase' })

const props = defineProps<{ skills: SkillsContent; experience?: ExperienceContent | null }>()

const skillsRef = computed(() => props.skills)
const experienceRef = computed(() => props.experience ?? null)

const {
  coreGroups,
  coreDescription,
  supportingCategories,
  additionalSkills
} = useSkillStack({ skills: skillsRef, experience: experienceRef })

const breakpoints = useBreakpoints({
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
})

const mobileQuery = breakpoints.smaller('sm')
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

const isMobile = computed(() => (isMounted.value ? mobileQuery.value : false))
const ADDITIONAL_MOBILE_LIMIT = 5
const additionalExpanded = ref(false)

const hasAdditionalOverflow = computed(() => (
  isMobile.value && additionalSkills.value.length > ADDITIONAL_MOBILE_LIMIT
))

const additionalVisibleSkills = computed(() => {
  if (!isMobile.value || additionalExpanded.value) {
    return additionalSkills.value
  }
  return additionalSkills.value.slice(0, ADDITIONAL_MOBILE_LIMIT)
})

const toggleAdditional = () => {
  additionalExpanded.value = !additionalExpanded.value
}
</script>

<template>
  <SkillStackLayout :intro="props.skills.intro ?? ''">
    <SkillStackSections
      :core-groups="coreGroups"
      :core-description="coreDescription"
      :supporting-categories="supportingCategories"
      :additional-skills="additionalVisibleSkills"
      :has-additional-overflow="hasAdditionalOverflow"
      :additional-expanded="additionalExpanded"
      :on-toggle-additional="toggleAdditional"
    />
  </SkillStackLayout>
</template>
