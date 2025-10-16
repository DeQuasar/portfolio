<script setup lang="ts">
import { computed, ref } from 'vue'
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

const additionalPreviewLimit = 10
const additionalExpanded = ref(false)

const hasAdditionalOverflow = computed(() => additionalSkills.value.length > additionalPreviewLimit)
const additionalVisibleSkills = computed(() => (
  additionalExpanded.value || !hasAdditionalOverflow.value
    ? additionalSkills.value
    : additionalSkills.value.slice(0, additionalPreviewLimit)
))

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
        <div class="flex flex-wrap gap-2">
          <Pill
            v-for="item in additionalVisibleSkills"
            :key="item.label"
            tone="neutral"
            size="md"
            class="justify-center px-3.5 py-1.5 text-[0.82rem] tracking-[0.06em]"
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
