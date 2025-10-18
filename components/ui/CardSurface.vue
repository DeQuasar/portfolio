<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

type Rounded = 'md' | 'lg' | 'xl'

type Padding = 'none' | 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    tag?: string
    rounded?: Rounded
    padding?: Padding
    hoverable?: boolean
    surfaceClass?: string
  }>(),
  {
    tag: 'div',
    rounded: 'xl',
    padding: 'md',
    hoverable: false,
    surfaceClass: ''
  }
)

const roundedClasses: Record<Rounded, string> = {
  md: 'rounded-2xl',
  lg: 'rounded-[2rem]',
  xl: 'rounded-3xl'
}

const paddingClasses: Record<Padding, string> = {
  none: '',
  sm: 'p-5 sm:p-6',
  md: 'p-6 sm:p-8',
  lg: 'p-8 sm:p-10'
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

const forwardedAttrs = computed(() => {
  const entries = Object.entries(attrs).filter(([key]) => key !== 'class')
  return Object.fromEntries(entries)
})

const normalizedClasses = computed(() => {
  const tokens = new Set<string>()
  const addTokens = (value: unknown) => {
    flattenClassTokens(value).forEach((token) => tokens.add(token))
  }

  addTokens('bg-white shadow-card')
  addTokens(roundedClasses[props.rounded])
  addTokens(paddingClasses[props.padding])
  if (props.hoverable) {
    tokens.add('transition-shadow')
  }
  addTokens(props.surfaceClass)
  addTokens(attrs.class)

  return Array.from(tokens)
})
</script>

<template>
  <component :is="props.tag" :class="normalizedClasses" v-bind="forwardedAttrs">
    <slot />
  </component>
</template>
