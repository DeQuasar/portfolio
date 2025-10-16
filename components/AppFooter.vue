<script setup lang="ts">
import { computed } from 'vue'
import { useContactContent } from '~/composables/useContentSources'

const currentYear = new Date().getFullYear()
const { data: contact } = await useContactContent()

const emailLink = computed(() => contact.value?.email ? `mailto:${contact.value.email}` : null)
const githubLink = computed(() => contact.value?.github ?? null)
const linkedinLink = computed(() => contact.value?.linkedin ?? null)
</script>

<template>
  <footer
    id="contact"
    class="mt-16 border-t border-sage-200/60 bg-sage-50 text-sage-500"
  >
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6 text-center text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div class="flex items-center justify-center gap-3 sm:order-2">
        <a
          v-if="emailLink"
          :href="emailLink"
          class="inline-flex min-h-[44px] items-center rounded-full border border-sage-200/70 bg-white px-4 py-2 text-sm font-semibold text-sage-600 shadow-sm transition hover:border-sage-400 hover:text-sage-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300"
        >
          Email
        </a>
        <a
          v-if="linkedinLink"
          :href="linkedinLink"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex min-h-[44px] items-center rounded-full border border-sage-200/70 bg-white px-4 py-2 text-sm font-semibold text-sage-600 shadow-sm transition hover:border-sage-400 hover:text-sage-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300"
        >
          LinkedIn
        </a>
        <a
          v-if="githubLink"
          :href="githubLink"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex min-h-[44px] items-center rounded-full border border-sage-200/70 bg-white px-4 py-2 text-sm font-semibold text-sage-600 shadow-sm transition hover:border-sage-400 hover:text-sage-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300"
        >
          GitHub
        </a>
      </div>
      <p class="sm:order-1 sm:text-left">© {{ currentYear }} Anthony Protano — Senior Software Developer</p>
    </div>
  </footer>
</template>
