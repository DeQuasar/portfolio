import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { ExperienceEntry, ExperienceProject } from '../types/content'

type PDFParseInstance = {
  getText: () => Promise<{ text: string }>
  destroy: () => Promise<void>
}

type PDFParseConstructor = new (options: { data: Buffer }) => PDFParseInstance

interface YamlModule {
  parse: (source: string) => any
  stringify: (value: unknown, options?: { lineWidth?: number }) => string
}

let YAML: YamlModule | undefined
let PDFParse: PDFParseConstructor | undefined

const yamlSpecifier = ['ya', 'ml'].join('')
const pdfParseSpecifier = ['pdf', '-', 'parse'].join('')

const ensureYaml = async () => {
  if (YAML) {
    return
  }

  try {
    const yamlModule = await import(yamlSpecifier) as YamlModule & { default?: YamlModule }
    YAML = yamlModule.default ?? yamlModule
  } catch {
    try {
      const { createRequire } = await import('node:module') as typeof import('node:module')
      const requireModule = createRequire(import.meta.url)
      const yamlModule = requireModule(yamlSpecifier) as YamlModule & { default?: YamlModule }
      YAML = yamlModule.default ?? yamlModule
    } catch {
      console.warn('[update-experience]', 'yaml dependency is not available; skipping résumé parsing.')
    }
  }
}

const ensurePdfParse = async () => {
  if (PDFParse) {
    return
  }

  try {
    const pdfModule = await import(pdfParseSpecifier) as { PDFParse?: PDFParseConstructor; default?: PDFParseConstructor }
    PDFParse = pdfModule.PDFParse ?? pdfModule.default
  } catch {
    try {
      const { createRequire } = await import('node:module') as typeof import('node:module')
      const requireModule = createRequire(import.meta.url)
      const pdfModule = requireModule(pdfParseSpecifier) as { PDFParse?: PDFParseConstructor; default?: PDFParseConstructor }
      PDFParse = pdfModule.PDFParse ?? pdfModule.default
    } catch {
      console.warn('[update-experience]', 'pdf-parse dependency is not available; skipping résumé parsing.')
    }
  }
}

const ensureDependencies = async () => {
  await ensureYaml()
  await ensurePdfParse()
}

const EXPERIENCE_CONTENT_PATH = resolve(process.cwd(), 'content/experience.md')
const HERO_CONTENT_PATH = resolve(process.cwd(), 'content/hero.md')

const SECTION_TERMINATORS = new Set([
  'EDUCATION',
  'CERTIFICATIONS',
  'PROJECTS',
  'PUBLICATIONS',
  'VOLUNTEERING',
  'AWARDS'
])

