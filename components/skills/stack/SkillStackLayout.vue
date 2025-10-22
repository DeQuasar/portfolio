<script setup lang="ts">
import SectionHeader from '~/components/ui/SectionHeader.vue'

const props = defineProps<{
  intro: string
}>()
</script>

<template>
  <section class="flex flex-col gap-14" data-testid="skill-stack-section">
    <SectionHeader title="Skills &amp; Tools" :description="props.intro" />

    <div class="flex flex-col gap-16">
      <slot />
    </div>
  </section>
</template>
