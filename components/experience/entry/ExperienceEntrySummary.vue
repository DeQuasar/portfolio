<script setup lang="ts">
const props = defineProps<{
  summary?: string[] | null
}>()
</script>

<template>
  <ul
    v-if="props.summary && props.summary.length"
    class="list-disc space-y-2 pl-5 text-left text-sm leading-relaxed text-sage-600 marker:text-sage-400"
  >
    <li v-for="point in props.summary" :key="point">
      {{ point }}
    </li>
  </ul>
</template>