const PERIOD_PATTERN = /^(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+\d{4}\s*[-–]\s*(Present|(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+\d{4})$/i

const PROBLEM_KEYWORDS = ['bottleneck', 'challenge', 'delay', 'fragmented', 'gap', 'issue', 'legacy', 'manual', 'risk', 'slow', 'unstable', 'problem', 'struggle', 'stability']
const IMPACT_KEYWORDS = ['accelerated', 'achieved', 'cut', 'decreased', 'delivered', 'enabled', 'improved', 'increased', 'launched', 'reduced', 'result', 'shortened', 'stabilized', 'boosted', 'reached', 'held', 'ensured', 'restored']
const ensureSentence = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed.length) {
    return ''
  }
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

const clampToTwoSentences = (value: string, fallback: string) => {
  const normalized = ensureSentence(value)
  const segments = normalized
    .split(/(?<=[.!?])\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean)

  if (!segments.length) {
    return ensureSentence(fallback)
  }

  const selected = segments.slice(0, 2)
  return ensureSentence(selected.join(' '))
}

const slugify = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

const normalizeOrganization = (organization: string) => {
  return organization
    .replace(/,?\s+(incorporated|inc\.?|llc|l\.l\.c\.?|ltd\.?|co\.?|corp\.?|corporation)$/i, '')
    .replace(/[®™]/g, '')
    .trim()
}

const cleanLine = (line: string) => {
  const rawTrimmed = line.trim()
  if (/^--\s*\d+\s+of\s+\d+\s*--$/i.test(rawTrimmed)) {
    return ''
  }

  const normalized = line
    .replace(/\u2022/g, '')
    .replace(/\s*-\s+/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim()

  return normalized
}

const isAllCapsHeading = (line: string) => {
  if (!line || line.length < 3) {
    return false
  }
  const letters = line.replace(/[^A-Za-z]/g, '')
  return letters.length >= 3 && letters === letters.toUpperCase()
}

const isSectionTerminator = (line: string) => {
  const normalized = line.toUpperCase()
  return SECTION_TERMINATORS.has(normalized) || normalized.startsWith('EDUCATION ')
}

const categorizeSummaryLine = (line: string) => {
  const normalized = line.toLowerCase()
  if (IMPACT_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return 'impact'
  }
  if (PROBLEM_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return 'problem'
  }
  return 'contribution'
}

const buildProjectsFromSummary = (entry: Pick<ExperienceEntry, 'organization' | 'role' | 'summary'>): ExperienceProject[] => {
  const buckets: Record<'problem' | 'contribution' | 'impact', string[]> = {
    problem: [],
    contribution: [],
    impact: []
  }

  entry.summary?.forEach((line) => {
    if (!line) {
      return
    }
    const category = categorizeSummaryLine(line)
    buckets[category as keyof typeof buckets].push(line)
  })

  const aggregate = (primary: keyof typeof buckets, fallbacks: Array<keyof typeof buckets> = []) => {
    const selected = buckets[primary]
    if (selected.length) {
      return clampToTwoSentences(selected.map((line) => ensureSentence(line)).join(' '), `${entry.role} at ${entry.organization}`)
    }
    for (const fallback of fallbacks) {
      const candidate = buckets[fallback]
      if (candidate.length) {
        return clampToTwoSentences(candidate.map((line) => ensureSentence(line)).join(' '), `${entry.role} at ${entry.organization}`)
      }
    }
    if (entry.summary?.length) {
      return clampToTwoSentences(entry.summary.map((line) => ensureSentence(line)).join(' '), `${entry.role} at ${entry.organization}`)
    }
    return clampToTwoSentences(`${entry.role} at ${entry.organization}`, `${entry.role} at ${entry.organization}`)
  }

  const summary = entry.summary?.[0]?.trim().length
    ? clampToTwoSentences(entry.summary[0], `${entry.role} at ${entry.organization}`)
    : clampToTwoSentences(`${entry.role} at ${entry.organization}`, `${entry.role} at ${entry.organization}`)

  return [
    {
      title: `${entry.organization} – ${entry.role}`,
      summary,
      problem: aggregate('problem', ['contribution']),
      contribution: aggregate('contribution', ['problem']),
      impact: aggregate('impact', ['contribution']),
      links: []
    }
  ]
}
const extractResumeSummary = (lines: string[]) => {
  const startIndex = lines.findIndex((line) => line === 'SUMMARY')
  if (startIndex === -1) {
    return null
  }

  const summaryLines: string[] = []
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const line = lines[i]
    if (!line) {
      continue
    }
    if (line === 'SKILLS' || line === 'EXPERIENCE' || isSectionTerminator(line) || isAllCapsHeading(line)) {
      break
    }
    summaryLines.push(line)
  }

  if (!summaryLines.length) {
    return null
  }

  const summary = summaryLines.join(' ')
  return summary.replace(/\s+/g, ' ').trim()
}

const deriveSlug = (organization: string, period: string, baseFrequency: Map<string, number>, baseCounts: Map<string, number>, usedSlugs: Set<string>) => {
  const normalizedOrg = normalizeOrganization(organization)
  const base = slugify(normalizedOrg)

  const startYearMatch = period.match(/\b(\d{4})\b/)
  const startYear = startYearMatch ? startYearMatch[0] : null

  const count = (baseCounts.get(base) ?? 0) + 1
  baseCounts.set(base, count)

  let candidate = base
  const totalForBase = baseFrequency.get(base) ?? 1

  if (totalForBase > 1) {
    candidate = startYear ? `${base}-${startYear}` : `${base}-${count}`
  }

  if (usedSlugs.has(candidate)) {
    let suffix = 2
    while (usedSlugs.has(`${candidate}-${suffix}`)) {
      suffix += 1
    }
    candidate = `${candidate}-${suffix}`
  }

  usedSlugs.add(candidate)
  return candidate
}

const parseExperienceEntries = (lines: string[]): ExperienceEntry[] => {
  const startIndex = lines.findIndex((line) => line === 'EXPERIENCE')
  if (startIndex === -1) {
    throw new Error('Unable to locate EXPERIENCE section in résumé')
  }

  const entries: ExperienceEntry[] = []
  let i = startIndex + 1

  while (i < lines.length) {
    while (i < lines.length && !lines[i]) i += 1
    if (i >= lines.length) {
      break
    }

    const organizationLine = lines[i]
    if (!organizationLine || isSectionTerminator(organizationLine) || isAllCapsHeading(organizationLine)) {
      break
    }

    if (i + 3 >= lines.length) {
      break
    }

    const potentialPeriod = lines[i + 3]
    if (!PERIOD_PATTERN.test(potentialPeriod ?? '')) {
      i += 1
      continue
    }

    const organization = organizationLine
    const role = lines[i + 1] ?? ''
    const location = lines[i + 2] ?? ''
    const period = potentialPeriod

    i += 4
    const summary: string[] = []

    while (i < lines.length) {
      const line = lines[i]
      if (!line) {
        i += 1
        continue
      }

      if (isSectionTerminator(line)) {
        break
      }

      const maybeNextPeriod = lines[i + 3]
      if (maybeNextPeriod && PERIOD_PATTERN.test(maybeNextPeriod)) {
        break
      }

      if (line === 'EXPERIENCE' || isAllCapsHeading(line)) {
        break
      }

      summary.push(line)
      i += 1
    }

    entries.push({
      organization,
      role,
      location,
      period,
      summary,
      projects: [],
      toolkit: []
    })
  }

  const baseFrequency = new Map<string, number>()
  entries.forEach((entry) => {
    const base = slugify(normalizeOrganization(entry.organization))
    baseFrequency.set(base, (baseFrequency.get(base) ?? 0) + 1)
  })

  const baseCounts = new Map<string, number>()
  const usedSlugs = new Set<string>()

  return entries.map((entry) => {
    const slug = deriveSlug(entry.organization, entry.period, baseFrequency, baseCounts, usedSlugs)
    return {
      ...entry,
      slug
    }
  })
}
const cloneToolkit = (values?: string[]) => (Array.isArray(values) ? [...values] : [])

const cloneProjects = (projects?: ExperienceProject[]) => (
  Array.isArray(projects)
    ? projects.map((project) => ({
        ...project,
        links: Array.isArray(project.links)
          ? project.links.map((link) => ({ ...link }))
          : []
      }))
    : []
)

const loadExistingExperience = async (): Promise<ExperienceEntry[]> => {
  await ensureYaml()

  if (!YAML || !existsSync(EXPERIENCE_CONTENT_PATH)) {
    return []
  }

  const raw = await readFile(EXPERIENCE_CONTENT_PATH, 'utf8')
  let body = raw.trim()
  if (body.startsWith('---')) {
    const closingIndex = body.lastIndexOf('\n---')
    if (closingIndex !== -1) {
      body = body.slice(3, closingIndex).trim()
    } else {
      body = body.slice(3).trim()
    }
  }

  const content = body ? YAML.parse(body) : {}
  const entries = Array.isArray(content?.entries) ? content.entries as ExperienceEntry[] : []
  return entries
}

const mergeWithExisting = (parsedEntries: ExperienceEntry[], existingEntries: ExperienceEntry[]): ExperienceEntry[] => {
  const clonedExisting = existingEntries.map((entry) => ({
    ...entry,
    summary: Array.isArray(entry.summary) ? [...entry.summary] : [],
    toolkit: cloneToolkit(entry.toolkit),
    projects: cloneProjects(entry.projects)
  }))

  const existingMap = new Map<string, ExperienceEntry>()
  clonedExisting.forEach((entry) => existingMap.set(entry.slug, entry))

  const parsedMap = new Map<string, ExperienceEntry>()
  parsedEntries.forEach((entry) => parsedMap.set(entry.slug, entry))

  clonedExisting.forEach((entry) => {
    const parsed = parsedMap.get(entry.slug)
    if (parsed) {
      entry.organization = parsed.organization
      entry.role = parsed.role
      entry.location = parsed.location
      entry.period = parsed.period
      entry.summary = [...parsed.summary]
    }
  })

  parsedEntries.forEach((entry) => {
    if (!existingMap.has(entry.slug)) {
      clonedExisting.push({
        ...entry,
        summary: [...entry.summary],
        toolkit: cloneToolkit(entry.toolkit),
        projects: []
      })
    }
  })

  return clonedExisting
}

const writeExperienceContent = async (entries: ExperienceEntry[]) => {
  await ensureYaml()

  if (!YAML) {
    return
  }
  const doc = YAML.stringify({ entries }, { lineWidth: 0 })
  const output = `---\n${doc.trimEnd()}\n---\n`
  await writeFile(EXPERIENCE_CONTENT_PATH, output, 'utf8')
}

const updateHeroSummary = async (summary: string | null) => {
  await ensureYaml()

  if (!YAML || !summary?.trim().length || !existsSync(HERO_CONTENT_PATH)) {
    return
  }

  const raw = await readFile(HERO_CONTENT_PATH, 'utf8')
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)

  if (!match) {
    return
  }

  const [, frontMatter, body = '' ] = match
  const data = YAML.parse(frontMatter) as Record<string, unknown>

  if (!data || typeof data !== 'object') {
    return
  }

  const next = summary.trim()
  if (data.subheadline === next) {
    return
  }

  data.subheadline = next
  const updatedFrontMatter = YAML.stringify(data, { lineWidth: 0 }).trimEnd()
  const output = `---\n${updatedFrontMatter}\n---\n${body}`
  await writeFile(HERO_CONTENT_PATH, output, 'utf8')
}

