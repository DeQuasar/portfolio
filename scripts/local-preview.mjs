#!/usr/bin/env node
import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat, access } from 'node:fs/promises'
import { join, resolve, extname } from 'node:path'

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.cjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf'
}

const parseArgs = (argv) => {
  const map = new Map()
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) {
      continue
    }
    const key = arg.slice(2)
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true'
    map.set(key, value)
  }
  return map
}

const args = parseArgs(process.argv.slice(2))
const root = resolve(process.cwd(), args.get('dir') ?? '.output/public')
const host = args.get('host') ?? process.env.HOST ?? '127.0.0.1'
const port = Number.parseInt(args.get('port') ?? process.env.PORT ?? '4173', 10)
const resumeFilename = 'Anthony-Protano-Resume.pdf'
const resumeCandidates = [
  resolve('/mnt/c/Users/tonyp/OneDrive/Desktop/Resumes/anthony_protano_resume.pdf'),
  join(root, 'resume.pdf')
]

const resolveResumePath = async () => {
  for (const candidate of resumeCandidates) {
    try {
      await access(candidate)
      return candidate
    } catch {
      // continue searching the next candidate
    }
  }
  return null
}

const log = (...messages) => console.log('[local-preview]', ...messages)

const ensureWithinRoot = (candidate) => {
  const resolved = resolve(candidate)
  if (!resolved.startsWith(root)) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 })
  }
  return resolved
}

const sendStream = async (request, response, filePath, headers = {}) => {
  const stats = await stat(filePath)
  const isHead = request.method === 'HEAD'
  const ext = extname(filePath).toLowerCase()
  const contentType = headers['Content-Type'] ?? MIME_TYPES[ext] ?? 'application/octet-stream'
  response.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stats.size,
    'Cache-Control': headers['Cache-Control'] ?? (ext === '.html' ? 'no-store' : 'public, max-age=300'),
    ...headers
  })
  if (isHead) {
    response.end()
    return
  }
  createReadStream(filePath).pipe(response)
}

const serveResume = async (request, response) => {
  const resumePath = await resolveResumePath()

  if (!resumePath) {
    log('Résumé asset missing in candidates', resumeCandidates)
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Résumé not found')
    return
  }

  try {
    await sendStream(request, response, resumePath, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${resumeFilename}"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    })
  } catch (error) {
    log('Failed to stream résumé', error)
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Failed to stream résumé')
  }
}

const serveStatic = async (request, response, pathname) => {
  const cleanPath = pathname.replace(/^\/+/, '')
  const candidate = cleanPath ? join(root, cleanPath) : join(root, 'index.html')
  let filePath

  try {
    filePath = ensureWithinRoot(candidate)
    const stats = await stat(filePath)
    if (stats.isDirectory()) {
      filePath = join(filePath, 'index.html')
      await stat(filePath)
    }
  } catch {
    if (!extname(pathname)) {
      filePath = join(root, 'index.html')
    } else {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Not found')
      return
    }
  }

  try {
    await sendStream(request, response, filePath)
  } catch (error) {
    log('Failed to serve static asset', { filePath, error })
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Internal server error')
  }
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? `${host}:${port}`}`)
    if (request.method && !['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Method not allowed')
      return
    }

    if (url.pathname === '/download/resume') {
      await serveResume(request, response)
      return
    }

    await serveStatic(request, response, url.pathname)
  } catch (error) {
    const status = error.statusCode ?? 500
    response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end(status === 403 ? 'Forbidden' : 'Internal server error')
    log('Unhandled error', error)
  }
})

server.on('error', (error) => {
  console.error('[local-preview] server error', error)
  process.exitCode = 1
})

const signals = ['SIGINT', 'SIGTERM']
signals.forEach((signal) => {
  process.on(signal, () => {
    log(`Received ${signal}, shutting down`)
    server.close(() => process.exit(0))
  })
})

server.listen(port, host, () => {
  log(`Serving ${root}`)
  log(`Local preview listening on http://${host}:${port}`)
})
