<script setup lang="ts">
import type { ExperienceProject } from '~/types/content'
import AppLink from '~/components/ui/AppLink.vue'

const props = defineProps<{
  project: ExperienceProject | null
  open: boolean
}>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="props.open"
        class="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-6"
        @click.self="emit('close')"
      >
        <div class="relative grid w-full max-w-xl gap-5 rounded-3xl bg-white p-10 text-sage-700 shadow-card">
          <button
            type="button"
            class="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-sage-200 bg-sage-50 text-2xl font-light text-sage-500 transition hover:border-sage-400 hover:text-sage-700"
            aria-label="Close project details"
            @click="emit('close')"
          >
            ×
          </button>
          <h3 class="font-display text-2xl font-semibold text-sage-700">
            {{ props.project?.title }}
          </h3>
          <div class="space-y-2">
            <h4 class="text-xs font-semibold uppercase tracking-[0.16em] text-sage-500">Problem</h4>
            <p class="text-sm leading-relaxed text-sage-600">{{ props.project?.problem }}</p>
          </div>
          <div class="space-y-2">
            <h4 class="text-xs font-semibold uppercase tracking-[0.16em] text-sage-500">Contribution</h4>
            <p class="text-sm leading-relaxed text-sage-600">{{ props.project?.contribution }}</p>
          </div>
          <div class="space-y-2">
            <h4 class="text-xs font-semibold uppercase tracking-[0.16em] text-sage-500">Impact</h4>
            <p class="text-sm leading-relaxed text-sage-600">{{ props.project?.impact }}</p>
          </div>
          <div v-if="props.project?.links?.length" class="flex flex-wrap gap-3 pt-2">
            <AppLink
              v-for="link in props.project?.links"
              :key="link.text"
              :href="link.url"
              target="_blank"
              rel="noopener"
              variant="secondary"
              class="px-4 py-2 text-sm"
            >
              {{ link.text }}
            </AppLink>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>
