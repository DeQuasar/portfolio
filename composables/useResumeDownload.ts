import { computed, type Ref } from 'vue'

const RESUME_RESET_DELAY = 2200
export const RESUME_DEFAULT_FILENAME = 'Anthony-Protano-Resume.pdf'

export type ResumeDownloadStatus = 'idle' | 'downloading' | 'success' | 'error'

interface ResumeDownloadState {
  status: ResumeDownloadStatus
  progress: number
  errorMessage: string | null
}

interface ResumeDownloadOptions {
  href: string
  suggestedFilename?: string
}

const parseFilenameFromHeader = (header: string | null | undefined): string | null => {
  if (!header) {
    return null
  }

  const filenameStarMatch = header.match(/filename\*=(?:UTF-8''|)([^;]+)/i)
  if (filenameStarMatch?.[1]) {
    try {
      return decodeURIComponent(filenameStarMatch[1].trim().replace(/^"|"$/g, ''))
    } catch (error) {
      console.warn('Failed to decode RFC 5987 filename', error)
    }
  }

  const filenameMatch = header.match(/filename="?([^";]+)"?/i)
  if (filenameMatch?.[1]) {
    return filenameMatch[1].trim()
  }

  return null
}

const resolveFilename = (options: ResumeDownloadOptions, response: Response): string => {
  const fromHeader = parseFilenameFromHeader(response.headers.get('Content-Disposition'))
  if (fromHeader) {
    return fromHeader
  }

  if (options.suggestedFilename) {
    return options.suggestedFilename
  }

  try {
    const url = new URL(
      options.href,
      response.url || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    )
    const pathname = url.pathname.split('/').filter(Boolean)
    const lastSegment = pathname[pathname.length - 1]
    if (lastSegment) {
      return decodeURIComponent(lastSegment)
    }
  } catch (error) {
    console.warn('Failed to derive filename from URL', error)
  }

  return 'download.pdf'
}

const toAbsoluteUrl = (href: string): string => {
  if (typeof window === 'undefined') {
    return href
  }

  try {
    return new URL(href, window.location.origin).toString()
  } catch (error) {
    console.warn('Failed to build absolute URL for download', error)
    return href
  }
}

const triggerBrowserDownload = (blob: Blob, filename: string, previousObjectUrl: Ref<string | null>): void => {
  if (typeof window === 'undefined') {
    return
  }

  if (previousObjectUrl.value) {
    URL.revokeObjectURL(previousObjectUrl.value)
    previousObjectUrl.value = null
  }

  const blobUrl = URL.createObjectURL(blob)
  previousObjectUrl.value = blobUrl

  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  link.rel = 'noopener'
  link.style.setProperty('display', 'none')
  document.body.appendChild(link)
  link.click()
  requestAnimationFrame(() => {
    document.body.removeChild(link)
  })

  window.setTimeout(() => {
    if (previousObjectUrl.value === blobUrl) {
      URL.revokeObjectURL(blobUrl)
      previousObjectUrl.value = null
    }
  }, RESUME_RESET_DELAY * 2)
}

export const useResumeDownload = () => {
  const state = useState<ResumeDownloadState>('resume-download-state', () => ({
    status: 'idle',
    progress: 0,
    errorMessage: null
  }))
  const resetTimer = useState<number | null>('resume-download-reset-timer', () => null)
  const previousObjectUrl = useState<string | null>('resume-download-object-url', () => null)
  const inFlightController = useState<AbortController | null>('resume-download-controller', () => null)

  const clearResetTimer = () => {
    if (typeof window === 'undefined') {
      return
    }
    if (resetTimer.value !== null) {
      window.clearTimeout(resetTimer.value)
      resetTimer.value = null
    }
  }

  const scheduleReset = () => {
    if (typeof window === 'undefined') {
      return
    }
    clearResetTimer()
    resetTimer.value = window.setTimeout(() => {
      state.value.status = 'idle'
      state.value.progress = 0
      state.value.errorMessage = null
      resetTimer.value = null
    }, RESUME_RESET_DELAY)
  }

  const setError = (message: string) => {
    state.value.status = 'error'
    state.value.errorMessage = message
    state.value.progress = 0
    scheduleReset()
  }

  const download = async (options: ResumeDownloadOptions) => {
    if (!process.client) {
      return
    }
    if (!options.href) {
      setError('Missing download URL')
      return
    }

    if (state.value.status === 'downloading') {
      return
    }

    clearResetTimer()
    state.value.status = 'downloading'
    state.value.progress = 0
    state.value.errorMessage = null

    const controller = new AbortController()
    inFlightController.value = controller

    try {
      const response = await fetch(toAbsoluteUrl(options.href), { signal: controller.signal })
      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`)
      }

      const totalBytes = Number(response.headers.get('Content-Length') ?? '0')
      const contentType = response.headers.get('Content-Type') ?? 'application/pdf'
      const filename = resolveFilename(options, response)

      if (!response.body) {
        const blob = await response.blob()
        triggerBrowserDownload(blob, filename, previousObjectUrl)
        state.value.progress = 100
        state.value.status = 'success'
        scheduleReset()
        return
      }

      const reader = response.body.getReader()
      const chunks: Uint8Array[] = []
      let received = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }
        if (value) {
          chunks.push(value)
          received += value.length
          if (totalBytes > 0) {
            state.value.progress = Math.min(99, Math.round((received / totalBytes) * 100))
          } else {
            state.value.progress = Math.min(95, state.value.progress + Math.max(1, Math.round(value.length / 16384)))
          }
        }
      }

      const blob = new Blob(chunks, { type: contentType })
      triggerBrowserDownload(blob, filename, previousObjectUrl)
      state.value.progress = 100
      state.value.status = 'success'
      scheduleReset()
    } catch (error) {
      if (controller.signal.aborted) {
        state.value.status = 'idle'
        state.value.progress = 0
      } else {
        const message = error instanceof Error ? error.message : 'Download failed'
        setError(message)
      }
      throw error
    } finally {
      if (inFlightController.value === controller) {
        inFlightController.value = null
      }
    }
  }

  const cancel = () => {
    if (!process.client) {
      return
    }
    const controller = inFlightController.value
    if (controller) {
      controller.abort()
      inFlightController.value = null
    }
  }

  const progressPercent = computed(() => {
    if (state.value.status !== 'downloading') {
      return null
    }
    const value = Math.max(0, Math.min(100, Math.round(state.value.progress)))
    return value > 0 ? value : null
  })

  const announcement = computed(() => {
    if (state.value.status === 'downloading') {
      return progressPercent.value !== null
        ? `Downloading résumé ${progressPercent.value}% complete.`
        : 'Downloading résumé...'
    }
    if (state.value.status === 'success') {
      return 'Résumé download started in your browser.'
    }
    if (state.value.status === 'error') {
      return state.value.errorMessage
        ? `Unable to download résumé: ${state.value.errorMessage}`
        : 'Unable to download résumé. Please try again.'
    }
    return ''
  })

  return {
    status: computed(() => state.value.status),
    progress: computed(() => state.value.progress),
    errorMessage: computed(() => state.value.errorMessage),
    isDownloading: computed(() => state.value.status === 'downloading'),
    hasError: computed(() => state.value.status === 'error'),
    progressPercent,
    announcement,
    download,
    cancel
  }
}
