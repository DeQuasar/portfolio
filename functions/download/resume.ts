import type { PagesFunction } from '@cloudflare/workers-types'

const RESUME_PATH = '/resume.pdf'
const DEFAULT_FILENAME = 'Anthony-Protano-Resume.pdf'
const CACHE_CONTROL = 'public, max-age=3600, s-maxage=3600'

export const onRequest: PagesFunction = async ({ request, env }) => {
  const assetUrl = new URL(RESUME_PATH, request.url)
  const assetResponse = await env.ASSETS.fetch(assetUrl)

  if (!assetResponse.ok || !assetResponse.body) {
    return new Response('Résumé unavailable', { status: 404 })
  }

  const headers = new Headers(assetResponse.headers)
  headers.set('Content-Type', 'application/pdf')
  headers.set('Content-Disposition', `inline; filename="${DEFAULT_FILENAME}"`)
  headers.set('Cache-Control', CACHE_CONTROL)

  return new Response(assetResponse.body, {
    status: 200,
    headers
  })
}
