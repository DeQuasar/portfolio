<script setup lang="ts">
import { computed } from 'vue'
import Button from '~/components/ui/Button.vue'

defineOptions({ name: 'MobileMenuButton' })

const props = defineProps<{
  open: boolean
  label?: string
}>()

const emit = defineEmits<{
  (event: 'toggle'): void
}>()

const ariaLabel = computed(() => props.open ? 'Close navigation menu' : (props.label ?? 'Open navigation menu'))
</script>

<template>
  <Button
    variant="icon"
    :class="[
      '!h-9 !w-9 border-sage-200/70 bg-white/95 text-sage-600 shadow-sm transition hover:-translate-y-0.5 hover:border-sage-400 focus-visible:-translate-y-0.5 focus-visible:border-sage-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300',
      open && '!bg-sage-600 !text-white !border-sage-500 shadow-[0_18px_30px_-22px_rgba(25,65,40,0.55)]'
    ]"
    :aria-label="ariaLabel"
    type="button"
    @click="emit('toggle')"
  >
    <svg
      v-if="!open"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-[0.85rem] w-[0.85rem]"
      aria-hidden="true"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-[0.85rem] w-[0.85rem]"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </Button>
</template>
