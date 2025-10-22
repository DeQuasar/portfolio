import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const tempDir = mkdtempSync(join(tmpdir(), 'resume-sync-'))
const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

vi.mock('pdf-parse', () => {
  return {
    PDFParse: class {
      constructor ({ data }) {
        this.data = data
      }

      async getText () {
        return { text: this.data.toString('utf8') }
      }

      async destroy () {}
    }
  }
})

const {
  updateExperienceFromResume,
  buildProjectsForEntry,
  categorizeSummaryLine,
  extractResumeSummary
} = await import('../../scripts/update-experience-from-resume.ts')
const YAML = await import('yaml')

const resumeText = `Anthony Protano\nSUMMARY\nSenior software developer focused on stability and maintainable systems.\nComfortable leading distributed teams and modernizing legacy stacks.\nSKILLS\nTesting\nEXPERIENCE\nClevyr, Inc.\nSenior Software Developer\nRemote\nJune 2023 - Present\nStabilized critical Laravel/Vue platform supporting core client workflows.\nReduced incident noise by introducing monitoring and shared triage.\nImproved upgrade cadence with automated dependency strategy.\nLeasecake\nStaff Engineer\nRemote\nApril 2021 - June 2023\nInherited analytics stack that struggled with performance.\nGuided a refactor that clarified architecture and testing.\nDelivered dashboards executives used for fundraising updates.\nEDUCATION\n`

const originalApiKey = process.env.OPENAI_API_KEY ?? process.env.OPEN_API_KEY

beforeAll(() => {
  mkdirSync(join(tempDir, 'content'), { recursive: true })
  mkdirSync(join(tempDir, 'public'), { recursive: true })
})

beforeEach(() => {
  vi.restoreAllMocks()
  cwdSpy.mockReturnValue(tempDir)
  delete process.env.OPENAI_API_KEY
  delete process.env.OPEN_API_KEY

  rmSync(join(tempDir, '.cache'), { recursive: true, force: true })

  writeFileSync(join(tempDir, 'content', 'experience.md'), `---\nentries:\n  - organization: Clevyr, Inc.\n    role: Senior Software Developer\n    location: Remote\n    period: June 2023 - Present\n    summary: []\n    projects:\n      - title: Clevyr PCI title\n        summary: Existing summary\n        problem: Existing problem\n        contribution: Existing contribution\n        impact: Existing impact\n        links: []\n    slug: clevyr\n    toolkit:\n      - Existing Tool\n---\n`)

  writeFileSync(join(tempDir, 'content', 'hero.md'), `---\nname: Test\nrole: Developer\nsubheadline: Old summary text.\n---\n`)

  writeFileSync(join(tempDir, 'public', 'resume.pdf'), resumeText)
})

afterAll(() => {
  cwdSpy.mockRestore()
  rmSync(tempDir, { recursive: true, force: true })

  if (originalApiKey) {
    process.env.OPENAI_API_KEY = originalApiKey
    process.env.OPEN_API_KEY = originalApiKey
  } else {
    delete process.env.OPENAI_API_KEY
    delete process.env.OPEN_API_KEY
  }
})

describe('resume sync helpers', () => {
  it('categorizes summary lines using keyword heuristics', () => {
    expect(categorizeSummaryLine('Cut incident noise by 30% across services.')).toBe('impact')
    expect(categorizeSummaryLine('Legacy workflows created bottlenecks.')).toBe('problem')
    expect(categorizeSummaryLine('Implemented shared tooling for the team.')).toBe('contribution')
  })

  it('builds PCI-style projects from summary lines', () => {
    const entry = {
      organization: 'Example Co',
      role: 'Engineer',
      summary: [
        'Legacy integrations were fragile and failed nightly.',
        'Implemented observability and on-call rotations for the squad.',
        'Reduced failed syncs by 80% within six weeks.'
      ]
    }

    const [project] = buildProjectsForEntry(entry)
    expect(project.title).toBe('Example Co – Engineer')
    expect(project.problem).toMatch(/Legacy integrations were fragile/)
    expect(project.contribution).toMatch(/Implemented observability/)
    expect(project.impact).toMatch(/Reduced failed syncs/)
  })

  it('extracts the resume summary section', () => {
    const lines = resumeText.split(/\r?\n/).map((line) => line.trim())
    expect(extractResumeSummary(lines)).toContain('Senior software developer focused on stability')
  })

  it('updates experience content and hero summary from the resume with heuristic PCI fallback', async () => {
    delete process.env.OPENAI_API_KEY

    await updateExperienceFromResume(join(tempDir, 'public', 'resume.pdf'))

    const experienceRaw = readFileSync(join(tempDir, 'content', 'experience.md'), 'utf8')
    const experienceMatch = experienceRaw.match(/^---\n([\s\S]*?)\n---/)
    expect(experienceMatch).toBeTruthy()

    const experienceData = YAML.parse(experienceMatch[1])
    expect(experienceData.entries).toHaveLength(2)

    const clevyr = experienceData.entries.find((entry) => entry.organization === 'Clevyr, Inc.' && entry.role === 'Senior Software Developer')
    expect(clevyr).toBeTruthy()
    expect(clevyr.summary).toContain('Stabilized critical Laravel/Vue platform supporting core client workflows.')
    expect(clevyr.toolkit).toEqual(['Existing Tool'])
    expect(clevyr.projects).toHaveLength(1)
    expect(clevyr.projects[0]).toEqual({
      title: 'Clevyr PCI title',
      summary: 'Existing summary',
      problem: 'Existing problem',
      contribution: 'Existing contribution',
      impact: 'Existing impact',
      links: []
    })

    const heroRaw = readFileSync(join(tempDir, 'content', 'hero.md'), 'utf8')
    const heroMatch = heroRaw.match(/^---\n([\s\S]*?)\n---/)
    expect(heroMatch).toBeTruthy()
    const heroData = YAML.parse(heroMatch[1])
    expect(heroData.subheadline).toContain('Senior software developer focused on stability')
  })

  it('preserves existing PCI projects when resume sync runs', async () => {
    await updateExperienceFromResume(join(tempDir, 'public', 'resume.pdf'))

    const experienceRaw = readFileSync(join(tempDir, 'content', 'experience.md'), 'utf8')
    const experienceMatch = experienceRaw.match(/^---\n([\s\S]*?)\n---/)
    const experienceData = YAML.parse(experienceMatch[1])
    const clevyr = experienceData.entries.find((entry) => entry.organization === 'Clevyr, Inc.' && entry.role === 'Senior Software Developer')
    expect(clevyr.projects).toEqual([
      {
        title: 'Clevyr PCI title',
        summary: 'Existing summary',
        problem: 'Existing problem',
        contribution: 'Existing contribution',
        impact: 'Existing impact',
        links: []
      }
    ])
  })
})
