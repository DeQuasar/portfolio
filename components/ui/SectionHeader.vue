<script setup lang="ts">
import { computed } from 'vue'

type Align = 'left' | 'center'

type Accent = 'none' | 'double-bar'

const props = withDefaults(
  defineProps<{
    title: string
    eyebrow?: string
    description?: string
    align?: Align
    accent?: Accent
  }>(),
  {
    align: 'center',
    accent: 'none'
  }
)

const alignmentClasses = computed(() => (props.align === 'left' ? 'items-start text-left' : 'items-center text-center'))
</script>

<template>
  <header :class="['flex flex-col gap-4', alignmentClasses]">
    <slot name="eyebrow">
      <p
        v-if="props.eyebrow"
        class="text-xs font-semibold uppercase tracking-[0.18em] text-sage-500"
      >
        {{ props.eyebrow }}
      </p>
    </slot>

    <slot name="title">
      <h2 class="font-display text-3xl font-semibold text-sage-700">
        {{ props.title }}
      </h2>
    </slot>

    <div v-if="props.accent === 'double-bar'" class="flex flex-col items-center gap-1" :class="props.align === 'left' ? 'items-start' : 'items-center'">
      <span class="block h-1 w-28 rounded-full bg-sage-500"></span>
      <span class="block h-1 w-12 rounded-full bg-sage-300"></span>
    </div>

    <slot name="description">
      <p
        v-if="props.description"
        class="max-w-2xl text-base leading-relaxed text-sage-600"
        :class="props.align === 'left' ? '' : 'mx-auto'"
      >
        {{ props.description }}
      </p>
    </slot>

    <slot />
  </header>
</template>
