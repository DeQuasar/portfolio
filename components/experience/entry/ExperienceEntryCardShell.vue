<script setup lang="ts">
import CardSurface from '~/components/ui/CardSurface.vue'

const props = defineProps<{
  entrySlug: string
  isActive: boolean
  registerCard: (value: Element | { $el?: Element } | null) => void
  cardStyle: Record<string, string>
  glowOverlayStyle: Record<string, string>
}>()
</script>

<template>
  <CardSurface
    :id="`experience-${props.entrySlug}`"
    :ref="props.registerCard"
    class="group relative flex flex-col gap-6 overflow-hidden border border-sage-200/70 bg-white shadow-md transition-shadow duration-300 ease-out sm:shadow-[0_18px_44px_-30px_rgba(28,40,31,0.35)]"
    :class="[
      props.isActive && 'shadow-lg sm:shadow-[0_38px_120px_-32px_rgba(18,45,32,0.92),0_28px_72px_-30px_rgba(20,118,82,0.78),0_0_48px_-8px_rgba(40,210,150,0.42),inset_0_0_0_2px_rgba(34,196,138,0.85)]'
    ]"
    :style="props.cardStyle"
  >
    <span
      class="pointer-events-none absolute inset-[-6%] -z-10 hidden rounded-[inherit] transition-opacity duration-300 ease-out sm:block"
      :class="props.isActive ? 'opacity-95' : 'opacity-0'"
      :style="props.glowOverlayStyle"
    ></span>
    <slot />
  </CardSurface>
</template>
