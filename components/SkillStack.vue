<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBreakpoints } from '@vueuse/core'
import SectionHeader from '~/components/ui/SectionHeader.vue'
import Pill from '~/components/ui/Pill.vue'
import SkillCoreGroupCard from '~/components/skills/SkillCoreGroupCard.vue'
import SkillCategoryCard from '~/components/skills/SkillCategoryCard.vue'
import { useSkillStack } from '~/composables/useSkillStack'
import type { SkillsContent, ExperienceContent } from '~/types/content'

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
const isMobile = computed(() => {
  if (process.client) {
    return mobileQuery.value
  }
  return true
})
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
  <section class="flex flex-col gap-14">
    <SectionHeader title="Skills &amp; Tools" :description="props.skills.intro ?? ''" />

    <div class="flex flex-col gap-16">
      <div v-if="coreGroups.length" class="flex flex-col gap-5">
        <header class="flex flex-col gap-2">
          <span class="text-sm font-semibold uppercase tracking-[0.18em] text-sage-600">Core Stack</span>
          <p class="text-sm leading-relaxed text-sage-600">{{ coreDescription }}</p>
        </header>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkillCoreGroupCard v-for="group in coreGroups" :key="group.title" :group="group" />
        </div>
      </div>

      <div v-if="supportingCategories.length" class="flex flex-col gap-6">
        <header class="flex flex-col gap-2">
          <span class="text-sm font-semibold uppercase tracking-[0.18em] text-sage-600">Supporting Toolkit</span>
          <p class="text-sm leading-relaxed text-sage-600">
            Everything that rounds out delivery around the core stack.
          </p>
        </header>
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <SkillCategoryCard
            v-for="category in supportingCategories"
            :key="category.title"
            :category="category"
          />
        </div>
      </div>

      <div v-if="additionalSkills.length" class="flex flex-col gap-3">
        <header class="flex flex-col gap-2">
          <span class="text-sm font-semibold uppercase tracking-[0.18em] text-sage-600">Additional Tools</span>
          <p class="text-sm leading-relaxed text-sage-600">
            Extras that surface less often but stay in rotation.
          </p>
        </header>
        <div class="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Pill
            v-for="item in additionalVisibleSkills"
            :key="item.label"
            tone="neutral"
            size="md"
            class="w-full justify-center px-3.5 py-1.5 text-center text-[0.82rem] tracking-[0.06em] whitespace-normal break-words leading-snug sm:w-auto"
          >
            {{ item.label }}
          </Pill>
        </div>
        <button
          v-if="hasAdditionalOverflow"
          type="button"
          class="self-start inline-flex min-h-[44px] items-center rounded-full border border-sage-200/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-sage-500 transition-colors hover:border-sage-400 hover:text-sage-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300"
          :aria-expanded="additionalExpanded"
          @click="toggleAdditional"
        >
          {{ additionalExpanded ? 'Show fewer tools' : 'Show more tools' }}
        </button>
      </div>
    </div>
  </section>
</template>
