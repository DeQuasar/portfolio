<script setup lang="ts">
import { computed } from 'vue'
import type { ContactContent } from '~/types/content'
import { useClipboard } from '~/composables/useClipboard'

const props = defineProps<{ contact: ContactContent }>()

const emailHref = computed(() => (props.contact.email ? `mailto:${props.contact.email}` : ''))
const { state: emailCopyState, copy: copyEmailToClipboard } = useClipboard()

const copyEmail = async () => {
  if (!props.contact.email) {
    return
  }

  await copyEmailToClipboard(props.contact.email)
}
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
        <div class="contact__dual-action">
          <a
            :href="emailHref"
            class="contact__button contact__button--secondary"
            aria-label="Open email client to contact Anthony"
          >
            Email Anthony
          </a>
          <button
            type="button"
            class="contact__button contact__button--ghost"
            :aria-label="
              emailCopyState === 'copied'
                ? 'Email copied to clipboard'
                : emailCopyState === 'error'
                  ? 'Copy email address manually'
                  : 'Copy email address'
            "
            @click="copyEmail"
          >
            <span v-if="emailCopyState === 'copied'">Copied</span>
            <span v-else-if="emailCopyState === 'error'">Copy failed</span>
            <span v-else>Copy Email</span>
          </button>
        </div>
      </div>
      <ul class="contact__links">
        <li>
          <span>Email</span>
          <div class="contact__link-group">
            <a :href="emailHref">{{ props.contact.email }}</a>
            <button
              type="button"
              class="contact__copy"
              :aria-label="
                emailCopyState === 'copied'
                  ? 'Email copied to clipboard'
                  : emailCopyState === 'error'
                    ? 'Copy email address manually'
                    : 'Copy email address'
              "
              @click="copyEmail"
            >
              <svg
                v-if="emailCopyState === 'copied'"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="contact__copy-icon"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <svg
                v-else-if="emailCopyState === 'error'"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="contact__copy-icon"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="contact__copy-icon"
                aria-hidden="true"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              <span class="sr-only">
                {{
                  emailCopyState === 'copied'
                    ? 'Email copied to clipboard'
                    : emailCopyState === 'error'
                      ? 'Copy email address manually'
                      : 'Copy email address'
                }}
              </span>
            </button>
          </div>
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
      <p class="sr-only" aria-live="polite">
        {{
          emailCopyState === 'copied'
            ? 'Email copied to clipboard.'
            : emailCopyState === 'error'
              ? 'Copy failed. Please copy manually.'
              : ''
        }}
      </p>
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

.contact__dual-action {
  display: inline-flex;
  gap: var(--space-xs);
  align-items: center;
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

.contact__button--ghost {
  border: 1px dashed rgba(255, 255, 255, 0.6);
  color: #fff;
  background: transparent;
  padding-inline: 1.4rem;
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

.contact__link-group {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.contact__copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  border: 1px dashed rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.12);
  color: inherit;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.contact__copy:hover,
.contact__copy:focus-visible {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.75);
}

.contact__copy-icon {
  width: 1.1rem;
  height: 1.1rem;
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
