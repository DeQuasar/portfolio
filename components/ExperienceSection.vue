<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import CardSurface from '~/components/ui/CardSurface.vue'
import SectionHeader from '~/components/ui/SectionHeader.vue'
import type { ExperienceContent, ExperienceProject } from '~/types/content'
import AppLink from '~/components/ui/AppLink.vue'
import Pill from '~/components/ui/Pill.vue'

const props = defineProps<{
  experience: ExperienceContent
}>()

const entries = computed(() => props.experience.entries ?? [])

const activeSlug = ref<string | null>(entries.value[0]?.slug ?? null)
const cardElements = new Map<string, HTMLElement>()
let rafId: number | null = null

const TOOLKIT_VISIBLE_COUNT = 4

const projectFacetOrder = ['problem', 'contribution', 'impact'] as const

const projectFacetLabels = Object.freeze({
  problem: 'Problem',
  contribution: 'Contribution',
  impact: 'Impact'
})

interface ProjectHighlight {
  id: string
  problem: string
  contribution: string
  impact: string
}

const expandedToolkits = ref<Record<string, boolean>>({})
const isHydrated = ref(false)

const DURATION_DELIMITERS = /\s*[–-]\s*/

const MONTH_LOOKUP: Record<string, number> = Object.freeze({
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sept: 8,
  sep: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11
})

const toMonthDate = (value: string): Date | null => {
  const normalized = value.trim()

  if (!normalized.length) {
    return null
  }

  const lower = normalized.toLowerCase()
  const parts = lower.split(/\s+/)

  if (parts.length < 2) {
    return null
  }

  const monthIndex = MONTH_LOOKUP[parts[0]]
  const year = Number.parseInt(parts[parts.length - 1], 10)

  if (!Number.isInteger(monthIndex) || Number.isNaN(year)) {
    return null
  }

  return new Date(Date.UTC(year, monthIndex, 1))
}

