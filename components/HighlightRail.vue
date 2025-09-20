<script setup lang="ts">
import CardSurface from '~/components/ui/CardSurface.vue'
import Pill from '~/components/ui/Pill.vue'
import SectionHeader from '~/components/ui/SectionHeader.vue'
import type { HighlightContent } from '~/types/content'
import AppLink from '~/components/ui/AppLink.vue'

const props = defineProps<{ highlights: HighlightContent[] }>()
</script>

<template>
  <section class="mt-24 flex flex-col gap-8">
    <SectionHeader title="Highlight Reel" />

    <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <CardSurface
        v-for="item in props.highlights"
        :key="item.slug"
        class="grid gap-4"
        padding="md"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-sage-500">{{ item.role }}</p>
        <h3 class="font-display text-xl font-semibold text-sage-700">{{ item.title }}</h3>
        <p class="text-sm leading-relaxed text-sage-600">{{ item.impact }}</p>
        <ul class="flex flex-wrap gap-2">
          <li v-for="tech in item.stack" :key="tech">
            <Pill size="sm">{{ tech }}</Pill>
          </li>
        </ul>
        <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-sage-500">
          <span v-if="item.confidentiality">{{ item.confidentiality }}</span>
          <AppLink
            v-if="item.cta"
            :href="item.cta.href"
            variant="minimal"
            class="font-semibold text-sage-600 underline decoration-sage-400 underline-offset-4 transition hover:text-sage-700"
          >
            {{ item.cta.label }}
          </AppLink>
        </div>
      </CardSurface>
    </div>
  </section>
</template>
