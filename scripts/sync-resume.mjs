#!/usr/bin/env node
import { constants } from 'node:fs'
import { access, copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const DEFAULT_SOURCE = '/mnt/c/Users/tonyp/OneDrive/Desktop/Resumes/anthony_protano_resume.pdf'
const SOURCE_PATH = process.env.RESUME_SOURCE_PATH || DEFAULT_SOURCE
const DESTINATION_PATH = resolve(process.cwd(), 'public/resume.pdf')

const log = (...args) => console.log('[sync-resume]', ...args)
const warn = (...args) => console.warn('[sync-resume]', ...args)

async function run () {
  const source = resolve(SOURCE_PATH)
  try {
    await access(source, constants.R_OK)
  } catch {
    warn(`Source résumé not found or unreadable at ${source}. Using existing artifact.`)
    return
  }

  try {
    await copyFile(source, DESTINATION_PATH)
    log(`Copied résumé from ${source} -> ${DESTINATION_PATH}`)
  } catch (error) {
    warn(`Failed to copy résumé from ${source}`, error)
  }
}

run()
