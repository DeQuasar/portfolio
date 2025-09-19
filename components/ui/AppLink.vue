<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    href: string
    variant?: 'primary' | 'secondary' | 'ghost' | 'icon' | 'minimal'
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

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-sage-50'

const variantClasses: Record<NonNullable<typeof props.variant>, string> = {
  primary:
    'bg-sage-500 text-white shadow-lg px-6 py-3 hover:bg-sage-600 hover:-translate-y-0.5 focus-visible:ring-opacity-60',
  secondary:
    'border border-sage-300 bg-white/85 text-sage-600 shadow-sm px-5 py-2.5 hover:border-sage-500 hover:text-sage-700',
  ghost:
    'border border-dashed border-sage-300 bg-white/60 text-sage-500 px-4 py-2 hover:border-sage-500 hover:text-sage-700',
  icon:
    'h-12 w-12 rounded-full border border-sage-300 bg-white/80 text-sage-600 shadow-sm hover:border-sage-500 hover:text-sage-700',
  minimal:
    'px-0 py-0 text-sage-600 font-medium hover:text-sage-700',
}

const classes = computed(() => [baseClasses, variantClasses[props.variant], props.block && 'w-full'])

const rel = computed(() => {
  if (props.target === '_blank') {
    return props.rel ?? 'noopener noreferrer'
  }
  return props.rel
})
</script>

<template>
  <a :href="props.href" :target="props.target" :rel="rel" :class="classes">
    <slot />
  </a>
</template>
