<script setup lang="ts">
import { ref } from 'vue'
import type { ExperienceContent, ExperienceEntry, ExperienceProject } from '~/types/content'
import AppButton from '~/components/ui/AppButton.vue'

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
  <section class="experience">
    <h2 class="section-title">Experience</h2>
    <div class="experience__list">
      <article
        v-for="entry in props.experience.entries"
        :key="entry.slug"
        class="experience__item"
      >
        <button class="experience__header" type="button" @click="toggle(entry)">
          <div>
            <h3>{{ entry.role }}</h3>
            <p class="experience__org">{{ entry.organization }} · {{ entry.location }}</p>
          </div>
          <div class="experience__meta">
            <span>{{ entry.period }}</span>
            <span class="experience__indicator" :class="{ 'experience__indicator--open': openSlug === entry.slug }">›</span>
          </div>
        </button>
        <transition name="accordion">
          <div v-if="openSlug === entry.slug" class="experience__panel">
            <ul class="experience__bullets">
              <li v-for="bullet in entry.summary" :key="bullet">{{ bullet }}</li>
            </ul>
            <div class="experience__projects">
              <div
                v-for="project in entry.projects"
                :key="project.title"
                class="experience__project-card"
              >
                <h4>{{ project.title }}</h4>
                <p>{{ project.summary }}</p>
                <AppButton variant="secondary" class="experience__project-button" type="button" @click="openModal(project)">
                  Learn more
                </AppButton>
              </div>
            </div>
          </div>
        </transition>
      </article>
    </div>
    <ProjectModal :open="modalOpen" :project="activeProject" @close="closeModal" />
  </section>
</template>

<style scoped>
.experience {
  margin-top: var(--space-xxl);
}

.experience__list {
  display: grid;
  gap: var(--space-md);
}

.experience__item {
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.experience__header {
  width: 100%;
  text-align: left;
  padding: var(--space-lg);
  border: none;
  background: transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
  cursor: pointer;
}

.experience__header h3 {
  margin: 0;
  font-size: 1.4rem;
}

.experience__org {
  color: var(--color-text-muted);
  margin: 0;
}

.experience__meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.experience__indicator {
  display: inline-block;
  transition: transform 0.2s ease;
}

.experience__indicator--open {
  transform: rotate(90deg);
}

.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.2s ease;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

.experience__panel {
  padding: 0 var(--space-lg) var(--space-lg);
  display: grid;
  gap: var(--space-md);
}

.experience__bullets {
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.5rem;
}

.experience__projects {
  display: grid;
  gap: var(--space-sm);
}

.experience__project-card {
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  padding: var(--space-md);
  display: grid;
  gap: 0.5rem;
}

.experience__project-card h4 {
  margin: 0;
  font-size: 1.1rem;
}

.experience__project-button {
  justify-self: start;
}
</style>
