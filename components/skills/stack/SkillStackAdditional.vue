<script setup lang="ts">
import { computed } from 'vue'
import Pill from '~/components/ui/Pill.vue'

const props = defineProps<{
  skills: Array<{ label: string; count: number; sources: string[] }>
  hasOverflow: boolean
  expanded: boolean
  onToggle: () => void
}>()

const buttonLabel = computed(() => (props.expanded ? 'Show fewer tools' : 'Show more tools'))
</script>

<template>
  <div v-if="props.skills.length" class="flex flex-col gap-3">
    <header class="flex flex-col gap-2">
      <span class="text-sm font-semibold uppercase tracking-[0.18em] text-sage-600">Additional Tools</span>
      <p class="text-sm leading-relaxed text-sage-600">
        Extras that surface less often but stay in rotation.
      </p>
    </header>
    <div class="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap">
      <Pill
        v-for="item in props.skills"
        :key="item.label"
        tone="neutral"
        size="md"
        class="w-full justify-center px-3.5 py-1.5 text-center text-[0.82rem] tracking-[0.06em] whitespace-normal break-words leading-snug sm:w-auto"
      >
        {{ item.label }}
      </Pill>
    </div>
    <button
      v-if="props.hasOverflow"
      type="button"
      class="self-start inline-flex min-h-[44px] items-center rounded-full border border-sage-200/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-sage-500 transition-colors hover:border-sage-400 hover:text-sage-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300"
      :aria-expanded="props.expanded"
      @click="props.onToggle()"
    >
      {{ buttonLabel }}
    </button>
  </div>
</template>
