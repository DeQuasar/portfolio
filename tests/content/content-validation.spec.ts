import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { parse: parseYaml } = require('yaml') as { parse: (source: string) => unknown }

type Frontmatter = Record<string, unknown>

const readFrontmatter = (relativePath: string): Frontmatter => {
  const absolute = join(process.cwd(), relativePath)
  const source = readFileSync(absolute, 'utf8')
  const match = source.match(/^---\n([\s\S]*?)\n---/)
  expect(match, `Front matter block missing in ${relativePath}`).not.toBeNull()
  const yamlSource = match?.[1] ?? ''
  const parsed = parseYaml(yamlSource) as Frontmatter | null
  expect(parsed, `Unable to parse front matter for ${relativePath}`).not.toBeNull()
  return parsed ?? {}
}

const assertNonEmptyString = (value: unknown, label: string) => {
  expect(typeof value, `${label} should be a string`).toBe('string')
  expect((value as string).trim().length, `${label} should not be empty`).toBeGreaterThan(0)
}

const assertStringArray = (value: unknown, label: string) => {
  expect(Array.isArray(value), `${label} should be an array`).toBe(true)
  ;(value as unknown[]).forEach((item, index) => {
    assertNonEmptyString(item, `${label}[${index}]`)
  })
}

const projectHrefPattern = /^\/projects\/([a-z0-9-]+)\/?$/
const extractProjectSlug = (href: unknown): string | null => {
  if (typeof href !== 'string') {
    return null
  }
  const match = href.match(projectHrefPattern)
  return match ? match[1] : null
}

const getProjectSlugs = () =>
  new Set(
    readdirSync('content/projects')
      .filter((file) => file.endsWith('.md'))
      .map((file) => readFrontmatter(join('content/projects', file)).slug)
      .filter((slug): slug is string => typeof slug === 'string' && slug.trim().length > 0)
  )

const getHighlightSlugs = () =>
  new Set(
    readdirSync('content/highlights')
      .filter((file) => file.endsWith('.md'))
      .map((file) => readFrontmatter(join('content/highlights', file)).slug)
      .filter((slug): slug is string => typeof slug === 'string' && slug.trim().length > 0)
  )

