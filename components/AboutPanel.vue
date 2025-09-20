<script setup lang="ts">
import SectionHeader from '~/components/ui/SectionHeader.vue'
import Pill from '~/components/ui/Pill.vue'
import type { AboutContent } from '~/types/content'

const props = defineProps<{ about: AboutContent }>()
</script>

<template>
  <section class="mt-24 space-y-8">
    <SectionHeader
      eyebrow="About"
      :title="props.about.headline"
      :description="props.about.bio ?? ''"
    />

    <div class="flex flex-wrap justify-center gap-2.5">
      <Pill
        v-for="trait in props.about.traits"
        :key="trait"
        size="sm"
      >
        {{ trait }}
      </Pill>
    </div>

    <p class="text-center text-base font-semibold text-sage-600">
      {{ props.about.availability }}
    </p>
  </section>
</template>
