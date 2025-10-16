import { constants, createReadStream } from 'node:fs'
import { access, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createError, defineEventHandler, getMethod, sendStream, setHeader, setResponseStatus } from 'h3'

const DEFAULT_FILENAME = 'Anthony-Protano-Resume.pdf'
const CACHE_CONTROL = 'public, max-age=3600, s-maxage=3600'
const CONTENT_TYPE = 'application/pdf'

const RESUME_CANDIDATE_PATHS = [
  '/mnt/c/Users/tonyp/OneDrive/Desktop/Resumes/anthony_protano_resume.pdf',
  resolve(process.cwd(), 'public/resume.pdf')
]

const findReadableResumePath = async (): Promise<string | null> => {
  for (const candidate of RESUME_CANDIDATE_PATHS) {
    try {
      await access(candidate, constants.R_OK)
      return candidate
    } catch {
      continue
    }
  }
  return null
}

export default defineEventHandler(async (event) => {
  const resumePath = await findReadableResumePath()

  if (!resumePath) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Résumé unavailable'
    })
  }

  const fileStats = await stat(resumePath)

  setHeader(event, 'Content-Type', CONTENT_TYPE)
  setHeader(event, 'Content-Disposition', `inline; filename="${DEFAULT_FILENAME}"`)
  setHeader(event, 'Cache-Control', CACHE_CONTROL)
  setHeader(event, 'Content-Length', String(fileStats.size))

  if (getMethod(event) === 'HEAD') {
    setResponseStatus(event, 200)
    return ''
  }

  return sendStream(event, createReadStream(resumePath))
})
