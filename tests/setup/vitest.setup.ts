process.on('unhandledRejection', (reason) => {
  if (reason instanceof Error && /_content_info/.test(reason.message)) {
    return
  }

  throw reason
})
