import { describe, expect, it } from 'vitest'
import { __resumeDownloadInternals, RESUME_DEFAULT_FILENAME } from '../../composables/useResumeDownload'

const { parseFilenameFromHeader, resolveFilename, toAbsoluteUrl } = __resumeDownloadInternals

describe('useResumeDownload internals', () => {
  describe('parseFilenameFromHeader', () => {
    it('extracts RFC 5987 encoded filenames', () => {
      const header = "attachment; filename*=UTF-8''Anthony%20Protano%20Resume.pdf"
      expect(parseFilenameFromHeader(header)).toBe('Anthony Protano Resume.pdf')
    })

    it('falls back to quoted filename parameter', () => {
      const header = 'attachment; filename="resume.pdf"'
      expect(parseFilenameFromHeader(header)).toBe('resume.pdf')
    })

    it('returns null when header is missing', () => {
      expect(parseFilenameFromHeader(undefined)).toBeNull()
    })
  })

  describe('resolveFilename', () => {
    it('prefers filename from response header', () => {
      const response = new Response('test', {
        headers: {
          'Content-Disposition': 'attachment; filename="remote.pdf"'
        }
      })
      const filename = resolveFilename({ href: '/download/resume', suggestedFilename: RESUME_DEFAULT_FILENAME }, response)
      expect(filename).toBe('remote.pdf')
    })

    it('falls back to suggested filename when header missing', () => {
      const response = new Response('test')
      const filename = resolveFilename({ href: '/download/resume', suggestedFilename: RESUME_DEFAULT_FILENAME }, response)
      expect(filename).toBe(RESUME_DEFAULT_FILENAME)
    })

    it('derives filename from URL when header and suggested are missing', () => {
      const response = new Response('test', { headers: { 'Content-Type': 'application/pdf' } })
      Object.defineProperty(response, 'url', { value: 'https://example.com/assets/resume.pdf' })
      const filename = resolveFilename({ href: '/resume.pdf' }, response)
      expect(filename).toBe('resume.pdf')
    })
  })

  describe('toAbsoluteUrl', () => {
    it('returns absolute URL when window is unavailable', () => {
      expect(toAbsoluteUrl('/download/resume')).toBe('/download/resume')
    })

    it('resolves relative paths against window origin when available', () => {
      const originalWindow = globalThis.window
      // @ts-expect-error intentionally stub window in test
      globalThis.window = {
        location: {
          origin: 'https://portfolio.example.com'
        }
      }

      expect(toAbsoluteUrl('/download/resume')).toBe('https://portfolio.example.com/download/resume')

      if (typeof originalWindow === 'undefined') {
        // @ts-expect-error cleanup stubbed window
        delete (globalThis as any).window
      } else {
        globalThis.window = originalWindow
      }
    })
  })
})
