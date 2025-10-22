<script setup lang="ts">
import { computed } from 'vue'
import Pill from '~/components/ui/Pill.vue'
import type { ExperienceToolkitDisplay } from '~/composables/useExperienceSection'

const props = defineProps<{
  toolkitDisplay: ExperienceToolkitDisplay
  toolkitExpanded: boolean
  onToggleToolkit: () => void
  isHydrated: boolean
}>()

const buttonLabel = computed(() => (props.toolkitExpanded ? 'Show fewer tools' : 'Show full toolkit'))
const toolkitItems = computed(() => props.toolkitDisplay.visible ?? [])
</script>

<template>
  <div v-if="toolkitItems.length" class="flex flex-col gap-3">
    <header class="flex flex-col gap-1">
      <span class="text-xs font-semibold uppercase tracking-[0.18em] text-sage-500">Toolkit</span>
    </header>
    <div class="flex flex-wrap gap-2">
      <Pill
        v-for="tool in toolkitItems"
        :key="tool"
        tone="neutral"
        size="sm"
        class="px-3 py-1 text-[0.78rem] tracking-[0.08em]"
      >
        {{ tool }}
      </Pill>
    </div>
    <button
      v-if="props.toolkitDisplay.hasOverflow && props.isHydrated"
      type="button"
      class="self-start inline-flex min-h-[40px] items-center rounded-full border border-sage-200/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-sage-500 transition-colors hover:border-sage-400 hover:text-sage-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300"
      :aria-expanded="props.toolkitExpanded"
      @click="props.onToggleToolkit()"
    >
      {{ buttonLabel }}
    </button>
  </div>
</template>
