const shouldIgnoreContentError = (reason: unknown) => {
  if (!(reason instanceof Error)) {
    return false
  }
  if (/_content_info/.test(reason.message)) {
    return true
  }
  if ('code' in reason && (reason as { code?: unknown }).code === 'SQLITE_READONLY') {
    return true
  }
  if (/attempt to write a readonly database/i.test(reason.message)) {
    return true
  }
  return false
}

process.on('unhandledRejection', (reason) => {
  if (shouldIgnoreContentError(reason)) {
    return
  }

  throw reason
})

process.on('uncaughtException', (error) => {
  if (shouldIgnoreContentError(error)) {
    return
  }

  throw error
})
