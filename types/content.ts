export interface HeroContent {
  name: string
  role: string
  headline: string
  subheadline: string
  metrics: Array<{ label: string; value: string }>
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  location: string
  social: Array<{ label: string; icon: string; href: string }>
  blurb?: string
}

export interface HighlightContent {
  slug: string
  order: number
  title: string
  role: string
  impact: string
  stack: string[]
  cta?: { label: string; href: string }
  confidentiality?: string
}

export interface ProjectContent {
  slug: string
  order: number
  title: string
  summary: string
  problem: string
  contribution: string[]
  impact: string[]
  stack: string[]
  availability?: string
}

export interface SkillCoreGroup {
  title: string
  skills: string[]
  description?: string
}

export interface SkillCore {
  description?: string
  groups: SkillCoreGroup[]
}

export interface SkillCategory {
  title: string
  match: string[]
  description?: string
}

export interface SkillsContent {
  core?: SkillCore
  categories: SkillCategory[]
  intro?: string
}

export interface AboutContent {
  headline: string
  traits: string[]
  availability: string
  bio?: string
}

export interface ContactContent {
  resumeUrl: string
  email: string
  github?: string
  linkedin?: string
  availability: string
  message?: string
}

export interface ExperienceProject {
  title: string
  summary: string
  problem: string
  contribution: string
  impact: string
  links: Array<{ text: string; url: string }>
}

export interface ExperienceEntry {
  slug: string
  role: string
  organization: string
  location: string
  period: string
  summary: string[]
  projects: ExperienceProject[]
  toolkit?: string[]
}

export interface ExperienceContent {
  entries: ExperienceEntry[]
}
