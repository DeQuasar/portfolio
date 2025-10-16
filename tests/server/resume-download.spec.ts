import { describe, expect, it, vi } from 'vitest'
import { onRequest } from '../../functions/download/resume'

describe('Cloudflare Pages resume download function', () => {
  it('returns the proxied PDF with streaming headers', async () => {
    const request = new Request('https://portfolio.example.com/download/resume')
    const assetResponse = new Response('PDF_BYTES', {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        etag: 'W/"resume-v1"'
      }
    })

    const env = {
      ASSETS: {
        fetch: vi.fn().mockResolvedValue(assetResponse)
      }
    } as unknown as EnvWithAssets

    const result = await onRequest({ request, env } as unknown as PagesEventContext)

    expect(env.ASSETS.fetch).toHaveBeenCalledWith(new URL('/resume.pdf', request.url))
    expect(result.status).toBe(200)
    expect(result.headers.get('content-type')).toBe('application/pdf')
    expect(result.headers.get('content-disposition')).toContain('inline')
    expect(result.headers.get('content-disposition')).toContain('Anthony-Protano-Resume.pdf')
    expect(result.headers.get('cache-control')).toBe('public, max-age=3600, s-maxage=3600')
  })

  it('bubbles 404s when the asset is missing', async () => {
    const request = new Request('https://portfolio.example.com/download/resume')
    const env = {
      ASSETS: {
        fetch: vi.fn().mockResolvedValue(new Response('Not found', { status: 404 }))
      }
    } as unknown as EnvWithAssets

    const result = await onRequest({ request, env } as unknown as PagesEventContext)

    expect(result.status).toBe(404)
  })
})

type EnvWithAssets = {
  ASSETS: {
    fetch: (url: URL) => Promise<Response>
  }
}

type PagesEventContext = {
  request: Request
  env: EnvWithAssets
}
