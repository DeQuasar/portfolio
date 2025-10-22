<script setup lang="ts">
import AppLink from '~/components/ui/AppLink.vue'

defineOptions({ name: 'FooterContactLinks' })

const props = defineProps<{
  actions: Array<{ label: string; href: string }>
}>()
</script>

<template>
  <div
    class="flex items-center justify-center gap-3"
  >
    <AppLink
      v-for="action in props.actions"
      :key="action.href"
      :href="action.href"
      variant="secondary"
      class="min-h-[44px] rounded-full border border-sage-200/70 bg-white px-4 py-2 text-sm font-semibold text-sage-600 shadow-sm transition hover:border-sage-400 hover:text-sage-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300"
    >
      {{ action.label }}
    </AppLink>
  </div>
</template>
