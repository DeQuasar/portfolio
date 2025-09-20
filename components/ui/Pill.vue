<script setup lang="ts">
import { computed } from 'vue'

type Tone = 'sage' | 'neutral'

type Size = 'sm' | 'md'

type Tag = keyof HTMLElementTagNameMap

const props = withDefaults(
  defineProps<{
    tag?: Tag
    tone?: Tone
    size?: Size
    uppercase?: boolean
  }>(),
  {
    tag: 'span' as Tag,
    tone: 'sage' as Tone,
    size: 'md' as Size,
    uppercase: false
  }
)

const toneClasses: Record<Tone, string> = {
  sage: 'bg-sage-100/90 text-sage-600 border border-sage-200/70',
  neutral: 'bg-white/90 text-sage-600 border border-sage-200/60'
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1 text-xs tracking-[0.05em]',
  md: 'px-4 py-2 text-sm tracking-[0.08em]'
}

const baseClasses = computed(() => [
  'inline-flex items-center gap-1 rounded-full font-semibold',
  toneClasses[props.tone],
  sizeClasses[props.size],
  props.uppercase && 'uppercase'
])
</script>

<template>
  <component :is="props.tag" :class="baseClasses" v-bind="$attrs">
    <slot />
  </component>
</template>
