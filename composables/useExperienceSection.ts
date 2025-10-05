import { computed, onBeforeUnmount, onMounted, ref, watch, type ComputedRef } from 'vue'
import type { ExperienceEntry, ExperienceProject } from '~/types/content'

export interface ExperienceToolkitDisplay {
  visible: string[]
  hasOverflow: boolean
}

export interface ExperienceProjectHighlightDisplay {
  id: string
  problem: string
  contribution: string
  impact: string
}

const TOOLKIT_VISIBLE_COUNT = 4
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

const resolveProjectHighlights = (entrySlug: string, project: ExperienceProject): ExperienceProjectHighlightDisplay[] => {
  const highlights = Array.isArray(project.highlights) && project.highlights.length
    ? project.highlights
    : [{
        id: undefined,
        problem: project.problem,
        contribution: project.contribution,
        impact: project.impact
      }]

  return highlights
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

const slugify = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

const projectOverlayKey = (entrySlug: string, projectTitle: string) => `${entrySlug}::${projectTitle}`

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

  const months = (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12
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

export const useExperienceSection = (entries: ComputedRef<ExperienceEntry[]>) => {
  const activeSlug = ref<string | null>(entries.value[0]?.slug ?? null)
  const expandedToolkits = ref<Record<string, boolean>>({})
  const isHydrated = ref(false)
  const cardElements = new Map<string, HTMLElement>()

  let rafId: number | null = null

  const entryDurations = computed<Record<string, string | null>>(() => {
    return entries.value.reduce<Record<string, string | null>>((acc, entry) => {
      acc[entry.slug] = formatDuration(entry.period ?? '')
      return acc
    }, {})
  })

  const projectHighlightsMap = computed<Record<string, ExperienceProjectHighlightDisplay[]>>(() => {
    const map: Record<string, ExperienceProjectHighlightDisplay[]> = {}

    entries.value.forEach((entry) => {
      entry.projects?.forEach((project) => {
        const key = projectOverlayKey(entry.slug, project.title)
        map[key] = resolveProjectHighlights(entry.slug, project)
      })
    })

    return map
  })

  const toolkitDisplayMap = computed<Record<string, ExperienceToolkitDisplay>>(() => {
    const map: Record<string, ExperienceToolkitDisplay> = {}

    entries.value.forEach((entry) => {
      const toolkit = entry.toolkit ?? []
      if (!Array.isArray(toolkit)) {
        return
      }

      const expanded = expandedToolkits.value[entry.slug] === true
      map[entry.slug] = {
        visible: expanded ? toolkit : toolkit.slice(0, TOOLKIT_VISIBLE_COUNT),
        hasOverflow: toolkit.length > TOOLKIT_VISIBLE_COUNT
      }
    })

    return map
  })

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

    cardElements.forEach((element, slug) => {
      const rect = element.getBoundingClientRect()
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

    activeSlug.value = bestSlug ?? entries.value[0]?.slug ?? null
  }

  const scheduleCompute = () => {
    if (typeof window === 'undefined' || rafId !== null) {
      return
    }
    rafId = window.requestAnimationFrame(computeActiveSlug)
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

  const registerCard = (slug: string) => (value: Element | { $el?: Element } | null) => {
    if (typeof window === 'undefined') {
      return
    }

    if (!value) {
      cardElements.delete(slug)
      scheduleCompute()
      return
    }

    const element = resolveCardElement(value)
    if (element) {
      cardElements.set(slug, element)
      scheduleCompute()
    }
  }

  const handleViewportChange = () => {
    scheduleCompute()
  }

  const getEntryDuration = (slug: string): string | null => {
    return entryDurations.value[slug] ?? null
  }

  const getToolkitDisplay = (slug: string): ExperienceToolkitDisplay => {
    return toolkitDisplayMap.value[slug] ?? { visible: [], hasOverflow: false }
  }

  const getProjectHighlights = (entrySlug: string, projectTitle: string): ExperienceProjectHighlightDisplay[] => {
    return projectHighlightsMap.value[projectOverlayKey(entrySlug, projectTitle)] ?? []
  }

  const getActiveProjectHighlight = (entrySlug: string, projectTitle: string): ExperienceProjectHighlightDisplay | null => {
    const highlights = getProjectHighlights(entrySlug, projectTitle)
    return highlights.length ? highlights[0] : null
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

  return {
    activeSlug,
    isHydrated,
    registerCard,
    isEntryVisible,
    getEntryDuration,
    getToolkitDisplay,
    isToolkitExpanded,
    toggleToolkit,
    getProjectHighlights,
    getActiveProjectHighlight,
    activeHighlightStyle,
    inactiveHighlightStyle,
    glowOverlayStyle
  }
}
