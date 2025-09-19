<script setup lang="ts">
import type { ProjectContent } from '~/types/content'

const props = defineProps<{
  project: ProjectContent
  flipped?: boolean
}>()
</script>

<template>
  <section :class="['deep-dive', { 'deep-dive--flipped': props.flipped }]">
    <div class="deep-dive__copy">
      <p class="deep-dive__label">Case Study</p>
      <h3 class="deep-dive__title">{{ props.project.title }}</h3>
      <p class="deep-dive__summary">{{ props.project.summary }}</p>

      <div class="deep-dive__block">
        <h4>Problem</h4>
        <p>{{ props.project.problem }}</p>
      </div>

      <div class="deep-dive__block">
        <h4>What I did</h4>
        <ul>
          <li v-for="item in props.project.contribution" :key="item">{{ item }}</li>
        </ul>
      </div>

      <div class="deep-dive__block">
        <h4>Impact</h4>
        <ul>
          <li v-for="item in props.project.impact" :key="item">{{ item }}</li>
        </ul>
      </div>

      <p class="deep-dive__availability" v-if="props.project.availability">
        {{ props.project.availability }}
      </p>

      <div class="deep-dive__stack">
        <span v-for="tech in props.project.stack" :key="tech">{{ tech }}</span>
      </div>
    </div>

    <div class="deep-dive__visual" aria-hidden="true">
      <div class="deep-dive__placeholder">
        <span>Project visuals coming soon</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.deep-dive {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-xl);
  align-items: center;
  margin-top: var(--space-xxl);
}

.deep-dive--flipped {
  direction: rtl;
}

.deep-dive--flipped > * {
  direction: ltr;
}

.deep-dive__copy {
  display: grid;
  gap: var(--space-md);
}

.deep-dive__label {
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.deep-dive__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 2.75rem);
}

.deep-dive__summary {
  color: var(--color-text-muted);
  margin: 0;
}

.deep-dive__block h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.deep-dive__block ul {
  padding-left: 1.2rem;
  margin: 0;
  display: grid;
  gap: 0.35rem;
}

.deep-dive__availability {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.deep-dive__stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.deep-dive__stack span {
  background: rgba(74, 108, 77, 0.1);
  color: var(--color-primary-start);
  border-radius: var(--radius-pill);
  padding: 0.35rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.deep-dive__visual {
  display: flex;
  justify-content: center;
}

.deep-dive__placeholder {
  width: 100%;
  min-height: 280px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(74,108,77,0.08), rgba(110,139,109,0.16));
  display: grid;
  place-items: center;
  color: var(--color-primary-start);
  font-weight: 600;
  letter-spacing: 0.08em;
}

@media (max-width: 960px) {
  .deep-dive {
    grid-template-columns: 1fr;
  }

  .deep-dive--flipped {
    direction: ltr;
  }
}
</style>
