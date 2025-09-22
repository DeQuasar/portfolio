<script setup lang="ts">
import { computed } from 'vue'

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

const classes = computed(() => [baseClasses, variantClasses[props.variant], props.block && 'w-full'])

const rel = computed(() => {
  if (props.target === '_blank') {
    return props.rel ?? 'noopener noreferrer'
  }
  return props.rel
})
</script>

<template>
  <a
    :href="props.href"
    :target="props.target"
    :rel="rel"
    :class="classes"
    @click="emit('click', $event)"
  >
    <slot />
  </a>
</template>
