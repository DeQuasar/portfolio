<script setup lang="ts">
import { computed, ref } from 'vue'
import CardSurface from '~/components/ui/CardSurface.vue'
import SectionHeader from '~/components/ui/SectionHeader.vue'
import Pill from '~/components/ui/Pill.vue'
import type { SkillsContent, ExperienceContent } from '~/types/content'

type ToolkitEntry = {
  label: string
  count: number
  sources: string[]
}

type DisplayCategory = {
  title: string
  description?: string
  skills: ToolkitEntry[]
}

type DisplayCoreGroup = {
  title: string
  description?: string
  skills: ToolkitEntry[]
  organizations: string[]
}

const props = defineProps<{ skills: SkillsContent; experience?: ExperienceContent | null }>()

const normalizeSkill = (value: string) => value.trim().toLowerCase()

const sortSkills = (skills: ToolkitEntry[]) =>
  [...skills].sort((a, b) => (b.count === a.count ? a.label.localeCompare(b.label) : b.count - a.count))

const experienceIndex = computed(() => {
  const map = new Map<string, { organization: string; role: string }>()
  const entries = props.experience?.entries ?? []

  for (const entry of entries) {
    map.set(entry.slug, { organization: entry.organization, role: entry.role })
  }

  return map
})

const aggregatedToolkit = computed(() => {
  const map = new Map<string, ToolkitEntry>()
  const entries = props.experience?.entries ?? []

  for (const entry of entries) {
    if (!entry.toolkit?.length) continue

    for (const skill of entry.toolkit) {
      const key = normalizeSkill(skill)
      const existing = map.get(key)
      if (existing) {
        existing.count += 1
        if (entry.slug && !existing.sources.includes(entry.slug)) {
          existing.sources.push(entry.slug)
        }
      } else {
        map.set(key, {
          label: skill,
          count: 1,
          sources: entry.slug ? [entry.slug] : []
        })
      }
    }
  }

  return map
})

const coreGroups = computed<DisplayCoreGroup[]>(() => {
  const groups = props.skills.core?.groups ?? []
  const toolkit = aggregatedToolkit.value
  const map = experienceIndex.value

  return groups.map((group) => {
    const items = group.skills.map((label) => {
      const key = normalizeSkill(label)
      const entry = toolkit.get(key)
      return entry ? { ...entry } : { label, count: 0, sources: [] }
    })

    const roleSlugs = new Set<string>()
    for (const item of items) {
      item.sources.forEach((slug) => roleSlugs.add(slug))
    }

    const organizations: string[] = []
    for (const slug of roleSlugs) {
      const meta = map.get(slug)
      if (!meta) continue
      const label = meta.organization || meta.role
      if (label && !organizations.includes(label)) {
        organizations.push(label)
      }
      if (organizations.length === 3) break
    }

    return {
      title: group.title,
      description: group.description,
      skills: items,
      organizations
    }
  })
})

const coreKeys = computed(() => {
  const keys = new Set<string>()
  for (const group of coreGroups.value) {
    for (const skill of group.skills) {
      keys.add(normalizeSkill(skill.label))
    }
  }
  return keys
})

const supportingCategories = computed(() => {
  const toolkit = aggregatedToolkit.value
  const categoriesConfig = props.skills.categories ?? []
  const assigned = new Set<string>()
  const categories: DisplayCategory[] = []

  for (const category of categoriesConfig) {
    const matches: ToolkitEntry[] = []

    for (const label of category.match ?? []) {
      const key = normalizeSkill(label)
      if (coreKeys.value.has(key) || assigned.has(key)) continue

      const entry = toolkit.get(key)
      if (entry) {
        matches.push({ ...entry })
        assigned.add(key)
      } else {
        matches.push({ label, count: 0, sources: [] })
      }
    }

    const filtered = matches.filter((item) => !coreKeys.value.has(normalizeSkill(item.label)))

    if (filtered.length) {
      categories.push({
        title: category.title,
        description: category.description,
        skills: sortSkills(filtered)
      })
    }
  }

  const additional: ToolkitEntry[] = []

  for (const [key, value] of toolkit.entries()) {
    if (coreKeys.value.has(key) || assigned.has(key)) continue
    additional.push({ ...value })
  }

  return {
    categories,
    additional: sortSkills(additional)
  }
})

const additionalPreviewLimit = 10
const additionalExpanded = ref(false)

const additionalSkills = computed(() => supportingCategories.value.additional)
const hasAdditionalOverflow = computed(() => additionalSkills.value.length > additionalPreviewLimit)
const additionalVisibleSkills = computed(() =>
  additionalExpanded.value || !hasAdditionalOverflow.value
    ? additionalSkills.value
    : additionalSkills.value.slice(0, additionalPreviewLimit)
)

const toggleAdditional = () => {
  additionalExpanded.value = !additionalExpanded.value
}

