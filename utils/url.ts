export function isExternalUrl(href: string | null | undefined): boolean {
  if (!href) {
    return false
  }

  const trimmed = href.trim().toLowerCase()
  if (!trimmed) {
    return false
  }

  return trimmed.startsWith('http://') || trimmed.startsWith('https://')
}
