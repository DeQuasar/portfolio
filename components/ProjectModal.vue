<script setup lang="ts">
import type { ExperienceProject } from '~/types/content'

const props = defineProps<{
  project: ExperienceProject | null
  open: boolean
}>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="props.open" class="modal" @click.self="emit('close')">
        <div class="modal__content">
          <button class="modal__close" @click="emit('close')">×</button>
          <h3>{{ props.project?.title }}</h3>
          <div class="modal__section">
            <h4>Problem</h4>
            <p>{{ props.project?.problem }}</p>
          </div>
          <div class="modal__section">
            <h4>Contribution</h4>
            <p>{{ props.project?.contribution }}</p>
          </div>
          <div class="modal__section">
            <h4>Impact</h4>
            <p>{{ props.project?.impact }}</p>
          </div>
          <div v-if="props.project?.links?.length" class="modal__links">
            <NuxtLink
              v-for="link in props.project?.links"
              :key="link.text"
              :href="link.url"
              target="_blank"
              rel="noopener"
            >
              {{ link.text }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: var(--space-lg);
}

.modal__content {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-xl);
  width: min(560px, 100%);
  position: relative;
  display: grid;
  gap: var(--space-md);
}

.modal__close {
  position: absolute;
  right: 1rem;
  top: 1rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal__section h4 {
  margin-bottom: 0.4rem;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.modal__links {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.modal__links a {
  color: var(--color-primary-start);
  font-weight: 600;
}
</style>
