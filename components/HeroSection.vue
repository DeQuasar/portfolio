<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { HeroContent } from '~/types/content'
import { useClipboard } from '~/composables/useClipboard'
import { onClickOutside, useEventListener } from '@vueuse/core'
import AppButton from '~/components/ui/AppButton.vue'
import AppLink from '~/components/ui/AppLink.vue'

const props = defineProps<{ hero: HeroContent }>()

const socials = computed(() => props.hero.social ?? [])
const description = computed(() => props.hero.subheadline ?? '')
const metrics = computed(() => props.hero.metrics ?? [])
const emailLink = computed(() => socials.value.find((link) => link.label?.toLowerCase().includes('email')) ?? null)
const otherSocials = computed(() => socials.value.filter((link) => !link.label?.toLowerCase().includes('email')))

const { state: copyState, copy: copyToClipboard, reset: resetCopyState } = useClipboard()
const activeEmailHref = ref<string | null>(null)
const emailTriggerEl = ref<InstanceType<typeof AppButton> | null>(null)
const emailPanelEl = ref<HTMLElement | null>(null)
const emailCopyButtonEl = ref<InstanceType<typeof AppButton> | null>(null)

const showEmailPanel = computed(() => Boolean(activeEmailHref.value))

const copyEmail = async (href: string) => {
  const email = href.startsWith('mailto:') ? href.replace('mailto:', '') : href

  if (!email) {
    return
  }

  await copyToClipboard(email)
}

const openEmailPanel = async (href: string) => {
  resetCopyState()
  activeEmailHref.value = href
  await nextTick()
  emailCopyButtonEl.value?.focus()
}

const closeEmailPanel = () => {
  if (!showEmailPanel.value) {
    return
  }
  activeEmailHref.value = null
  resetCopyState()
  nextTick(() => {
    emailTriggerEl.value?.focus()
  })
}

const toggleEmailPanel = async (href: string) => {
  if (activeEmailHref.value) {
    closeEmailPanel()
  } else {
    await openEmailPanel(href)
  }
}

onClickOutside(emailPanelEl, () => {
  if (showEmailPanel.value) {
    closeEmailPanel()
  }
})

useEventListener(document, 'keydown', (event) => {
  if (!showEmailPanel.value) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closeEmailPanel()
  }
})
</script>

