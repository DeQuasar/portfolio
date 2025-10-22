<script setup lang="ts">
import { computed } from 'vue'
import FooterContactLinks from '~/components/footer/FooterContactLinks.vue'
import FooterLegalNotice from '~/components/footer/FooterLegalNotice.vue'
import { useContactContent } from '~/composables/useContentSources'

const currentYear = new Date().getFullYear()
const { data: contact } = await useContactContent()

const emailLink = computed(() => contact.value?.email ? `mailto:${contact.value.email}` : null)
const githubLink = computed(() => contact.value?.github ?? null)
const linkedinLink = computed(() => contact.value?.linkedin ?? null)

const contactActions = computed(() => {
  const actions: Array<{ label: string, href: string }> = []

  if (emailLink.value) {
    actions.push({ label: 'Email', href: emailLink.value })
  }

  if (linkedinLink.value) {
    actions.push({ label: 'LinkedIn', href: linkedinLink.value })
  }

  if (githubLink.value) {
    actions.push({ label: 'GitHub', href: githubLink.value })
  }

  return actions
})
</script>

<template>
  <footer
    id="contact"
    class="mt-16 border-t border-sage-200/60 bg-sage-50 text-sage-500"
  >
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6 text-center text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <FooterContactLinks class="sm:order-2" :actions="contactActions" />
      <FooterLegalNotice class="sm:order-1 sm:text-left" :year="currentYear" />
    </div>
  </footer>
</template>
