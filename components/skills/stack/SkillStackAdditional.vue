<script setup lang="ts">
import { computed } from 'vue'
import Button from '~/components/ui/Button.vue'
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
    <Button
      v-if="props.hasOverflow"
      variant="secondary"
      class="self-start min-h-[44px] px-4 py-2 text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-sage-500 hover:-translate-y-0.5 sm:text-[0.8rem]"
      :aria-expanded="props.expanded"
      @click="props.onToggle()"
    >
      {{ buttonLabel }}
    </Button>
  </div>
</template>
