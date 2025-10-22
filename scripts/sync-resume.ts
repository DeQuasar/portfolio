#!/usr/bin/env node
import 'dotenv/config'
import { constants, existsSync } from 'node:fs'
import { access, copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { updateExperienceFromResume } from './update-experience-from-resume'

const DEFAULT_SOURCE = '/mnt/c/Users/tonyp/OneDrive/Desktop/Resumes/anthony_protano_resume.pdf'
const SOURCE_PATH = process.env.RESUME_SOURCE_PATH || DEFAULT_SOURCE
const DESTINATION_PATH = resolve(process.cwd(), 'public/resume.pdf')

const log = (...args: unknown[]) => console.log('[sync-resume]', ...args)
const warn = (...args: unknown[]) => console.warn('[sync-resume]', ...args)

const run = async () => {
  const source = resolve(SOURCE_PATH)
  let sourceReadable = false

  try {
    await access(source, constants.R_OK)
    sourceReadable = true
  } catch {
    warn(`Source résumé not found or unreadable at ${source}. Using existing artifact.`)
  }

  if (sourceReadable) {
    try {
      await copyFile(source, DESTINATION_PATH)
      log(`Copied résumé from ${source} -> ${DESTINATION_PATH}`)
    } catch (error) {
      warn(`Failed to copy résumé from ${source}`, error)
    }
  }

  const resumePath = existsSync(DESTINATION_PATH)
    ? DESTINATION_PATH
    : (sourceReadable ? source : null)

  if (!resumePath || !existsSync(resumePath)) {
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
