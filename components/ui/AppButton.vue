<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon' | 'minimal'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    type?: 'button' | 'submit' | 'reset'
    block?: boolean
  }>(),
  {
    variant: 'primary',
    type: 'button',
    block: false,
  },
)

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

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-sage-50 disabled:opacity-60 disabled:cursor-not-allowed'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-sage-600 text-white shadow-md px-6 py-3 hover:bg-sage-700 hover:shadow-lg focus-visible:ring-opacity-60',
  secondary:
    'border border-sage-300 bg-white/85 text-sage-600 shadow-sm px-5 py-2.5 hover:border-sage-500 hover:text-sage-700',
  ghost:
    'border border-dashed border-sage-300 bg-white/60 text-sage-500 px-4 py-2 hover:border-sage-500 hover:text-sage-700',
  icon:
    'h-12 w-12 rounded-full border border-sage-300 bg-white/85 text-sage-600 shadow-sm transition-all duration-200 hover:border-sage-500 hover:bg-white hover:text-sage-700 hover:shadow-md',
  minimal:
    'px-4 py-2 text-sage-500 hover:text-sage-700 font-medium',
}

const forwardedAttrs = computed(() => {
  const entries = Object.entries(attrs).filter(([key]) => key !== 'class')
  return Object.fromEntries(entries)
})

const classes = computed(() => {
  const tokens = new Set<string>()
  const addTokens = (value: unknown) => {
    flattenClassTokens(value).forEach((token) => tokens.add(token))
  }

  addTokens(baseClasses)
  addTokens(variantClasses[props.variant])
  if (props.block) {
    tokens.add('w-full')
  }
  addTokens(attrs.class)

  return Array.from(tokens)
})

const buttonRef = ref<HTMLButtonElement | null>(null)

const focus = (options?: FocusOptions) => {
  buttonRef.value?.focus(options)
}

defineExpose({
  el: buttonRef,
  focus,
})
</script>

<template>
  <button ref="buttonRef" :type="props.type" :class="classes" v-bind="forwardedAttrs">
    <slot />
  </button>
</template>
