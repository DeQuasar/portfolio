<script setup lang="ts">
import type { AboutContent } from '~/types/content'

const props = defineProps<{ about: AboutContent }>()
</script>

<template>
  <section class="about">
    <h2 class="section-title">About</h2>
    <h3 class="about__headline">{{ props.about.headline }}</h3>
    <p v-if="props.about.bio" class="about__body">{{ props.about.bio }}</p>
    <ul class="about__traits">
      <li v-for="trait in props.about.traits" :key="trait">
        {{ trait }}
      </li>
    </ul>
    <p class="about__availability">{{ props.about.availability }}</p>
  </section>
</template>

<style scoped>
.about {
  margin-top: var(--space-xxl);
  text-align: center;
}

.about__headline {
  font-family: var(--font-display);
  font-size: 1.75rem;
  margin: 0 0 var(--space-sm);
}

.about__body {
  max-width: 48rem;
  margin: 0 auto var(--space-md);
  color: var(--color-text-muted);
}

.about__traits {
  list-style: none;
  padding: 0;
  margin: 0 auto var(--space-md);
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
}

.about__traits li {
  padding: 0.45rem 0.9rem;
  border-radius: var(--radius-pill);
  background: rgba(74, 108, 77, 0.1);
  color: var(--color-primary-start);
  font-weight: 600;
  letter-spacing: 0.03em;
}

.about__availability {
  font-weight: 600;
  color: var(--color-primary-start);
}
</style>
