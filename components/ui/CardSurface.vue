<script setup lang="ts">
import { computed } from 'vue'

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

const baseClasses = computed(() => [
  'bg-white shadow-card',
  roundedClasses[props.rounded],
  paddingClasses[props.padding],
  props.hoverable && 'transition-shadow',
  props.surfaceClass
])
</script>

<template>
  <component :is="props.tag" :class="baseClasses" v-bind="$attrs">
    <slot />
  </component>
</template>
