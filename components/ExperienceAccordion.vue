<script setup lang="ts">
import { ref } from 'vue'
import CardSurface from '~/components/ui/CardSurface.vue'
import SectionHeader from '~/components/ui/SectionHeader.vue'
import type { ExperienceContent, ExperienceEntry, ExperienceProject } from '~/types/content'
import AppButton from '~/components/ui/AppButton.vue'
import ProjectModal from '~/components/ProjectModal.vue'

const props = defineProps<{ experience: ExperienceContent }>()

const openSlug = ref<string | null>(null)
const modalOpen = ref(false)
const activeProject = ref<ExperienceProject | null>(null)

const toggle = (entry: ExperienceEntry) => {
  openSlug.value = openSlug.value === entry.slug ? null : entry.slug
}

const openModal = (project: ExperienceProject) => {
  activeProject.value = project
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  activeProject.value = null
}
</script>

<template>
  <section class="mt-24 flex flex-col gap-8">
    <SectionHeader title="Experience" accent="double-bar" />

    <div class="flex flex-col gap-6">
      <CardSurface
        v-for="entry in props.experience.entries"
        :key="entry.slug"
        class="space-y-4"
      >
        <button
          class="flex w-full items-center justify-between gap-4 rounded-2xl border border-sage-200/60 bg-sage-50/60 px-6 py-4 text-left transition duration-200 hover:border-sage-300 hover:bg-sage-50"
          type="button"
          @click="toggle(entry)"
        >
          <div class="flex-1">
            <h3 class="font-display text-xl font-semibold text-sage-700">{{ entry.role }}</h3>
            <p class="mt-1 text-sm font-semibold text-sage-600">
              {{ entry.organization }}
              <span v-if="entry.location" class="font-normal text-sage-500">· {{ entry.location }}</span>
            </p>
          </div>
          <div class="flex items-center gap-3 text-sm font-semibold text-sage-500">
            <span>{{ entry.period }}</span>
            <span
              class="inline-block text-lg transition-transform duration-200"
              :class="{ 'rotate-90': openSlug === entry.slug }"
              aria-hidden="true"
            >
              ›
            </span>
          </div>
        </button>
        <Transition name="fade-slide">
          <div v-if="openSlug === entry.slug" class="grid gap-5 px-1 pb-2">
            <ul class="list-disc space-y-2 pl-5 text-left text-sm leading-relaxed text-sage-600">
              <li v-for="bullet in entry.summary" :key="bullet">
                {{ bullet }}
              </li>
            </ul>
            <div v-if="entry.projects?.length" class="grid gap-4">
              <div
                v-for="project in entry.projects"
                :key="project.title"
                class="grid gap-3 rounded-2xl border border-sage-200 bg-white/95 p-5"
              >
                <div class="space-y-1">
                  <h4 class="font-display text-lg font-semibold text-sage-700">{{ project.title }}</h4>
                  <p class="text-sm text-sage-600">{{ project.summary }}</p>
                </div>
                <div class="grid gap-3 text-sm text-sage-600">
                  <p><span class="font-semibold text-sage-500">Problem:</span> {{ project.problem }}</p>
                  <p><span class="font-semibold text-sage-500">Contribution:</span> {{ project.contribution }}</p>
                  <p><span class="font-semibold text-sage-500">Impact:</span> {{ project.impact }}</p>
                </div>
                <AppButton
                  variant="secondary"
                  class="justify-self-start px-4 py-2"
                  type="button"
                  @click="openModal(project)"
                >
                  Learn more
                </AppButton>
              </div>
            </div>
          </div>
        </Transition>
      </CardSurface>
    </div>
    <ProjectModal :open="modalOpen" :project="activeProject" @close="closeModal" />
  </section>
</template>
