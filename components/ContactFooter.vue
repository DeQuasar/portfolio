<script setup lang="ts">
import { computed } from 'vue'
import type { ContactContent } from '~/types/content'
import { useClipboard } from '~/composables/useClipboard'
import AppButton from '~/components/ui/AppButton.vue'
import AppLink from '~/components/ui/AppLink.vue'
import SectionHeader from '~/components/ui/SectionHeader.vue'

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
  <footer class="mt-24 flex justify-center px-4 sm:px-6">
    <div
      class="grid w-full max-w-3xl gap-6 rounded-[2rem] bg-[linear-gradient(140deg,#4A6C4D,#6E8B6D)] px-8 py-12 text-center text-white shadow-[0_32px_60px_-32px_rgba(31,45,33,0.65)] sm:px-12 sm:py-14"
    >
      <SectionHeader title="Let’s work together" align="center" class="text-white">
        <template #title>
          <h2 class="font-display text-[clamp(2.2rem,5vw,3rem)] font-semibold tracking-tight text-white">
            Let’s work together
          </h2>
        </template>
        <template v-if="props.contact.message" #description>
          <p class="mx-auto max-w-2xl text-base leading-relaxed text-white/90">
            {{ props.contact.message }}
          </p>
        </template>
      </SectionHeader>
      <div class="flex flex-wrap justify-center gap-3">
        <AppLink
          :href="props.contact.resumeUrl"
          variant="cta"
          class="group relative overflow-hidden text-white shadow-[0_26px_52px_-26px_rgba(14,27,18,0.7)]"
        >
          <span class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_55%)] opacity-80 transition-opacity duration-200 group-hover:opacity-95"></span>
          <span class="relative flex items-center gap-2.5">
            <span class="grid h-7 w-7 place-items-center rounded-full bg-white/22 text-white shadow-inner transition duration-200 group-hover:bg-white/32">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="h-[1rem] w-[1rem]" aria-hidden="true">
                <path d="M12 4v9" />
                <polyline points="8 9 12 13 16 9" />
                <path d="M5 19h14" />
              </svg>
            </span>
            <span class="text-sm">Download Résumé</span>
          </span>
        </AppLink>
        <div class="inline-flex items-center gap-2.5">
          <AppLink
            :href="emailHref"
            variant="minimal"
            aria-label="Open email client to contact Anthony"
            class="text-base font-semibold text-white underline decoration-white/50 underline-offset-4 transition hover:decoration-white"
          >
            Email Anthony
          </AppLink>
          <AppButton
            variant="ghost"
            class="min-w-[7.5rem] justify-center border border-white/45 bg-white/15 text-white transition duration-200 hover:-translate-y-0.5 hover:border-white/75 hover:bg-white/25"
            :class="[
              emailCopyState === 'copied' && 'border-white/80 bg-white/25 text-white shadow-[0_18px_30px_-18px_rgba(18,28,21,0.65)]',
              emailCopyState === 'error' && 'border-rose-200 bg-rose-500 text-white shadow-none'
            ]"
            :aria-label="
              emailCopyState === 'copied'
                ? 'Email copied — expect a reply within 48 hours'
                : emailCopyState === 'error'
                  ? 'Copy email address manually'
                  : 'Copy email address'
            "
            @click="copyEmail"
          >
            <span v-if="emailCopyState === 'copied'">Copied</span>
            <span v-else-if="emailCopyState === 'error'">Copy failed</span>
            <span v-else>Copy Email</span>
          </AppButton>
        </div>
      </div>
      <p class="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">Replies within 48 hours</p>
      <ul class="mt-6 grid gap-3 text-sm">
        <li class="flex flex-wrap items-center justify-center gap-2">
          <span class="font-semibold text-white/85">Email</span>
          <div class="inline-flex items-center gap-2.5">
            <AppLink
              :href="emailHref"
              variant="minimal"
              class="font-semibold text-white underline decoration-white/50 underline-offset-4 transition hover:decoration-white"
            >
              {{ props.contact.email }}
            </AppLink>
            <AppButton
              variant="icon"
              class="h-10 w-10 border border-white/45 bg-white/15 text-white transition duration-200 hover:-translate-y-0.5 hover:border-white/75 hover:bg-white/25"
              :class="[
                emailCopyState === 'copied' && 'border-white/80 bg-white/25 text-white shadow-[0_18px_30px_-18px_rgba(18,28,21,0.65)]',
                emailCopyState === 'error' && 'border-rose-200 bg-rose-500 text-white shadow-none'
              ]"
              :aria-label="
                emailCopyState === 'copied'
                  ? 'Email copied — expect a reply within 48 hours'
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
                class="h-4 w-4"
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
                class="h-4 w-4"
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
                class="h-4 w-4"
                aria-hidden="true"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              <span class="sr-only">
                {{
                  emailCopyState === 'copied'
                    ? 'Email copied — expect a reply within 48 hours'
                    : emailCopyState === 'error'
                      ? 'Copy email address manually'
                      : 'Copy email address'
                }}
              </span>
            </AppButton>
          </div>
        </li>
        <li v-if="props.contact.github" class="flex flex-wrap items-center justify-center gap-2">
          <span class="font-semibold text-white/85">GitHub</span>
          <AppLink
            :href="props.contact.github"
            target="_blank"
            rel="noopener"
            variant="minimal"
            class="font-semibold text-white underline decoration-white/50 underline-offset-4 transition hover:decoration-white"
          >
            {{ props.contact.github }}
          </AppLink>
        </li>
        <li v-if="props.contact.linkedin" class="flex flex-wrap items-center justify-center gap-2">
          <span class="font-semibold text-white/85">LinkedIn</span>
          <AppLink
            :href="props.contact.linkedin"
            target="_blank"
            rel="noopener"
            variant="minimal"
            class="font-semibold text-white underline decoration-white/50 underline-offset-4 transition hover:decoration-white"
          >
            {{ props.contact.linkedin }}
          </AppLink>
        </li>
      </ul>
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
        {{ props.contact.availability }}
      </p>
      <p class="sr-only" aria-live="polite">
        {{
          emailCopyState === 'copied'
            ? 'Email copied — expect a reply within 48 hours.'
            : emailCopyState === 'error'
              ? 'Copy failed — please copy the address manually.'
              : ''
        }}
      </p>
    </div>
  </footer>
</template>
