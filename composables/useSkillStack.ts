import { computed, unref, type ComputedRef } from 'vue'
import type { ExperienceContent, SkillsContent } from '~/types/content'

type ToolkitEntry = {
  label: string
  count: number
  sources: string[]
}

export interface SkillCoreGroupDisplay {
  title: string
  description?: string
  skills: ToolkitEntry[]
  organizations: string[]
  roleCount: number
}

export interface SkillCategoryDisplay {
  title: string
  description?: string
  skills: ToolkitEntry[]
}

const normalizeSkill = (value: string) => value.trim().toLowerCase()

const sortSkills = (skills: ToolkitEntry[]) =>
  [...skills].sort((a, b) => (b.count === a.count ? a.label.localeCompare(b.label) : b.count - a.count))

export interface UseSkillStackInput {
  skills: ComputedRef<SkillsContent>
  experience: ComputedRef<ExperienceContent | null | undefined>
}

export const useSkillStack = ({ skills, experience }: UseSkillStackInput) => {
  const experienceEntries = computed(() => unref(experience)?.entries ?? [])

  const experienceIndex = computed(() => {
    const map = new Map<string, { organization: string; role: string }>()
    for (const entry of experienceEntries.value) {
      map.set(entry.slug, { organization: entry.organization, role: entry.role })
    }
    return map
  })

  const aggregatedToolkit = computed(() => {
    const map = new Map<string, ToolkitEntry>()

    for (const entry of experienceEntries.value) {
      if (!entry.toolkit?.length) {
        continue
      }

      for (const skill of entry.toolkit) {
        const key = normalizeSkill(skill)
        const existing = map.get(key)

        if (existing) {
          existing.count += 1
          if (entry.slug && !existing.sources.includes(entry.slug)) {
            existing.sources.push(entry.slug)
          }
          continue
        }

        map.set(key, {
          label: skill,
          count: 1,
          sources: entry.slug ? [entry.slug] : []
        })
      }
    }

    return map
  })

  const coreGroups = computed<SkillCoreGroupDisplay[]>(() => {
    const groups = unref(skills).core?.groups ?? []
    const toolkit = aggregatedToolkit.value
    const metaMap = experienceIndex.value

    return groups.map((group) => {
      const items = group.skills.map((label) => {
        const key = normalizeSkill(label)
        const entry = toolkit.get(key)
        return entry ? { ...entry } : { label, count: 0, sources: [] }
      })

      const roleSlugs = new Set<string>()
      items.forEach((item) => {
        item.sources.forEach((slug) => roleSlugs.add(slug))
      })

      const organizations: string[] = []
      roleSlugs.forEach((slug) => {
        const meta = metaMap.get(slug)
        if (!meta) {
          return
        }
        const label = meta.organization || meta.role
        if (label && !organizations.includes(label)) {
          organizations.push(label)
        }
      })

      return {
        title: group.title,
        description: group.description,
        skills: items,
        organizations: organizations.slice(0, 3),
        roleCount: roleSlugs.size
      }
    })
  })

  const coreKeys = computed(() => {
    const keys = new Set<string>()
    coreGroups.value.forEach((group) => {
      group.skills.forEach((skill) => {
        keys.add(normalizeSkill(skill.label))
      })
    })
    return keys
  })

  const supportingCategories = computed<SkillCategoryDisplay[]>(() => {
    const toolkit = aggregatedToolkit.value
    const categoriesConfig = unref(skills).categories ?? []
    const assigned = new Set<string>()
    const categories: SkillCategoryDisplay[] = []

    for (const category of categoriesConfig) {
      const matches: ToolkitEntry[] = []

      for (const label of category.match ?? []) {
        const key = normalizeSkill(label)
        if (coreKeys.value.has(key) || assigned.has(key)) {
          continue
        }

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

    return categories
  })

  const additionalSkills = computed(() => {
    const toolkit = aggregatedToolkit.value
    const extras: ToolkitEntry[] = []
    const assigned = new Set<string>()

    supportingCategories.value.forEach((category) => {
      category.skills.forEach((skill) => assigned.add(normalizeSkill(skill.label)))
    })

    toolkit.forEach((value, key) => {
      if (coreKeys.value.has(key) || assigned.has(key)) {
        return
      }
      extras.push({ ...value })
    })

    return sortSkills(extras)
  })

  const coreDescription = computed(
    () => unref(skills).core?.description ?? 'The tools I lean on most when building and shipping production work.'
  )

  return {
    coreGroups,
    coreDescription,
    supportingCategories,
    additionalSkills
  }
}