const sourcesForSkill = (item: ToolkitEntry) => {
  const labels: string[] = []
  const map = experienceIndex.value

  for (const slug of item.sources) {
    const meta = map.get(slug)
    if (!meta) continue
    const name = meta.organization || meta.role
    if (name && !labels.includes(name)) {
      labels.push(name)
    }
    if (labels.length === 2) break
  }

  return labels
}


const coreDescription = computed(
  () => props.skills.core?.description ?? 'The tools I lean on most when building and shipping production work.'
)
</script>

<template>
  <section class="flex flex-col gap-14">
    <SectionHeader title="Skills &amp; Tools" :description="props.skills.intro ?? ''" />

    <div class="flex flex-col gap-16">
      <div v-if="coreGroups.length" class="flex flex-col gap-5">
        <header class="flex flex-col gap-2">
          <span class="text-xs font-semibold uppercase tracking-[0.24em] text-sage-500/90">Core Stack</span>
          <p class="text-sm leading-relaxed text-sage-600">{{ coreDescription }}</p>
        </header>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <CardSurface
            v-for="group in coreGroups"
            :key="group.title"
            padding="sm"
            rounded="lg"
            :surface-class="'border border-sage-200/80 bg-white shadow-card'"
            class="flex h-full flex-col gap-4"
          >
            <header class="space-y-1.5">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-sage-500/80">Core Focus</p>
              <h3 class="font-display text-[1.3rem] font-semibold text-sage-700">{{ group.title }}</h3>
              <p v-if="group.description" class="text-sm leading-relaxed text-sage-600">
                {{ group.description }}
              </p>
            </header>
            <ul class="flex flex-col gap-2" role="list">
              <li v-for="item in group.skills" :key="item.label" class="flex flex-col gap-1">
                <Pill
                  tone="sage"
                  size="md"
                  class="justify-center px-4 py-1.5 text-[0.9rem]"
                >
                  {{ item.label }}
                </Pill>
                  </li>
            </ul>
            <p v-if="group.roleCount" class="text-xs text-sage-500">
              Active across {{ group.roleCount }} role<span v-if="group.roleCount !== 1">s</span>
              <span v-if="group.organizations.length"> · {{ group.organizations.join(' · ') }}</span>
            </p>
          </CardSurface>
        </div>
      </div>

      <div v-if="supportingCategories.categories.length" class="flex flex-col gap-6">
        <header class="flex flex-col gap-2">
          <span class="text-xs font-semibold uppercase tracking-[0.24em] text-sage-500/90">Supporting Toolkit</span>
          <p class="text-sm leading-relaxed text-sage-600">
            Everything that rounds out delivery around the core stack.
          </p>
        </header>
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <CardSurface
            v-for="category in supportingCategories.categories"
            :key="category.title"
            padding="sm"
            rounded="lg"
            :surface-class="'border border-sage-200/80 bg-white shadow-card'"
            class="flex h-full flex-col gap-5 text-left"
          >
            <div class="space-y-2">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-sage-500/80">Category</p>
              <h3 class="font-display text-[1.25rem] font-semibold text-sage-700">{{ category.title }}</h3>
              <p v-if="category.description" class="text-sm leading-relaxed text-sage-600">
                {{ category.description }}
              </p>
            </div>
            <ul class="flex flex-wrap gap-2" role="list">
              <li v-for="item in category.skills" :key="item.label">
                <Pill
                  tone="neutral"
                  size="md"
                  class="justify-center px-3.5 py-1.5 text-[0.82rem] tracking-[0.06em]"
                >
                  {{ item.label }}
                </Pill>
              </li>
            </ul>
          </CardSurface>
        </div>
      </div>

      <div v-if="additionalSkills.length" class="flex flex-col gap-3">
        <header class="flex flex-col gap-2">
          <span class="text-xs font-semibold uppercase tracking-[0.24em] text-sage-500/90">Additional Tools</span>
          <p class="text-sm leading-relaxed text-sage-600">
            Extras that surface less often but stay in rotation.
          </p>
        </header>
        <div class="flex flex-wrap gap-2">
          <Pill
            v-for="item in additionalVisibleSkills"
            :key="item.label"
            tone="neutral"
            size="md"
            class="justify-center px-3.5 py-1.5 text-[0.82rem] tracking-[0.06em]"
          >
            {{ item.label }}
          </Pill>
        </div>
        <button
          v-if="hasAdditionalOverflow"
          type="button"
          class="self-start text-xs font-semibold uppercase tracking-[0.18em] text-sage-500 transition-colors hover:text-sage-600"
          :aria-expanded="additionalExpanded"
          @click="toggleAdditional"
        >
          {{ additionalExpanded ? 'Show fewer tools' : 'Show more tools' }}
        </button>
      </div>
    </div>
  </section>
</template>
