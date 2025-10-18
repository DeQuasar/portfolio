#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'yaml'

let PDFParse
try {
  ({ PDFParse } = await import('pdf-parse'))
} catch (error) {
  console.warn('[update-experience]', 'pdf-parse dependency is not available; skipping résumé parsing.')
}

const __dirname = dirname(fileURLToPath(import.meta.url))

const DEFAULT_RESUME_PATHS = [
  resolve(process.cwd(), 'public/resume.pdf'),
  resolve(process.cwd(), 'docs/resume/resume.pdf')
]

const EXPERIENCE_CONTENT_PATH = resolve(process.cwd(), 'content/experience.md')

const SECTION_TERMINATORS = new Set([
  'EDUCATION',
  'CERTIFICATIONS',
  'PROJECTS',
  'PUBLICATIONS',
  'VOLUNTEERING',
  'AWARDS'
])

const PERIOD_PATTERN = /^(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+\d{4}\s*[-–]\s*(Present|(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+\d{4})$/i

const slugify = (value) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

const normalizeOrganization = (organization) => {
  return organization
    .replace(/,?\s+(incorporated|inc\.?|llc|l\.l\.c\.|ltd\.?|co\.?|corp\.?|corporation)$/i, '')
    .replace(/[®™]/g, '')
    .trim()
}

const cleanLine = (line) => {
  const normalized = line
    .replace(/\u2022/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (/^--\s*\d+\s+of\s+\d+\s*--$/i.test(normalized)) {
    return ''
  }

  return normalized
}

const isAllCapsHeading = (line) => {
  if (!line || line.length < 3) {
    return false
  }
  const letters = line.replace(/[^A-Za-z]/g, '')
  return letters.length >= 3 && letters === letters.toUpperCase()
}

const isSectionTerminator = (line) => {
  const normalized = line.toUpperCase()
  return SECTION_TERMINATORS.has(normalized) || normalized.startsWith('EDUCATION ')
}

const loadExistingExperience = async () => {
  if (!existsSync(EXPERIENCE_CONTENT_PATH)) {
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

  const content = body ? yaml.parse(body) : {}
  return Array.isArray(content.entries) ? content.entries : []
}

const deriveSlug = (organization, period, baseFrequency, baseCounts, usedSlugs) => {
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

const parseExperienceFromResume = async (resumePath) => {
  if (!PDFParse) {
    return []
  }

  const buffer = await readFile(resumePath)
  const parser = new PDFParse({ data: buffer })

  try {
    const { text } = await parser.getText()
    const rawLines = text.split(/\r?\n/)
    const lines = rawLines.map((line) => cleanLine(line))

    const startIndex = lines.findIndex((line) => line === 'EXPERIENCE')
    if (startIndex === -1) {
      throw new Error('Unable to locate EXPERIENCE section in résumé')
    }

    const entries = []
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
      if (!PERIOD_PATTERN.test(potentialPeriod)) {
        i += 1
        continue
      }

      const organization = organizationLine
      const role = lines[i + 1] ?? ''
      const location = lines[i + 2] ?? ''
      const period = potentialPeriod

      i += 4
      const summary = []

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

        summary.push(line)
        i += 1
      }

      entries.push({
        organization,
        role,
        location,
        period,
        summary,
        projects: []
      })
    }

    const baseFrequency = new Map()
    entries.forEach((entry) => {
      const base = slugify(normalizeOrganization(entry.organization))
      baseFrequency.set(base, (baseFrequency.get(base) ?? 0) + 1)
    })

    const baseCounts = new Map()
    const usedSlugs = new Set()

    return entries.map((entry) => {
      const slug = deriveSlug(entry.organization, entry.period, baseFrequency, baseCounts, usedSlugs)
      return {
        ...entry,
        slug
      }
    })
  } finally {
    await parser.destroy()
  }
}

const mergeWithExisting = (parsedEntries, existingEntries) => {
  const existingMap = new Map()
  for (const entry of existingEntries) {
    existingMap.set(entry.slug, entry)
  }

  return parsedEntries.map((entry) => {
    const existing = existingMap.get(entry.slug)
    return {
      ...entry,
      toolkit: existing?.toolkit ?? [],
      projects: existing?.projects ?? []
    }
  })
}

const writeExperienceContent = async (entries) => {
  const doc = yaml.stringify({ entries }, { lineWidth: 0 })
  const output = `---\n${doc.trimEnd()}\n---\n`
  await writeFile(EXPERIENCE_CONTENT_PATH, output, 'utf8')
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
    const parsed = await parseExperienceFromResume(resumePath)
    if (!parsed.length) {
      console.warn('[update-experience]', 'No experience entries parsed from résumé.')
      return
    }
    const existing = await loadExistingExperience()
    const merged = mergeWithExisting(parsed, existing)
    await writeExperienceContent(merged)
    console.log('[update-experience]', `Updated ${merged.length} experience entries from résumé at ${resumePath}`)
  } catch (error) {
    console.error('[update-experience]', 'Failed to update experience content:', error.message ?? error)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error('[update-experience]', error)
    process.exit(1)
  })
}

export const updateExperienceFromResume = async (resumePath) => {
  const parsed = await parseExperienceFromResume(resumePath)
  const existing = await loadExistingExperience()
  const merged = mergeWithExisting(parsed, existing)
  await writeExperienceContent(merged)
}
