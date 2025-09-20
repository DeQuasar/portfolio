<script setup lang="ts">
import SectionHeader from '~/components/ui/SectionHeader.vue'
import Pill from '~/components/ui/Pill.vue'
import type { ProjectContent } from '~/types/content'

const props = defineProps<{
  project: ProjectContent
  flipped?: boolean
}>()
</script>

<template>
  <section
    :class="[
      'mt-24 flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16',
      props.flipped && 'lg:flex-row-reverse'
    ]"
  >
    <div class="flex-1 space-y-6">
      <SectionHeader
        eyebrow="Case Study"
        :title="props.project.title"
        :description="props.project.summary"
        align="left"
      />

      <div class="space-y-3">
        <h4 class="text-xs font-semibold uppercase tracking-[0.16em] text-sage-500">Problem</h4>
        <p class="text-base leading-relaxed text-sage-600">{{ props.project.problem }}</p>
      </div>

      <div class="space-y-3">
        <h4 class="text-xs font-semibold uppercase tracking-[0.16em] text-sage-500">What I did</h4>
        <ul class="list-disc space-y-2 pl-5 text-base leading-relaxed text-sage-600">
          <li v-for="item in props.project.contribution" :key="item">
            {{ item }}
          </li>
        </ul>
      </div>

      <div class="space-y-3">
        <h4 class="text-xs font-semibold uppercase tracking-[0.16em] text-sage-500">Impact</h4>
        <ul class="list-disc space-y-2 pl-5 text-base leading-relaxed text-sage-600">
          <li v-for="item in props.project.impact" :key="item">
            {{ item }}
          </li>
        </ul>
      </div>

      <p
        v-if="props.project.availability"
        class="text-sm font-semibold uppercase tracking-[0.15em] text-sage-500"
      >
        {{ props.project.availability }}
      </p>

      <div class="flex flex-wrap gap-2">
        <Pill v-for="tech in props.project.stack" :key="tech" size="sm">{{ tech }}</Pill>
      </div>
    </div>

    <div class="flex flex-1 justify-center" aria-hidden="true">
      <div class="flex w-full min-h-[280px] items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#e3ede5,#c9d9cc)] text-sm font-semibold uppercase tracking-[0.15em] text-sage-600">
        <span>Project visuals coming soon</span>
      </div>
    </div>
  </section>
</template>
