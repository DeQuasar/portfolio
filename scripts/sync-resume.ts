#!/usr/bin/env node
import 'dotenv/config'
import { constants, existsSync } from 'node:fs'
import { access, copyFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { resolve as resolvePath } from 'node:path'

import { updateExperienceFromResume } from './update-experience-from-resume'

const DESTINATION_PATH = resolvePath(process.cwd(), 'public/resume.pdf')
const HOME_DIRECTORY = homedir()

const log = (...args: unknown[]) => console.log('[sync-resume]', ...args)
const warn = (...args: unknown[]) => console.warn('[sync-resume]', ...args)

const expandHome = (value: string) => (value.startsWith('~') ? value.replace(/^~/u, HOME_DIRECTORY) : value)

const buildCandidate = (base: string | undefined | null, ...segments: string[]): string | null => {
  if (!base?.trim()) {
    return null
  }
  const expandedBase = expandHome(base.trim())
  return resolvePath(expandedBase, ...segments.map((segment) => segment.trim()))
}

const sourceCandidates = [
  buildCandidate(process.env.RESUME_SOURCE_PATH ?? null),
  buildCandidate(process.env.RESUME_SOURCE_DIR ?? null, 'anthony_protano_resume.pdf'),
  buildCandidate(process.env.RESUME_SOURCE_DIR ?? null, 'resume.pdf'),
  buildCandidate('/mnt/c/Users/tonyp/OneDrive/Desktop/Resumes', 'anthony_protano_resume.pdf'),
  buildCandidate('~/Desktop/Resumes', 'anthony_protano_resume.pdf'),
  buildCandidate('~/Desktop', 'anthony_protano_resume.pdf'),
  buildCandidate(process.cwd(), 'docs/resume', 'anthony_protano_resume.pdf'),
  buildCandidate(process.cwd(), 'docs/resume', 'resume.pdf')
].filter((candidate): candidate is string => Boolean(candidate))

const uniqueCandidates = Array.from(new Set(sourceCandidates))

const describeCandidates = () => (uniqueCandidates.length ? uniqueCandidates.join(', ') : 'none')

const findReadableSource = async (): Promise<string | null> => {
  for (const candidate of uniqueCandidates) {
    try {
      await access(candidate, constants.R_OK)
      return candidate
    } catch {
      // Continue searching other candidates
    }
  }
  return null
}

const run = async () => {
  const source = await findReadableSource()

  if (!source) {
    warn(`Source résumé not found or unreadable. Checked paths: ${describeCandidates()}. Using existing artifact.`)
  } else {
    try {
      await copyFile(source, DESTINATION_PATH)
      log(`Copied résumé from ${source} -> ${DESTINATION_PATH}`)
    } catch (error) {
      warn(`Failed to copy résumé from ${source}`, error)
    }
  }

  const resumePath = existsSync(DESTINATION_PATH)
    ? DESTINATION_PATH
    : (source && existsSync(source) ? source : null)

  if (!resumePath) {
    warn('Skipping experience update; no résumé file found to parse.')
    return
  }

  try {
    await updateExperienceFromResume(resumePath)
    log(`Synced experience content from résumé at ${resumePath}`)
  } catch (error) {
    warn('Failed to update experience content from résumé.', error)
  }
}

run()
