<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useBreakpoints } from '@vueuse/core'
import CardSurface from '~/components/ui/CardSurface.vue'
import Pill from '~/components/ui/Pill.vue'
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
  <CardSurface
    padding="sm"
    rounded="lg"
    :surface-class="'border border-sage-200/80 bg-white shadow-card'"
    class="flex h-full flex-col gap-5 text-left"
  >
    <div class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-[0.24em] text-sage-600">Category</p>
      <h3 class="font-display text-[1.25rem] font-semibold text-sage-700">{{ category.title }}</h3>
      <p v-if="category.description" class="text-sm leading-relaxed text-sage-600">
        {{ category.description }}
      </p>
    </div>
    <ul class="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap">
      <li v-for="item in visibleSkills" :key="item.label" class="max-w-full">
        <Pill
          tone="neutral"
          size="md"
          class="w-full justify-center px-3.5 py-1.5 text-center text-[0.82rem] tracking-[0.06em] whitespace-normal break-words leading-snug sm:w-auto"
        >
          {{ item.label }}
        </Pill>
      </li>
    </ul>
    <button
      v-if="hasOverflow"
      type="button"
      class="self-start inline-flex min-h-[40px] items-center rounded-full border border-sage-200/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-sage-500 transition-colors hover:border-sage-400 hover:text-sage-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300 sm:hidden"
      :aria-expanded="expanded"
      @click="toggleExpanded"
    >
      {{ expanded ? 'Show fewer' : 'Show more' }}
    </button>
  </CardSurface>
</template>
