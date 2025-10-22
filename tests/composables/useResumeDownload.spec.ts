import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, ref, type Ref } from 'vue'
import { useResumeDownload, __resumeDownloadInternals, RESUME_DEFAULT_FILENAME } from '../../composables/useResumeDownload'

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
      const originalWindow = globalThis.window
      // @ts-expect-error intentionally unset window to simulate SSR
      globalThis.window = undefined

      expect(toAbsoluteUrl('/download/resume')).toBe('/download/resume')

      if (typeof originalWindow === 'undefined') {
        // @ts-expect-error cleanup stubbed window
        delete (globalThis as any).window
      } else {
        globalThis.window = originalWindow
      }
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

describe('useResumeDownload composable', () => {
  type StateStore = Map<string | symbol, Ref<unknown>>

  let stateStore: StateStore
  let originalUseState: unknown
  let originalFetch: typeof fetch
  let fetchMock: ReturnType<typeof vi.fn>
  let originalProcessClient: boolean | undefined
  let originalCreateObjectURL: ((obj: Blob | MediaSource) => string) | undefined
  let originalRevokeObjectURL: ((url: string) => void) | undefined
  let originalRequestAnimationFrame: typeof window.requestAnimationFrame
  let harness: { api: ReturnType<typeof useResumeDownload>; destroy: () => void } | null
  let createObjectURLSpy: ReturnType<typeof vi.fn>
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>
  let originalAnchorClick: HTMLAnchorElement['click']

  const mountComposable = () => {
    let api!: ReturnType<typeof useResumeDownload>

    const root = document.createElement('div')
    document.body.appendChild(root)

    const app = createApp(defineComponent({
      name: 'ResumeDownloadHarness',
      setup() {
        api = useResumeDownload()
        return () => null
      }
    }))

    app.mount(root)

    return {
      api,
      destroy: () => {
        app.unmount()
        document.body.removeChild(root)
      }
    }
  }

  const restoreUseState = () => {
    if (typeof originalUseState === 'undefined') {
      delete (globalThis as unknown as { useState?: unknown }).useState
    } else {
      (globalThis as unknown as { useState?: unknown }).useState = originalUseState
    }
  }

  beforeEach(() => {
    vi.useFakeTimers()

    stateStore = new Map()
    originalUseState = (globalThis as unknown as { useState?: unknown }).useState
    ;(globalThis as unknown as { useState?: unknown }).useState = <T>(
      key: string | symbol,
      init?: () => T
    ) => {
      if (!stateStore.has(key)) {
        const initialValue = typeof init === 'function' ? init() : undefined
        stateStore.set(key, ref(initialValue) as Ref<unknown>)
      }
      return stateStore.get(key) as Ref<T>
    }

    originalFetch = globalThis.fetch
    fetchMock = vi.fn()
    globalThis.fetch = fetchMock as unknown as typeof fetch

    originalProcessClient = (process as unknown as { client?: boolean }).client
    ;(process as unknown as { client?: boolean }).client = true

    originalCreateObjectURL = (URL as typeof URL & { createObjectURL?: typeof URL.createObjectURL }).createObjectURL
    originalRevokeObjectURL = (URL as typeof URL & { revokeObjectURL?: typeof URL.revokeObjectURL }).revokeObjectURL
    createObjectURLSpy = vi.fn(() => 'blob:resume-url')
    revokeObjectURLSpy = vi.fn()
    ;(URL as typeof URL & {
      createObjectURL?: typeof URL.createObjectURL
      revokeObjectURL?: typeof URL.revokeObjectURL
    }).createObjectURL = createObjectURLSpy as typeof URL.createObjectURL
    ;(URL as typeof URL & {
      createObjectURL?: typeof URL.createObjectURL
      revokeObjectURL?: typeof URL.revokeObjectURL
    }).revokeObjectURL = revokeObjectURLSpy as typeof URL.revokeObjectURL

    originalRequestAnimationFrame = window.requestAnimationFrame
    window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0)
      return 1
    }) as typeof window.requestAnimationFrame

    originalAnchorClick = HTMLAnchorElement.prototype.click
    HTMLAnchorElement.prototype.click = vi.fn()

    harness = null
  })

  afterEach(() => {
    try {
      harness?.destroy()
    } catch {}
    harness = null

    vi.runOnlyPendingTimers()
    vi.useRealTimers()

    stateStore.clear()
    restoreUseState()
    globalThis.fetch = originalFetch
    ;(process as unknown as { client?: boolean }).client = originalProcessClient

    if (typeof originalCreateObjectURL === 'undefined') {
      delete (URL as typeof URL & { createObjectURL?: typeof URL.createObjectURL }).createObjectURL
    } else {
      ;(URL as typeof URL & { createObjectURL?: typeof URL.createObjectURL }).createObjectURL = originalCreateObjectURL
    }

    if (typeof originalRevokeObjectURL === 'undefined') {
      delete (URL as typeof URL & { revokeObjectURL?: typeof URL.revokeObjectURL }).revokeObjectURL
    } else {
      ;(URL as typeof URL & { revokeObjectURL?: typeof URL.revokeObjectURL }).revokeObjectURL = originalRevokeObjectURL
    }

    window.requestAnimationFrame = originalRequestAnimationFrame
    HTMLAnchorElement.prototype.click = originalAnchorClick
    vi.restoreAllMocks()
  })

  it('skips client-only logic when invoked during SSR', async () => {
    ;(process as unknown as { client?: boolean }).client = false
    harness = mountComposable()

    await harness.api.download({ href: '/download/resume.pdf' })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(harness.api.status.value).toBe('idle')
  })

  it('validates download input and schedules error reset when href is missing', async () => {
    harness = mountComposable()

    await harness.api.download({ href: '' as unknown as string })

    expect(harness.api.hasError.value).toBe(true)
    expect(harness.api.errorMessage.value).toBe('Missing download URL')
    vi.advanceTimersByTime(2199)
    expect(harness.api.status.value).toBe('error')
    vi.advanceTimersByTime(1)
    expect(harness.api.status.value).toBe('idle')
  })

  it('streams a download, updates progress, and resets after success', async () => {
    const chunkA = new TextEncoder().encode('AAAA')
    const chunkB = new TextEncoder().encode('BBBBB')
    const reader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({ done: false, value: chunkA })
        .mockResolvedValueOnce({ done: false, value: chunkB })
        .mockResolvedValueOnce({ done: true, value: undefined })
    }
    const response = {
      ok: true,
      headers: new Headers({
        'Content-Length': String(chunkA.length + chunkB.length),
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="remote.pdf"'
      }),
      url: 'https://example.com/download/resume.pdf',
      body: {
        getReader: () => reader
      },
      blob: vi.fn()
    }

    fetchMock.mockResolvedValue(response as unknown as Response)

    harness = mountComposable()
    await harness.api.download({ href: '/download/resume.pdf', suggestedFilename: 'local.pdf' })

    const expectedUrl = `${window.location.origin}/download/resume.pdf`
    expect(fetchMock).toHaveBeenCalledWith(expectedUrl, expect.objectContaining({ signal: expect.any(AbortSignal) }))
    expect(reader.read).toHaveBeenCalledTimes(3)
    expect(harness.api.status.value).toBe('success')
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1)
    expect(revokeObjectURLSpy).not.toHaveBeenCalled()

    vi.advanceTimersByTime(2199)
    expect(harness.api.status.value).toBe('success')
    vi.advanceTimersByTime(1)
    expect(harness.api.status.value).toBe('idle')

    vi.advanceTimersByTime(4400)
    expect(revokeObjectURLSpy).toHaveBeenCalled()
  })

  it('handles downloads without body streams by falling back to blob()', async () => {
    const blobSpy = vi.fn(async () => new Blob([new Uint8Array([1, 2, 3])], { type: 'application/pdf' }))
    const response = {
      ok: true,
      headers: new Headers({
        'Content-Type': 'application/pdf'
      }),
      url: 'https://example.com/assets/resume.pdf',
      body: null,
      blob: blobSpy
    }

    fetchMock.mockResolvedValue(response as unknown as Response)

    harness = mountComposable()
    await harness.api.download({ href: 'https://example.com/assets/resume.pdf' })

    expect(blobSpy).toHaveBeenCalled()
    expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob))
    expect(harness.api.status.value).toBe('success')
  })

  it('estimates progress when the response length is unknown', async () => {
    const chunk = new Uint8Array(8)
    const reader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({ done: false, value: chunk })
        .mockResolvedValueOnce({ done: true, value: undefined })
    }
    const response = {
      ok: true,
      headers: new Headers({
        'Content-Type': 'application/pdf'
      }),
      url: 'https://example.com/download/resume.pdf',
      body: {
        getReader: () => reader
      },
      blob: vi.fn()
    }

    fetchMock.mockResolvedValue(response as unknown as Response)

    harness = mountComposable()
    await harness.api.download({ href: '/download/resume.pdf' })

    expect(reader.read).toHaveBeenCalledTimes(2)
    expect(harness.api.status.value).toBe('success')
    expect(harness.api.progress.value).toBe(100)
  })

  it('surfaces HTTP errors and restores idle state after reset', async () => {
    const response = {
      ok: false,
      status: 503,
      headers: new Headers(),
      url: 'https://example.com/download/resume.pdf',
      body: null,
      blob: vi.fn()
    }
    fetchMock.mockResolvedValue(response as unknown as Response)

    harness = mountComposable()
    await expect(harness.api.download({ href: '/download/resume.pdf' })).rejects.toThrow(
      'Download failed with status 503'
    )

    expect(harness.api.hasError.value).toBe(true)
    expect(harness.api.announcement.value).toContain('Unable to download résumé')

    vi.advanceTimersByTime(2200)
    expect(harness.api.status.value).toBe('idle')
  })

  it('falls back to a generic error when fetch rejects with a non-error value', async () => {
    fetchMock.mockRejectedValue('nope')

    harness = mountComposable()
    await expect(harness.api.download({ href: '/download/resume.pdf' })).rejects.toBe('nope')

    expect(harness.api.errorMessage.value).toBe('Download failed')
    expect(harness.api.hasError.value).toBe(true)
  })

  it('ignores duplicate download requests while another is in flight', async () => {
    let resolveFetch: (() => void) | null = null

    fetchMock.mockImplementation((_url: unknown, options?: { signal?: AbortSignal }) => {
      return new Promise<Response>((resolve, reject) => {
        const timeout = setTimeout(() => {
          clearTimeout(timeout)
          resolve({
            ok: true,
            headers: new Headers({ 'Content-Type': 'application/pdf' }),
            url: 'https://example.com/resume.pdf',
            body: null,
            blob: vi.fn(async () => new Blob([new Uint8Array([1])], { type: 'application/pdf' }))
          } as unknown as Response)
        }, 50)

        resolveFetch = () => {
          clearTimeout(timeout)
          resolve({
            ok: true,
            headers: new Headers({ 'Content-Type': 'application/pdf' }),
            url: 'https://example.com/resume.pdf',
            body: null,
            blob: vi.fn(async () => new Blob([new Uint8Array([2])], { type: 'application/pdf' }))
          } as unknown as Response)
        }

        options?.signal?.addEventListener('abort', () => {
          clearTimeout(timeout)
          reject(new DOMException('Aborted', 'AbortError'))
        })
      })
    })

    harness = mountComposable()
    const first = harness.api.download({ href: '/download/resume.pdf' })
    await Promise.resolve()

    expect(harness.api.isDownloading.value).toBe(true)

    const second = harness.api.download({ href: '/download/resume.pdf' })
    await expect(second).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    resolveFetch?.()
    await first

    expect(harness.api.status.value).toBe('success')
  })

  it('aborts the active request when cancel is invoked', async () => {
    fetchMock.mockImplementation((_url: unknown, options?: { signal?: AbortSignal }) => {
      return new Promise<Response>((resolve, reject) => {
        const timeout = setTimeout(() => {
          resolve({
            ok: true,
            headers: new Headers({ 'Content-Type': 'application/pdf' }),
            url: 'https://example.com/resume.pdf',
            body: null,
            blob: vi.fn(async () => new Blob([new Uint8Array([3])], { type: 'application/pdf' }))
          } as unknown as Response)
        }, 1000)

        options?.signal?.addEventListener('abort', () => {
          clearTimeout(timeout)
          reject(new DOMException('Aborted', 'AbortError'))
        })
      })
    })

    harness = mountComposable()
    const promise = harness.api.download({ href: '/download/resume.pdf' })
    await Promise.resolve()

    harness.api.cancel()

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
    expect(harness.api.status.value).toBe('idle')
    expect(harness.api.progress.value).toBe(0)
  })
})
