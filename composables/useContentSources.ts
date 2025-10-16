import { queryCollection } from '#imports'
import type { CollectionQueryBuilder } from '@nuxt/content'
import type { ContactContent, ExperienceContent, HeroContent, HighlightContent, ProjectContent, SkillsContent } from '~/types/content'

interface RawContentRow<T> {
  meta?: string | T
  body?: unknown
  [key: string]: unknown
}

const normalizePath = (path: string) => (path.endsWith('/') ? path.slice(0, -1) : path)

const contentEntry = <T>(path: string) =>
  queryCollection('content').path(path) as CollectionQueryBuilder<RawContentRow<T>>

const contentChildren = <T>(dir: string) =>
  queryCollection('content').where('path', 'LIKE', `${normalizePath(dir)}/%`) as CollectionQueryBuilder<RawContentRow<T>>

const parseMeta = <T>(row: RawContentRow<T> | null): T | null => {
  if (!row?.meta) {
    return null
  }

  const meta = typeof row.meta === 'string' ? JSON.parse(row.meta) : row.meta

  if (!meta || typeof meta !== 'object') {
    return null
  }

  return {
    ...meta,
    ...(row.title ? { title: row.title } : {}),
    ...(row.path ? { path: row.path } : {})
  } as T
}

export const useHeroContent = () =>
  useAsyncData('hero', async () => {
    const doc = await contentEntry<HeroContent>('/hero').first()
    return parseMeta<HeroContent>(doc)
  })

export const useHighlights = () =>
  useAsyncData('highlights', () =>
    contentChildren<HighlightContent>('/highlights')
      .all()
      .then((items) => {
        return items
          .map((item) => parseMeta<HighlightContent>(item))
          .filter((item): item is HighlightContent => item !== null)
          .sort((a, b) => Number(a.order) - Number(b.order))
      })
  )

export const useProjects = () =>
  useAsyncData('projects', () =>
    contentChildren<ProjectContent>('/projects')
      .all()
      .then((items) => {
        return items
          .map((item) => parseMeta<ProjectContent>(item))
          .filter((item): item is ProjectContent => item !== null)
          .sort((a, b) => Number(a.order) - Number(b.order))
      })
  )

export const useSkillsContent = () =>
  useAsyncData('skills', async () => {
    const doc = await contentEntry<SkillsContent>('/skills').first()
    return parseMeta<SkillsContent>(doc)
  })

export const useContactContent = () =>
  useAsyncData('contact', async () => {
    const doc = await contentEntry<ContactContent>('/contact').first()
    return parseMeta<ContactContent>(doc)
  })

export const useExperienceContent = () =>
  useAsyncData('experience', async () => {
    const doc = await contentEntry<ExperienceContent>('/experience').first()
    return parseMeta<ExperienceContent>(doc)
  })
