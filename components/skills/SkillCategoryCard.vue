<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useBreakpoints } from '@vueuse/core'
import type { SkillCategoryDisplay } from '~/composables/useSkillStack'

const props = defineProps<{ category: SkillCategoryDisplay }>()

const breakpoints = useBreakpoints({
  sm: 640
})

const mobileQuery = breakpoints.smaller('sm')

const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

const isMobile = computed(() => (isMounted.value ? mobileQuery.value : false))

const MOBILE_LIMIT = 5
const expanded = ref(false)

const hasOverflow = computed(() => (
  isMobile.value && props.category.skills.length > MOBILE_LIMIT
))

const visibleSkills = computed(() => {
  if (!isMobile.value || expanded.value) {
    return props.category.skills
  }
  return props.category.skills.slice(0, MOBILE_LIMIT)
})

const toggleExpanded = () => {
  expanded.value = !expanded.value
}
</script>

<template>
  <article class="group flex h-full flex-col rounded-2xl border border-sage-200/70 bg-white/80 p-5 text-left shadow-sm transition-shadow hover:shadow-md">
    <header class="space-y-1.5">
      <h3 class="font-display text-[1.15rem] font-semibold text-sage-800">{{ category.title }}</h3>
    </header>

    <ul class="mt-3 grid gap-2 text-sm text-sage-600 sm:grid-cols-2">
      <li
        v-for="item in visibleSkills"
        :key="item.label"
        class="flex items-start gap-2 leading-relaxed"
      >
        <span class="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-sage-300" aria-hidden="true" />
        <span class="flex-1 break-words">{{ item.label }}</span>
      </li>
    </ul>

    <button
      v-if="hasOverflow"
      type="button"
      class="mt-4 inline-flex items-center gap-2 self-start text-xs font-semibold uppercase tracking-[0.16em] text-sage-500 transition-colors hover:text-sage-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300 sm:hidden"
      :aria-expanded="expanded"
      @click="toggleExpanded"
    >
      <span>{{ expanded ? 'Show fewer' : 'Show more' }}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-3.5 w-3.5 transition-transform"
        :class="expanded ? 'rotate-180' : ''"
        aria-hidden="true"
      >
        <polyline points="4 6 8 10 12 6" />
      </svg>
    </button>
  </article>
</template>