const formatDuration = (period: string): string | null => {
  if (!period?.trim().length) {
    return null
  }

  const [startRaw, endRaw] = period.split(DURATION_DELIMITERS)

  if (!startRaw || !endRaw) {
    return null
  }

  const now = new Date()
  const startDate = toMonthDate(startRaw)
  const endDate = /present/i.test(endRaw)
    ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    : toMonthDate(endRaw)

  if (!startDate || !endDate) {
    return null
  }

  let months = (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12
    + (endDate.getUTCMonth() - startDate.getUTCMonth())

  if (months < 0) {
    return null
  }

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  const parts: string[] = []

  if (years > 0) {
    parts.push(`${years} yr${years > 1 ? 's' : ''}`)
  }

  if (remainingMonths > 0) {
    parts.push(`${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`)
  }

  if (!parts.length) {
    parts.push('Less than 1 mo')
  }

  return parts.join(' ')
}

const entryDurations = computed<Record<string, string | null>>(() => {
  return entries.value.reduce<Record<string, string | null>>((acc, entry) => {
    acc[entry.slug] = formatDuration(entry.period ?? '')
    return acc
  }, {})
})

const getEntryDuration = (slug: string): string | null => {
  return entryDurations.value[slug] ?? null
}

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

const projectOverlayKey = (entrySlug: string, projectTitle: string) => `${entrySlug}::${projectTitle}`

const slugify = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

const buildProjectHighlights = (entrySlug: string, project: ExperienceProject): ProjectHighlight[] => {
  const sourceHighlights = Array.isArray(project.highlights) && project.highlights.length
    ? project.highlights
    : [{
        id: undefined,
        problem: project.problem,
        contribution: project.contribution,
        impact: project.impact
      }]

  return sourceHighlights
    .map((highlight, index) => {
      const slugBase = slugify(`${entrySlug}-${project.title}-${index}`)
      const id = highlight.id?.trim().length ? highlight.id.trim() : (slugBase || `${entrySlug}-highlight-${index + 1}`)

      return {
        id,
        problem: highlight.problem,
        contribution: highlight.contribution,
        impact: highlight.impact
      }
    })
    .filter((highlight) => highlight.problem || highlight.contribution || highlight.impact)
}

const projectHighlightsMap = computed<Record<string, ProjectHighlight[]>>(() => {
  const map: Record<string, ProjectHighlight[]> = {}

  entries.value.forEach((entry) => {
    entry.projects?.forEach((project) => {
      const key = projectOverlayKey(entry.slug, project.title)
      map[key] = buildProjectHighlights(entry.slug, project)
    })
  })

  return map
})

const getProjectHighlights = (entrySlug: string, projectTitle: string): ProjectHighlight[] => {
  return projectHighlightsMap.value[projectOverlayKey(entrySlug, projectTitle)] ?? []
}

const getActiveProjectHighlight = (entrySlug: string, projectTitle: string): ProjectHighlight | null => {
  const highlights = getProjectHighlights(entrySlug, projectTitle)
  return highlights.length ? highlights[0] : null
}

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

const isToolkitExpanded = (slug: string) => expandedToolkits.value[slug] === true

const toggleToolkit = (slug: string) => {
  const next = { ...expandedToolkits.value }
  if (next[slug]) {
    delete next[slug]
  } else {
    next[slug] = true
  }
  expandedToolkits.value = next
}

interface ToolkitDisplay {
  visible: string[]
  hasOverflow: boolean
}

const EMPTY_TOOLKIT_DISPLAY = Object.freeze({
  visible: [] as string[],
  hasOverflow: false
}) as ToolkitDisplay

const toolkitDisplayMap = computed<Record<string, ToolkitDisplay>>(() => {
  const map: Record<string, ToolkitDisplay> = {}

  entries.value.forEach((entry) => {
    const toolkit = entry.toolkit ?? []
    if (!Array.isArray(toolkit)) {
      return
    }

    const expanded = isToolkitExpanded(entry.slug)
    map[entry.slug] = {
      visible: expanded ? toolkit : toolkit.slice(0, TOOLKIT_VISIBLE_COUNT),
      hasOverflow: toolkit.length > TOOLKIT_VISIBLE_COUNT
    }
  })

  return map
})

const getToolkitDisplay = (slug: string): ToolkitDisplay => toolkitDisplayMap.value[slug] ?? EMPTY_TOOLKIT_DISPLAY

watch(entries, (nextEntries) => {
  if (!nextEntries.length) {
    activeSlug.value = null
  return
}

if (!nextEntries.some((entry) => entry.slug === activeSlug.value)) {
  activeSlug.value = nextEntries[0]?.slug ?? null
}

})

onMounted(() => {
  if (typeof window === 'undefined') {
    return
  }

  window.addEventListener('scroll', handleViewportChange, { passive: true })
  window.addEventListener('resize', handleViewportChange)
  scheduleCompute()

  isHydrated.value = true
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
          <div class="flex flex-col items-start gap-1 text-left sm:items-end sm:text-right">
            <p
              class="text-sm font-semibold uppercase tracking-[0.18em] text-sage-500/90 transition-colors duration-500"
              :class="isEntryVisible(entry.slug) ? 'text-sage-600' : ''"
            >
              {{ entry.period }}
            </p>
            <p
              v-if="getEntryDuration(entry.slug)"
              class="text-xs text-sage-500 transition-colors duration-500"
              :class="isEntryVisible(entry.slug) ? 'text-sage-600/90' : ''"
            >
              {{ getEntryDuration(entry.slug) }}
            </p>
          </div>
        </header>

        <ul
          v-if="entry.toolkit?.length"
          class="flex flex-wrap gap-2"
          aria-label="Key tools and focus areas"
        >
          <li
            v-for="tool in getToolkitDisplay(entry.slug).visible"
            :key="tool"
            class="list-none"
          >
            <Pill
              tone="neutral"
              size="sm"
              uppercase
              class="items-center gap-1.5 tracking-[0.18em] text-sage-600/95"
            >
              {{ tool }}
            </Pill>
          </li>
          <li
            v-if="isHydrated && getToolkitDisplay(entry.slug).hasOverflow"
            :key="`${entry.slug}-toolkit-toggle`"
            class="list-none"
          >
            <button
              type="button"
              class="text-xs font-semibold uppercase tracking-[0.22em] text-sage-500 transition-colors duration-200 hover:text-sage-700"
              @click="toggleToolkit(entry.slug)"
            >
              {{ isToolkitExpanded(entry.slug) ? 'Show fewer' : `Show all ${entry.toolkit.length}` }}
            </button>
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
          class="relative overflow-hidden rounded-[1.4rem] border border-sage-200/70 bg-white/90 p-5 shadow-[0_18px_32px_-26px_rgba(47,70,49,0.28)] sm:p-6"
          role="article"
          :aria-label="`${project.title} project summary`"
        >
          <div class="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="space-y-2">
              <h4 class="font-display text-lg font-semibold text-sage-700">
                {{ project.title }}
              </h4>
              <p class="text-sm text-sage-600">
                {{ project.summary }}
              </p>
            </div>
            <div
              v-if="project.media?.length"
              class="flex flex-wrap justify-end gap-2"
              aria-label="Project visuals"
            >
              <div
                v-for="visual in project.media"
                :key="`${visual.type}-${visual.src}`"
                class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-sage-200/70 bg-white/90 shadow-[0_12px_36px_-20px_rgba(37,60,45,0.45)]"
              >
                <img
                  v-if="visual.type === 'image'"
                  :src="visual.src"
                  :alt="visual.alt ?? `${project.title} visual`"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
                <img
                  v-else-if="visual.type === 'icon'"
                  :src="visual.src"
                  :alt="visual.alt ?? `${project.title} icon`"
                  class="h-8 w-8 object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <div
            v-if="getProjectHighlights(entry.slug, project.title).length && getActiveProjectHighlight(entry.slug, project.title)"
            class="mt-6 space-y-5 border-t border-sage-200/70 pt-6"
          >
            <div class="space-y-3 text-[0.95rem] leading-[1.65] text-sage-700">
              <div v-for="facet in projectFacetOrder" :key="facet" class="space-y-1.5">
                <p class="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-sage-500/75">
                  {{ projectFacetLabels[facet] }}
                </p>
                <p>
                  {{ getActiveProjectHighlight(entry.slug, project.title)?.[facet] }}
                </p>
              </div>
            </div>
          </div>

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
