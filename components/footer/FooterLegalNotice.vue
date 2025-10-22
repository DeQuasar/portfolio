<script setup lang="ts">
defineOptions({ name: 'FooterLegalNotice' })

const props = defineProps<{
  year: number
}>()
</script>

<template>
  <p>© {{ props.year }} Anthony Protano — Senior Software Developer</p>
</template>