<template>
  <section
    class="relative isolate flex flex-col items-center overflow-hidden rounded-[2rem] bg-white/85 px-6 py-12 text-center shadow-card sm:px-10"
  >
    <span
      class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white via-sage-50/85 to-sage-100/20"
      aria-hidden="true"
    ></span>
    <span
      class="pointer-events-none absolute -left-1/4 top-[-200px] h-56 w-56 -translate-y-6 rounded-full bg-sage-200/35 blur-3xl"
      aria-hidden="true"
    ></span>
    <span
      class="pointer-events-none absolute -right-1/5 bottom-[-160px] h-64 w-64 rounded-full bg-sage-300/20 blur-[120px]"
      aria-hidden="true"
    ></span>
    <h1
      class="font-display font-semibold tracking-tight text-sage-700 animate-fade-up text-[clamp(2.25rem,5vw,3.25rem)]"
      style="animation-delay: 20ms"
    >
      {{ props.hero.name }}
    </h1>
    <p
      class="mt-2 font-display text-sage-600 animate-fade-up text-[clamp(1.05rem,2.4vw,1.55rem)]"
      style="animation-delay: 60ms"
    >
      {{ props.hero.role }}
    </p>
    <p
      v-if="description"
      class="mt-6 max-w-2xl text-base sm:text-[1.05rem] text-sage-600 animate-fade-up"
      style="animation-delay: 110ms"
    >
      {{ description }}
    </p>

    <dl
      v-if="metrics.length"
      class="mt-6 flex flex-wrap justify-center gap-3 animate-fade-up"
      style="animation-delay: 150ms"
    >
      <div
        v-for="metric in metrics"
        :key="metric.label"
        class="flex items-center gap-3 rounded-full border border-sage-200/80 bg-white/90 px-4 py-2 text-sm text-sage-600 shadow-sm transition hover:border-sage-400 hover:text-sage-700"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-sage-500" aria-hidden="true"></span>
        <dt class="text-xs uppercase tracking-wider text-sage-500">
          {{ metric.label }}
        </dt>
        <dd class="font-semibold text-sage-700">
          {{ metric.value }}
        </dd>
      </div>
    </dl>

    <div class="mt-8 flex flex-wrap items-center justify-center gap-4 animate-fade-up" style="animation-delay: 190ms">
      <AppLink
        :href="props.hero.primaryCta.href"
        variant="primary"
        class="shadow-card"
        aria-label="Download résumé"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M10 2a.75.75 0 01.75.75v7.29l2.22-2.22a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 011.06-1.06l2.22 2.22V2.75A.75.75 0 0110 2zm-6 11.5a1 1 0 011-1h10a1 1 0 011 1V16a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.5z"
            clip-rule="evenodd"
          />
        </svg>
        {{ props.hero.primaryCta.label }}
      </AppLink>
    </div>

    <div
      v-if="socials.length"
      class="mt-10 flex w-full max-w-xl flex-col items-center animate-fade-up"
      style="animation-delay: 230ms"
    >
      <transition name="fade" mode="out-in">
        <div
          v-if="showEmailPanel && activeEmailHref"
          key="email-inline"
          ref="emailPanelEl"
          role="group"
          class="flex flex-wrap items-center justify-center gap-3"
          aria-label="Email options"
        >
          <AppButton ref="emailCopyButtonEl" variant="primary" class="px-5 py-2" @click="copyEmail(activeEmailHref)">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            <span>
              {{ copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy email' }}
            </span>
          </AppButton>
          <AppLink :href="activeEmailHref" variant="secondary" class="px-5 py-2" @click="closeEmailPanel">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M7 17l9-9" />
              <path d="M7 7h10v10" />
            </svg>
            <span>Email Anthony</span>
          </AppLink>
          <AppButton
            variant="icon"
            class="h-10 w-10 border-sage-300"
            @click="closeEmailPanel"
            aria-label="Cancel email options"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </AppButton>
          <Transition name="fade-slide">
            <div
              v-if="copyState === 'copied' || copyState === 'error'"
              class="flex items-center gap-2 rounded-full border border-sage-200 bg-white/85 px-3 py-1 text-xs font-semibold text-sage-600 shadow-sm"
            >
              <svg
                v-if="copyState === 'copied'"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-3.5 w-3.5 text-sage-500"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
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
                class="h-3.5 w-3.5 text-rose-500"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>
                {{ copyState === 'copied' ? 'Email copied' : 'Copy failed' }}
              </span>
            </div>
          </Transition>
        </div>
        <div
          v-else
          key="social-links"
          class="flex flex-wrap items-center justify-center gap-5"
        >
          <AppButton
            v-if="emailLink"
            :key="emailLink.href"
            ref="emailTriggerEl"
            variant="icon"
            class="group"
            :aria-label="'View email options'"
            @click="toggleEmailPanel(emailLink.href)"
          >
            <span class="sr-only">{{ emailLink.label }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-5 w-5 transition duration-300 group-hover:scale-105"
              aria-hidden="true"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M22 7l-9.5 6a.8.8 0 01-1 0L2 7" />
            </svg>
          </AppButton>
          <AppLink
            v-for="link in otherSocials"
            :key="link.href"
            :href="link.href"
            variant="icon"
            class="group"
            :aria-label="link.label"
          >
            <span class="sr-only">{{ link.label }}</span>
            <svg
              v-if="link.label?.toLowerCase().includes('github')"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-5 w-5 transition duration-300 group-hover:scale-105"
              aria-hidden="true"
            >
              <path
                d="M9 19c-4 1.5-4-2-6-2m12 4v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0018 3.77 5.07 5.07 0 0017.91 1S16.73.65 14 2.48a13.38 13.38 0 00-5 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 3.77a5.44 5.44 0 00-1.5 3.79c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"
              />
            </svg>
            <svg
              v-else-if="link.label?.toLowerCase().includes('linkedin')"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-5 w-5 transition duration-300 group-hover:scale-105"
              aria-hidden="true"
            >
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
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
              class="h-5 w-5 transition duration-300 group-hover:scale-105"
              aria-hidden="true"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M22 7l-9.5 6a.8.8 0 01-1 0L2 7" />
            </svg>
          </AppLink>
        </div>
      </transition>
    </div>

    <p class="sr-only" aria-live="polite">
      <template v-if="copyState === 'copied'">Email address copied to clipboard.</template>
      <template v-else-if="copyState === 'error'">Copy failed. Please copy manually.</template>
    </p>
  </section>
</template>
