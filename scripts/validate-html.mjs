#!/usr/bin/env node
import { access, readFile, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'

const projectRoot = process.cwd()
const publicDir = process.env.NUXT_HTML_VALIDATE_DIR ?? '.output/public'
const htmlPattern = process.env.NUXT_HTML_VALIDATE_PATTERN ?? path.posix.join(publicDir, '**/*.html')
const skipGenerate = process.env.SKIP_GENERATE === '1'
const skipPrune = process.env.SKIP_PRUNE === '1'

const run = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      ...options
    })
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve()
      } else {
        const reason = signal ? `signal ${signal}` : `exit code ${code}`
        reject(new Error(`Command "${command} ${args.join(' ')}" failed with ${reason}`))
      }
    })
  })

const ensurePublicDir = async () => {
  try {
    await access(path.join(projectRoot, publicDir))
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(
        `Static output directory "${publicDir}" not found. Run "pnpm generate" or unset SKIP_GENERATE.`
      )
    }
    throw error
  }
}

const patchFallbackDocument = async (filename) => {
  const fullPath = path.join(projectRoot, publicDir, filename)
  try {
    let html = await readFile(fullPath, 'utf8')
    let updated = false

    if (!/<html[^>]*\blang=/i.test(html)) {
      html = html.replace('<html', '<html lang="en"')
      updated = true
    }

    if (!/<head[^>]*>[^]*?<title>[^]*?<\/title>/i.test(html)) {
      html = html.replace(
        '<head>',
        '<head><title>Anthony Protano | Senior Software Developer</title>'
      )
      updated = true
    }

    if (updated) {
      await writeFile(fullPath, html)
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }
}

const main = async () => {
  if (!skipGenerate) {
    await run('pnpm', ['generate'])
  }

  await ensurePublicDir()

  await Promise.all(['200.html', '404.html'].map((file) => patchFallbackDocument(file)))

  await run('pnpm', ['exec', 'html-validate', htmlPattern, '--max-warnings=0'])

  if (!skipPrune) {
    await run('pnpm', ['run', 'prune:artifacts'])
  }
}

main().catch((error) => {
  console.error('[validate-html]', error.message)
  process.exit(1)
})