describe('Content front matter validation', () => {
  it('hero.md matches the HeroContent contract', () => {
    const hero = readFrontmatter('content/hero.md')
    assertNonEmptyString(hero.name, 'hero.name')
    assertNonEmptyString(hero.role, 'hero.role')
    assertNonEmptyString(hero.headline, 'hero.headline')
    assertNonEmptyString(hero.subheadline, 'hero.subheadline')
    assertNonEmptyString(hero.location, 'hero.location')

    expect(Array.isArray(hero.metrics), 'hero.metrics should be an array').toBe(true)
    const metrics = hero.metrics as unknown[]
    expect(metrics.length, 'hero.metrics should have items').toBeGreaterThan(0)
    metrics.forEach((metric, index) => {
      expect(typeof metric, `hero.metrics[${index}] should be an object`).toBe('object')
      if (metric && typeof metric === 'object') {
        assertNonEmptyString((metric as Frontmatter).label, `hero.metrics[${index}].label`)
        assertNonEmptyString((metric as Frontmatter).value, `hero.metrics[${index}].value`)
      }
    })

    expect(typeof hero.primaryCta, 'hero.primaryCta should be an object').toBe('object')
    if (hero.primaryCta && typeof hero.primaryCta === 'object') {
      assertNonEmptyString((hero.primaryCta as Frontmatter).label, 'hero.primaryCta.label')
      assertNonEmptyString((hero.primaryCta as Frontmatter).href, 'hero.primaryCta.href')
    }

    expect(typeof hero.secondaryCta, 'hero.secondaryCta should be an object').toBe('object')
    if (hero.secondaryCta && typeof hero.secondaryCta === 'object') {
      assertNonEmptyString((hero.secondaryCta as Frontmatter).label, 'hero.secondaryCta.label')
      assertNonEmptyString((hero.secondaryCta as Frontmatter).href, 'hero.secondaryCta.href')
    }

    expect(Array.isArray(hero.social), 'hero.social should be an array').toBe(true)
    const socials = hero.social as unknown[]
    expect(socials.length, 'hero.social should have items').toBeGreaterThan(0)
    socials.forEach((social, index) => {
      expect(typeof social, `hero.social[${index}] should be an object`).toBe('object')
      if (social && typeof social === 'object') {
        assertNonEmptyString((social as Frontmatter).label, `hero.social[${index}].label`)
        assertNonEmptyString((social as Frontmatter).icon, `hero.social[${index}].icon`)
        assertNonEmptyString((social as Frontmatter).href, `hero.social[${index}].href`)
      }
    })
  })

  it('contact.md exposes required contact metadata', () => {
    const contact = readFrontmatter('content/contact.md')
    assertNonEmptyString(contact.resumeUrl, 'contact.resumeUrl')
    assertNonEmptyString(contact.email, 'contact.email')
    expect((contact.email as string)).toContain('@')
    assertNonEmptyString(contact.availability, 'contact.availability')
    if (contact.github) {
      assertNonEmptyString(contact.github, 'contact.github')
    }
    if (contact.linkedin) {
      assertNonEmptyString(contact.linkedin, 'contact.linkedin')
    }
    if (contact.message) {
      assertNonEmptyString(contact.message, 'contact.message')
    }
  })

  it('experience.md entries include required fields', () => {
    const experience = readFrontmatter('content/experience.md')
    const validProjectSlugs = getProjectSlugs()
    const highlightSlugs = getHighlightSlugs()
    expect(Array.isArray(experience.entries), 'experience.entries should be an array').toBe(true)
    const entries = experience.entries as Frontmatter[]
    expect(entries.length, 'experience.entries should not be empty').toBeGreaterThan(0)

    const slugs = new Set<string>()
    entries.forEach((entry, entryIndex) => {
      assertNonEmptyString(entry.slug, `experience.entries[${entryIndex}].slug`)
      assertNonEmptyString(entry.role, `experience.entries[${entryIndex}].role`)
      assertNonEmptyString(entry.organization, `experience.entries[${entryIndex}].organization`)
      assertNonEmptyString(entry.location, `experience.entries[${entryIndex}].location`)
      assertNonEmptyString(entry.period, `experience.entries[${entryIndex}].period`)
      const slug = entry.slug as string
      expect(slugs.has(slug), `Duplicate experience slug "${slug}"`).toBe(false)
      slugs.add(slug)
      if (entry.toolkit !== undefined) {
        assertStringArray(entry.toolkit, `experience.entries[${entryIndex}].toolkit`)
      }
      assertStringArray(entry.summary, `experience.entries[${entryIndex}].summary`)
      expect(Array.isArray(entry.projects), `experience.entries[${entryIndex}].projects should be an array`).toBe(true)
      ;(entry.projects as Frontmatter[]).forEach((project, projectIndex) => {
        assertNonEmptyString(project.title, `experience.entries[${entryIndex}].projects[${projectIndex}].title`)
        assertNonEmptyString(project.summary, `experience.entries[${entryIndex}].projects[${projectIndex}].summary`)
        assertNonEmptyString(project.problem, `experience.entries[${entryIndex}].projects[${projectIndex}].problem`)
        assertNonEmptyString(project.contribution, `experience.entries[${entryIndex}].projects[${projectIndex}].contribution`)
        assertNonEmptyString(project.impact, `experience.entries[${entryIndex}].projects[${projectIndex}].impact`)
        expect(Array.isArray(project.links), `experience.entries[${entryIndex}].projects[${projectIndex}].links should be an array`).toBe(true)
        ;(project.links as Frontmatter[]).forEach((link, linkIndex) => {
          assertNonEmptyString(link.text, `experience.entries[${entryIndex}].projects[${projectIndex}].links[${linkIndex}].text`)
          assertNonEmptyString(link.url, `experience.entries[${entryIndex}].projects[${projectIndex}].links[${linkIndex}].url`)
          const linkedSlug = extractProjectSlug(link.url)
          if (linkedSlug) {
            expect(validProjectSlugs.has(linkedSlug), `experience project "${project.title}" links to missing project slug "${linkedSlug}"`).toBe(true)
            expect(highlightSlugs.has(linkedSlug), `experience project "${project.title}" links to project slug "${linkedSlug}" without matching highlight file`).toBe(true)
          }
        })
        if (project.highlights) {
          expect(Array.isArray(project.highlights), `experience.entries[${entryIndex}].projects[${projectIndex}].highlights should be an array`).toBe(true)
          ;(project.highlights as Frontmatter[]).forEach((highlight, highlightIndex) => {
            if (typeof highlight.id === 'string' && highlight.id.trim().length) {
              expect(highlightSlugs.has(highlight.id), `experience project "${project.title}" highlight[${highlightIndex}] references missing highlight id "${highlight.id}"`).toBe(true)
            }
          })
        }
      })
    })
  })

  it('skills.md core groups and categories provide labeled string collections', () => {
    const skills = readFrontmatter('content/skills.md')
    const core = skills.core as Frontmatter
    expect(core, 'skills.core should be present').toBeTruthy()
    expect(Array.isArray(core?.groups), 'skills.core.groups should be an array').toBe(true)
    ;(core.groups as Frontmatter[]).forEach((group, index) => {
      assertNonEmptyString(group.title, `skills.core.groups[${index}].title`)
      assertStringArray(group.skills, `skills.core.groups[${index}].skills`)
      if (group.description) {
        assertNonEmptyString(group.description, `skills.core.groups[${index}].description`)
      }
    })

    expect(Array.isArray(skills.categories), 'skills.categories should be an array').toBe(true)
    ;(skills.categories as Frontmatter[]).forEach((category, index) => {
      assertNonEmptyString(category.title, `skills.categories[${index}].title`)
      assertStringArray(category.match, `skills.categories[${index}].match`)
      if (category.description) {
        assertNonEmptyString(category.description, `skills.categories[${index}].description`)
      }
    })
    if (skills.intro) {
      assertNonEmptyString(skills.intro, 'skills.intro')
    }
  })

  it('highlight entries include ordering, stack, and CTA metadata', () => {
    const highlightDir = 'content/highlights'
    const files = readdirSync(highlightDir).filter((file) => file.endsWith('.md'))
    expect(files.length, 'highlight entries should exist').toBeGreaterThan(0)
    const validProjectSlugs = getProjectSlugs()
    const orders = new Set<number>()
    files.forEach((file) => {
      const highlight = readFrontmatter(join(highlightDir, file))
      assertNonEmptyString(highlight.slug, `${file} slug`)
      const orderValue = Number(highlight.order)
      expect(Number.isFinite(orderValue), `${file} order should be numeric`).toBe(true)
      expect(orders.has(orderValue), `${file} order ${orderValue} should be unique`).toBe(false)
      orders.add(orderValue)
      assertNonEmptyString(highlight.title, `${file} title`)
      assertNonEmptyString(highlight.role, `${file} role`)
      assertNonEmptyString(highlight.impact, `${file} impact`)
      assertStringArray(highlight.stack, `${file} stack`)
      if (highlight.cta) {
        const cta = highlight.cta as Frontmatter
        assertNonEmptyString(cta.label, `${file} cta.label`)
        assertNonEmptyString(cta.href, `${file} cta.href`)
        const linkedSlug = extractProjectSlug(cta.href)
        if (linkedSlug) {
          expect(validProjectSlugs.has(linkedSlug), `${file} CTA links to missing project slug "${linkedSlug}"`).toBe(true)
        }
      }
      const slug = highlight.slug as string
      expect(validProjectSlugs.has(slug), `${file} references missing project slug "${slug}"`).toBe(true)
    })
  })

  it('project entries enforce required text and list fields', () => {
    const projectDir = 'content/projects'
    const files = readdirSync(projectDir).filter((file) => file.endsWith('.md'))
    expect(files.length, 'project entries should exist').toBeGreaterThan(0)
    const orders = new Set<number>()
    files.forEach((file) => {
      const project = readFrontmatter(join(projectDir, file))
      assertNonEmptyString(project.slug, `${file} slug`)
      assertNonEmptyString(project.title, `${file} title`)
      assertNonEmptyString(project.summary, `${file} summary`)
      assertNonEmptyString(project.problem, `${file} problem`)
      assertStringArray(project.contribution, `${file} contribution`)
      assertStringArray(project.impact, `${file} impact`)
      assertStringArray(project.stack, `${file} stack`)
      const orderValue = Number(project.order)
      expect(Number.isFinite(orderValue), `${file} order should be numeric`).toBe(true)
      expect(orders.has(orderValue), `${file} order ${orderValue} should be unique`).toBe(false)
      orders.add(orderValue)
      if (project.availability) {
        assertNonEmptyString(project.availability, `${file} availability`)
      }
    })
  })
})
