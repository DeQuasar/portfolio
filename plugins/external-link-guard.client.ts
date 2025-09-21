export const setupExternalLinkGuard = (nuxtApp: { hooks: { hook: (name: string, cb: () => void) => void } }) => {
  if (typeof window === 'undefined') {
    return
  }

  const isExternalUrl = (href: string) => {
    try {
      const url = new URL(href, window.location.href)
      return url.origin !== window.location.origin && ['http:', 'https:'].includes(url.protocol)
    } catch (error) {
      return false
    }
  }

  const handleClick = (event: MouseEvent) => {
    if (event.defaultPrevented) {
      return
    }

    if (event.button !== 0) {
      return
    }

    const target = event.target as HTMLElement | null
    const anchor = target?.closest('a') as HTMLAnchorElement | null

    if (!anchor) {
      return
    }

    const hrefAttr = anchor.getAttribute('href') || ''

    if (!hrefAttr || hrefAttr.startsWith('#') || hrefAttr.startsWith('mailto:') || hrefAttr.startsWith('tel:')) {
      return
    }

    if (anchor.dataset.externalGuard === 'skip') {
      return
    }

    if (!isExternalUrl(anchor.href)) {
      return
    }

    event.preventDefault()

    const newWindow = window.open(anchor.href, '_blank', 'noopener=yes')

    if (!newWindow) {
      window.location.href = anchor.href
    }
  }

  const listenerOptions: AddEventListenerOptions = { capture: true }

  document.addEventListener('click', handleClick, listenerOptions)

  nuxtApp.hooks.hook('app:unmounted', () => {
    document.removeEventListener('click', handleClick, listenerOptions)
  })
}

export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) {
    return
  }

  setupExternalLinkGuard(nuxtApp)
})
