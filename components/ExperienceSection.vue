<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import CardSurface from '~/components/ui/CardSurface.vue'
import SectionHeader from '~/components/ui/SectionHeader.vue'
import type { ExperienceContent } from '~/types/content'
import AppLink from '~/components/ui/AppLink.vue'
import Pill from '~/components/ui/Pill.vue'

const props = defineProps<{
  experience: ExperienceContent
}>()

const entries = computed(() => props.experience.entries ?? [])

const activeSlug = ref<string | null>(entries.value[0]?.slug ?? null)
const cardElements = new Map<string, HTMLElement>()
let rafId: number | null = null

const activeHighlightStyle = Object.freeze({
  '--card-glow': 'rgba(32, 198, 140, 0.82)',
  '--card-glow-ambient': 'rgba(16, 82, 58, 0.68)',
  '--card-core': 'rgba(22, 154, 104, 0.96)'
})

const inactiveHighlightStyle = Object.freeze({
  '--card-glow': 'rgba(32, 198, 140, 0)',
  '--card-glow-ambient': 'rgba(18, 94, 68, 0)',
  '--card-core': 'rgba(9, 52, 38, 0)'
})

const glowOverlayStyle = Object.freeze({
  background: 'radial-gradient(circle at center, var(--card-core) 0%, var(--card-glow) 34%, rgba(32, 198, 140, 0.28) 56%, transparent 72%)',
  boxShadow: '0 28px 72px -30px var(--card-glow-ambient), 0 0 38px -10px rgba(32, 198, 140, 0.55)'
})

const resolveCardElement = (value: Element | { $el?: Element } | null) => {
  if (!value) {
    return null
  }
  if (value instanceof HTMLElement) {
    return value
  }
  const candidate = (value as { $el?: Element }).$el
  return candidate instanceof HTMLElement ? candidate : null
}

const computeActiveSlug = () => {
  rafId = null
  if (typeof window === 'undefined' || cardElements.size === 0) {
    activeSlug.value = entries.value[0]?.slug ?? null
    return
  }

  const viewportHeight = window.innerHeight || 0
  const viewportCenter = viewportHeight / 2

  let bestSlug: string | null = null
  let bestDistance = Number.POSITIVE_INFINITY

  cardElements.forEach((el, slug) => {
    const rect = el.getBoundingClientRect()
    if (rect.bottom <= 0 || rect.top >= viewportHeight) {
      return
    }

    const cardCenter = rect.top + rect.height / 2
    const distance = Math.abs(cardCenter - viewportCenter)

    if (distance < bestDistance) {
      bestDistance = distance
      bestSlug = slug
    }
  })

  if (bestSlug) {
    activeSlug.value = bestSlug
  } else {
    activeSlug.value = entries.value[0]?.slug ?? null
  }
}

const scheduleCompute = () => {
  if (typeof window === 'undefined') {
    return
  }
  if (rafId !== null) {
    return
  }
  rafId = window.requestAnimationFrame(computeActiveSlug)
}

const registerCard = (slug: string) => (el: Element | { $el?: Element } | null) => {
  if (typeof window === 'undefined') {
    return
  }

  if (!el) {
    cardElements.delete(slug)
    scheduleCompute()
    return
  }

  const element = resolveCardElement(el)
  if (element) {
    cardElements.set(slug, element)
    scheduleCompute()
  }
}

const handleViewportChange = () => {
  scheduleCompute()
}

const isEntryVisible = (slug: string) => activeSlug.value === slug

watch(entries, (nextEntries) => {
  if (!nextEntries.length) {
    activeSlug.value = null
    return
  }

  if (!nextEntries.some((entry) => entry.slug === activeSlug.value)) {
    activeSlug.value = nextEntries[0]?.slug ?? null
  }
}, { immediate: true })

onMounted(() => {
  if (typeof window === 'undefined') {
    return
  }

  window.addEventListener('scroll', handleViewportChange, { passive: true })
  window.addEventListener('resize', handleViewportChange)
  scheduleCompute()
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleViewportChange)
    window.removeEventListener('resize', handleViewportChange)
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId)
    }
  }
  cardElements.clear()
  activeSlug.value = null
})

</script>

