import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { useTheme, __resetThemeState } from '~/composables/useTheme'

describe('useTheme', () => {
  let mediaMatches = false
  let mediaChangeListener: ((event: MediaQueryListEvent) => void) | null = null

  beforeEach(() => {
    __resetThemeState()
    mediaMatches = false
    mediaChangeListener = null

    vi.stubGlobal(
      'matchMedia',
      ((query: string) => {
        void query
        return {
          media: '(prefers-color-scheme: dark)',
          addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
            mediaChangeListener = listener
          },
          removeEventListener: () => {
            mediaChangeListener = null
          },
          get matches() {
            return mediaMatches
          }
        } as unknown as MediaQueryList
      }) satisfies typeof window.matchMedia
    )

    ;(process as unknown as { client?: boolean }).client = true
    window.localStorage.clear()
    document.documentElement.dataset.theme = ''
    document.documentElement.dataset.themePreference = ''
    document.documentElement.dataset.themeResolved = ''
    document.documentElement.style.colorScheme = ''
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    __resetThemeState()
  })

  it('defaults to system preference and resolves using the media query', () => {
    mediaMatches = false
    const theme = useTheme()
    expect(theme.preference.value).toBe('system')
    expect(theme.resolved.value).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.documentElement.dataset.themePreference).toBe('system')
  })

  it('applies stored preference from localStorage', () => {
    window.localStorage.setItem('theme-preference', 'dark')
    const theme = useTheme()
    expect(theme.preference.value).toBe('dark')
    expect(theme.resolved.value).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('persists manual theme changes and updates the DOM dataset', () => {
    const theme = useTheme()
    theme.setPreference('dark')
    expect(theme.preference.value).toBe('dark')
    expect(theme.resolved.value).toBe('dark')
    expect(window.localStorage.getItem('theme-preference')).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('responds to system changes when preference is system', () => {
    mediaMatches = true
    const theme = useTheme()
    theme.setPreference('system')
    expect(theme.resolved.value).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')

    mediaMatches = false
    mediaChangeListener?.({ matches: false } as MediaQueryListEvent)
    expect(theme.resolved.value).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
