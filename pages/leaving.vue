<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppButton from '~/components/ui/AppButton.vue'

const route = useRoute()

const rawDestination = computed(() => {
  const toParam = route.query.to

  if (Array.isArray(toParam)) {
    return toParam[0] ?? ''
  }

  return typeof toParam === 'string' ? toParam : ''
})

const parsedDestination = computed(() => {
  if (!rawDestination.value) {
    return null
  }

  try {
    const url = new URL(rawDestination.value)

    if (!['http:', 'https:'].includes(url.protocol)) {
      return null
    }

    return url
  } catch (error) {
    return null
  }
})

const destinationHost = computed(() => parsedDestination.value?.hostname ?? null)
const continueButtonRef = ref<InstanceType<typeof AppButton> | null>(null)

const handleContinue = () => {
  const target = parsedDestination.value

  if (!target) {
    handleCancel()
    return
  }

  window.location.replace(target.toString())
}

const handleCancel = () => {
  if (window.close) {
    window.close()
  }

  if (import.meta.client) {
    window.location.replace('/')
  }
}

onMounted(() => {
  document.title = 'Leaving this site'
  continueButtonRef.value?.focus()
})
</script>

<template>
  <main class="min-h-screen bg-sage-50 px-6 py-12">
    <section
      class="mx-auto flex max-w-xl flex-col gap-6 rounded-3xl border border-sage-200/70 bg-white/95 px-8 py-10 text-left shadow-card"
    >
      <header class="space-y-3">
        <p class="text-sm font-semibold uppercase tracking-[0.28em] text-sage-500">External link</p>
        <h1 class="font-display text-3xl font-semibold text-sage-700">Are you sure you want to leave?</h1>
        <p class="text-base text-sage-600">
          You’re about to open
          <span class="font-semibold text-sage-700">{{ destinationHost ?? 'an external page' }}</span> in a new window.
          Make sure you trust the destination before continuing.
        </p>
      </header>

      <div v-if="parsedDestination" class="rounded-2xl bg-sage-100/70 px-4 py-3 text-sm text-sage-600">
        {{ parsedDestination.toString() }}
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <AppButton ref="continueButtonRef" variant="primary" class="px-6 py-2.5" @click="handleContinue">
          Continue
        </AppButton>
        <AppButton variant="secondary" class="px-6 py-2.5" @click="handleCancel">
          Cancel
        </AppButton>
      </div>
    </section>
  </main>
</template>