<template>
  <section class="flex flex-col gap-12">
    <SectionHeader title="Experience" accent="double-bar" />

    <div class="flex flex-col gap-8">
      <CardSurface
        v-for="entry in entries"
        :key="entry.slug"
        :id="`experience-${entry.slug}`"
        :ref="registerCard(entry.slug)"
        class="group relative flex flex-col gap-6 overflow-hidden border border-sage-200/70 bg-white transition-shadow duration-300 ease-out shadow-[0_18px_44px_-30px_rgba(28,40,31,0.35)]"
        :class="isEntryVisible(entry.slug)
          ? 'shadow-[0_38px_120px_-32px_rgba(18,45,32,0.92),0_28px_72px_-30px_rgba(20,118,82,0.78),0_0_48px_-8px_rgba(40,210,150,0.42),inset_0_0_0_2px_rgba(34,196,138,0.85)]'
          : ''
        "
        :style="isEntryVisible(entry.slug) ? activeHighlightStyle : inactiveHighlightStyle"
      >
        <span
          class="pointer-events-none absolute inset-[-6%] -z-10 rounded-[inherit] transition-opacity duration-300 ease-out"
          :class="isEntryVisible(entry.slug) ? 'opacity-95' : 'opacity-0'"
          :style="glowOverlayStyle"
        ></span>
        <header class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between transition-colors duration-500">
          <div class="space-y-1.5">
            <h3
              class="flex items-center font-display text-xl font-semibold text-sage-600"
              :class="isEntryVisible(entry.slug) ? 'text-sage-900' : ''"
            >
              <span>{{ entry.role }}</span>
            </h3>
            <p class="text-sm font-semibold transition-colors duration-500" :class="isEntryVisible(entry.slug) ? 'text-sage-600' : 'text-sage-500'">{{ entry.organization }}</p>
            <p v-if="entry.location" class="text-sm text-sage-500">{{ entry.location }}</p>
          </div>
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-sage-500/90 transition-colors duration-500" :class="isEntryVisible(entry.slug) ? 'text-sage-600' : ''">
            {{ entry.period }}
          </p>
        </header>

        <ul
          v-if="entry.toolkit?.length"
          class="flex flex-wrap gap-2"
          aria-label="Key tools and focus areas"
        >
          <li v-for="tool in entry.toolkit" :key="tool" class="list-none">
            <Pill
              tone="neutral"
              size="sm"
              uppercase
              class="items-center gap-1.5 tracking-[0.18em] text-sage-600/95"
            >
              {{ tool }}
            </Pill>
          </li>
        </ul>

        <ul
          v-if="entry.summary?.length"
          class="list-disc space-y-2 pl-5 text-left text-sm leading-relaxed text-sage-600 marker:text-sage-400"
        >
          <li v-for="point in entry.summary" :key="point">
            {{ point }}
          </li>
        </ul>

        <div
          v-for="project in entry.projects"
          :key="project.title"
          class="rounded-[1.4rem] border border-sage-200/70 bg-white/90 p-5 shadow-[0_18px_32px_-26px_rgba(47,70,49,0.28)] sm:p-6"
          role="article"
          :aria-label="`${project.title} project summary`"
        >
          <div class="flex flex-col gap-2">
            <h4 class="font-display text-lg font-semibold text-sage-700">
              {{ project.title }}
            </h4>
            <p class="text-sm text-sage-600">
              {{ project.summary }}
            </p>
          </div>

          <dl class="mt-4 grid gap-4 text-sm text-sage-600 sm:grid-cols-3">
            <div class="space-y-1.5">
              <dt class="text-xs font-semibold uppercase tracking-[0.24em] text-sage-500/80">Problem</dt>
              <dd class="leading-relaxed text-sage-600/95">{{ project.problem }}</dd>
            </div>
            <div class="space-y-1.5">
              <dt class="text-xs font-semibold uppercase tracking-[0.24em] text-sage-500/80">Contribution</dt>
              <dd class="leading-relaxed text-sage-600/95">{{ project.contribution }}</dd>
            </div>
            <div class="space-y-1.5 sm:col-span-1">
              <dt class="text-xs font-semibold uppercase tracking-[0.24em] text-sage-500/80">Impact</dt>
              <dd class="leading-relaxed text-sage-600/95">{{ project.impact }}</dd>
            </div>
          </dl>

          <div v-if="project.links?.length" class="mt-4 flex flex-wrap gap-3">
            <AppLink
              v-for="link in project.links"
              :key="link.url"
              :href="link.url"
              variant="secondary"
              class="px-3 py-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M10 13a5 5 0 007.54.54l1.92-1.92a4 4 0 10-5.66-5.66l-.88.88" />
                <path d="M14 11a5 5 0 00-7.54-.54l-1.92 1.92a4 4 0 105.66 5.66l.88-.88" />
              </svg>
              <span>{{ link.text }}</span>
            </AppLink>
          </div>
        </div>
      </CardSurface>
    </div>
  </section>
</template>
