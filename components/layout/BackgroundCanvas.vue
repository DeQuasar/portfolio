<script setup lang="ts">
defineOptions({ name: 'BackgroundCanvas' })

const props = defineProps<{
  wrapperClass?: string | string[]
  backgroundClass?: string | string[]
}>()
</script>

<template>
  <div :class="['absolute inset-0', props.wrapperClass]" aria-hidden="true">
    <div
      :class="['h-full w-full', props.backgroundClass ?? '']"
      :style="{
        background: 'var(--background-canvas)',
        backgroundColor: 'var(--surface-page)'
      }"
    ></div>
    <slot />
  </div>
</template>
