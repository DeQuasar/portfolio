<script setup lang="ts">
import type { ContactContent } from '~/types/content'

const props = defineProps<{ contact: ContactContent }>()
</script>

<template>
  <footer class="contact">
    <div class="contact__card">
      <h2>Let’s work together</h2>
      <p v-if="props.contact.message" class="contact__body">{{ props.contact.message }}</p>
      <div class="contact__cta">
        <NuxtLink :href="props.contact.resumeUrl" class="contact__button contact__button--primary">
          Download Résumé
        </NuxtLink>
        <NuxtLink :href="`mailto:${props.contact.email}`" class="contact__button contact__button--secondary">
          Email Anthony
        </NuxtLink>
      </div>
      <ul class="contact__links">
        <li>
          <span>Email</span>
          <a :href="`mailto:${props.contact.email}`">{{ props.contact.email }}</a>
        </li>
        <li v-if="props.contact.github">
          <span>GitHub</span>
          <a :href="props.contact.github" target="_blank" rel="noopener">{{ props.contact.github }}</a>
        </li>
        <li v-if="props.contact.linkedin">
          <span>LinkedIn</span>
          <a :href="props.contact.linkedin" target="_blank" rel="noopener">{{ props.contact.linkedin }}</a>
        </li>
      </ul>
      <p class="contact__availability">{{ props.contact.availability }}</p>
    </div>
  </footer>
</template>

<style scoped>
.contact {
  margin: var(--space-xxl) 0;
  display: flex;
  justify-content: center;
}

.contact__card {
  width: 100%;
  max-width: 720px;
  background: linear-gradient(140deg, rgba(74,108,77,0.85), rgba(110,139,109,0.9));
  color: #fff;
  padding: var(--space-xxl) var(--space-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  text-align: center;
  display: grid;
  gap: var(--space-md);
}

.contact__card h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 2.5rem);
}

.contact__body {
  margin: 0 auto;
  max-width: 36rem;
  color: rgba(255, 255, 255, 0.85);
}

.contact__cta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-sm);
}

.contact__button {
  padding: 0.9rem 1.75rem;
  border-radius: var(--radius-pill);
  font-weight: 600;
  letter-spacing: 0.05em;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.contact__button--primary {
  background: #fff;
  color: var(--color-primary-start);
}

.contact__button--secondary {
  border: 1px solid rgba(255, 255, 255, 0.7);
  color: #fff;
}

.contact__button:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

.contact__links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.contact__links li {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 0.95rem;
}

.contact__links span {
  font-weight: 600;
}

.contact__links a {
  color: #fff;
  text-decoration: underline;
}

.contact__availability {
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

@media (max-width: 600px) {
  .contact__card {
    padding: var(--space-xl);
  }
}
</style>