const parseResumeDocument = async (resumePath: string) => {
  await ensureDependencies()

  if (!PDFParse || !YAML) {
    return { summary: null as string | null, entries: [] as ExperienceEntry[] }
  }

  const buffer = await readFile(resumePath)
  const parser = new PDFParse({ data: buffer })

  try {
    const { text } = await parser.getText()
    const rawLines = text.split(/\r?\n/)
    const lines = rawLines.map((line) => cleanLine(line))

    const summary = extractResumeSummary(lines)
    const entries = parseExperienceEntries(lines)

    return { summary, entries }
  } finally {
    await parser.destroy()
  }
}
const DEFAULT_RESUME_PATHS = [
  resolve(process.cwd(), 'public/resume.pdf'),
  resolve(process.cwd(), 'docs/resume/resume.pdf')
]

const buildProjectsForEntry = (entry: Pick<ExperienceEntry, 'organization' | 'role' | 'summary'>) => buildProjectsFromSummary(entry)

export const updateExperienceFromResume = async (resumePath: string) => {
  const { summary, entries } = await parseResumeDocument(resumePath)
  const existing = await loadExistingExperience()
  const merged = mergeWithExisting(entries, existing)
  await writeExperienceContent(merged)
  await updateHeroSummary(summary)
}

const main = async () => {
  const resumePathArg = process.argv[2]
  const candidatePaths = resumePathArg
    ? [resolve(process.cwd(), resumePathArg)]
    : DEFAULT_RESUME_PATHS

  const resumePath = candidatePaths.find((candidate) => existsSync(candidate))

  if (!resumePath) {
    console.warn('[update-experience]', 'No résumé file found to parse. Checked:', candidatePaths.join(', '))
    return
  }

  try {
    await updateExperienceFromResume(resumePath)
    console.log('[update-experience]', `Updated experience entries from résumé at ${resumePath}`)
  } catch (error: any) {
    console.error('[update-experience]', 'Failed to update experience content:', error?.message ?? error)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error('[update-experience]', error)
    process.exit(1)
  })
}

export {
  buildProjectsForEntry,
  buildProjectsFromSummary,
  categorizeSummaryLine,
  extractResumeSummary
}
