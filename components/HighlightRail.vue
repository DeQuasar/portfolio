<script setup lang="ts">
import type { HighlightContent } from '~/types/content'
import AppLink from '~/components/ui/AppLink.vue'

const props = defineProps<{ highlights: HighlightContent[] }>()
</script>

<template>
  <section class="highlight-rail">
    <h2 class="section-title">Highlight Reel</h2>
    <div class="highlight-rail__grid">
      <article
        v-for="item in props.highlights"
        :key="item.slug"
        class="highlight-card"
      >
        <p class="highlight-card__role">{{ item.role }}</p>
        <h3>{{ item.title }}</h3>
        <p class="highlight-card__impact">{{ item.impact }}</p>
        <ul class="highlight-card__stack">
          <li v-for="tech in item.stack" :key="tech">{{ tech }}</li>
        </ul>
        <div class="highlight-card__footer">
          <span class="highlight-card__confidentiality" v-if="item.confidentiality">
            {{ item.confidentiality }}
          </span>
          <AppLink v-if="item.cta" :href="item.cta.href" variant="minimal" class="highlight-card__cta">
            {{ item.cta.label }}
          </AppLink>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.highlight-rail {
  margin-top: var(--space-xxl);
}

.highlight-rail__grid {
  display: grid;
  gap: var(--space-md);
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.highlight-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
  display: grid;
  gap: var(--space-sm);
}

.highlight-card h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.5rem;
}

.highlight-card__role {
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  color: var(--color-text-muted);
}

.highlight-card__impact {
  margin: 0;
  color: var(--color-text-muted);
}

.highlight-card__stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.highlight-card__stack li {
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-pill);
  background: rgba(74, 108, 77, 0.1);
  color: var(--color-primary-start);
  font-size: 0.8rem;
  font-weight: 600;
}

.highlight-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.highlight-card__cta {
  font-weight: 600;
  color: var(--color-primary-start);
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.highlight-card__cta:hover {
  border-color: var(--color-primary-start);
  color: var(--color-primary-end);
}

.highlight-card__confidentiality {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
</style>
