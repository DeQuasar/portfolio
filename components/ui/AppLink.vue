<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { isExternalUrl } from '~/utils/url'

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    href: string
    variant?: 'primary' | 'secondary' | 'ghost' | 'icon' | 'minimal' | 'cta'
    target?: string
    rel?: string
    block?: boolean
  }>(),
  {
    variant: 'secondary',
    target: undefined,
    rel: undefined,
    block: false,
  },
)

const emit = defineEmits<{
  (event: 'click', payload: MouseEvent): void
}>()

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
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-sage-50'

const variantClasses: Record<NonNullable<typeof props.variant>, string> = {
  primary:
    'bg-sage-500 text-white shadow-lg px-6 py-3 hover:bg-sage-600 hover:shadow-xl focus-visible:ring-opacity-60',
  secondary:
    'border border-sage-300 bg-white/85 text-sage-600 shadow-sm px-5 py-2.5 hover:border-sage-500 hover:text-sage-700',
  ghost:
    'border border-dashed border-sage-300 bg-white/60 text-sage-500 px-4 py-2 hover:border-sage-500 hover:text-sage-700',
  icon:
    'inline-flex h-12 w-12 items-center justify-center !gap-0 rounded-full border border-sage-300 bg-white/85 text-sage-600 shadow-sm transition-all duration-200 hover:border-sage-500 hover:bg-white hover:text-sage-700 hover:shadow-md',
  minimal:
    'px-0 py-0 text-sage-600 font-medium hover:text-sage-700',
  cta:
    'relative overflow-hidden bg-gradient-to-r from-sage-600 via-sage-500 to-sage-700 text-white shadow-[0_14px_28px_-18px_rgba(47,70,49,0.55)] px-5 py-2 text-sm font-semibold uppercase tracking-[0.16em] transition-transform duration-200 hover:translate-y-[-1px] hover:shadow-[0_22px_44px_-24px_rgba(31,52,36,0.6)] focus-visible:ring-white/60'
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

const targetAttr = computed(() => {
  if (props.target !== undefined) {
    return props.target
  }
  return isExternalUrl(props.href) ? '_blank' : undefined
})

const rel = computed(() => {
  if (targetAttr.value === '_blank') {
    return props.rel ?? 'noopener noreferrer'
  }
  return props.rel
})
</script>

<template>
  <a
    :href="props.href"
    :target="targetAttr"
    :rel="rel"
    :class="classes"
    v-bind="forwardedAttrs"
    @click="emit('click', $event)"
  >
    <slot />
  </a>
</template>
