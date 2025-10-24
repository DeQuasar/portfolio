<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

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
  sage: 'bg-sage-100 text-sage-700 border border-[color:var(--border-soft)]',
  neutral: 'bg-white text-sage-700 border border-[color:var(--border-soft)]'
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1 text-xs tracking-[0.05em]',
  md: 'px-4 py-2 text-sm tracking-[0.08em]'
}

const attrs = useAttrs() as Record<string, unknown>

const flattenClassTokens = (value: unknown): string[] => {
  if (!value) {
    return []
  }
  if (typeof value === 'string') {
    return value.split(/\s+/).filter(Boolean)
  }
  if (Array.isArray(value)) {
    return value.flatMap(flattenClassTokens)
  }
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, active]) => Boolean(active))
      .map(([token]) => token)
  }
  return []
}

const baseClasses = computed(() => [
  'inline-flex items-center gap-1 rounded-full font-semibold',
  toneClasses[props.tone],
  sizeClasses[props.size],
  props.uppercase && 'uppercase'
])

const forwardedAttrs = computed(() => {
  const entries = Object.entries(attrs).filter(([key]) => key !== 'class')
  return Object.fromEntries(entries)
})

const normalizedClasses = computed(() => {
  const tokens = new Set<string>()
  for (const entry of baseClasses.value) {
    flattenClassTokens(entry).forEach((token) => tokens.add(token))
  }
  flattenClassTokens(attrs.class).forEach((token) => tokens.add(token))
  return Array.from(tokens)
})
</script>

<template>
  <component :is="props.tag" :class="normalizedClasses" v-bind="forwardedAttrs">
    <slot />
  </component>
</template>
