import { computed, ref, type Ref } from 'vue'

type ThemePreference = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'theme-preference'

const preferenceRef = ref<ThemePreference>('system')
const resolvedRef = ref<ResolvedTheme>('light')

let mediaQuery: MediaQueryList | null = null
let isInitialized = false
let removeListener: (() => void) | null = null

const prefersDark = (): boolean => {
  if (!process.client) {
    return false
  }
  if (!mediaQuery) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  }
  return mediaQuery.matches
}

const readDatasetTheme = () => {
  if (!process.client) {
    return { preference: null as ThemePreference | null, resolved: null as ResolvedTheme | null }
  }

  try {
    const root = document.documentElement
    const datasetPreference = root.dataset.themePreference
    const datasetResolved = root.dataset.themeResolved ?? root.dataset.theme

    return {
      preference:
        datasetPreference === 'light' || datasetPreference === 'dark' || datasetPreference === 'system'
          ? datasetPreference
          : null,
      resolved: datasetResolved === 'light' || datasetResolved === 'dark' ? datasetResolved : null
    }
  } catch {
    return { preference: null, resolved: null }
  }
}

const applyResolvedTheme = (mode: ResolvedTheme) => {
  resolvedRef.value = mode
  if (!process.client) {
    return
  }

  const root = document.documentElement
  root.dataset.theme = mode
  root.dataset.themePreference = preferenceRef.value
  root.dataset.themeResolved = mode
  root.style.colorScheme = mode
}

const getSystemTheme = (): ResolvedTheme => (prefersDark() ? 'dark' : 'light')

const applyPreference = (preference: ThemePreference, options: { persist?: boolean } = {}) => {
  const { persist = true } = options
  preferenceRef.value = preference

  if (process.client && persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      // ignore storage errors (private mode, etc.)
    }
  }

  const resolved = preference === 'system' ? getSystemTheme() : preference
  applyResolvedTheme(resolved)
}

const setupMediaListener = () => {
  if (!process.client || !mediaQuery) {
    return
  }

  const handleChange = (event: MediaQueryListEvent) => {
    if (preferenceRef.value === 'system') {
      applyResolvedTheme(event.matches ? 'dark' : 'light')
    }
  }

  mediaQuery.addEventListener('change', handleChange)
  removeListener = () => mediaQuery?.removeEventListener('change', handleChange)
}

const initTheme = () => {
  if (isInitialized || !process.client) {
    return
  }

  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const datasetValues = readDatasetTheme()
  if (datasetValues.preference) {
    preferenceRef.value = datasetValues.preference
  }
  if (datasetValues.resolved) {
    resolvedRef.value = datasetValues.resolved
  }

  let stored: string | null = null
  try {
    stored = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    stored = null
  }

  let initialPreference: ThemePreference = datasetValues.preference ?? 'system'
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    initialPreference = stored
  }

  applyPreference(initialPreference, { persist: false })
  setupMediaListener()

  isInitialized = true
}

export const themePreference = preferenceRef as Readonly<Ref<ThemePreference>>
export const resolvedTheme = resolvedRef as Readonly<Ref<ResolvedTheme>>

export const useTheme = () => {
  if (!isInitialized && process.client) {
    initTheme()
  }

  const cycleOrder: ThemePreference[] = ['light', 'system', 'dark']

  const setPreference = (preference: ThemePreference) => {
    initTheme()
    applyPreference(preference)
  }

  const computeNextPreference = (current: ThemePreference): ThemePreference => {
    if (current === 'system') {
      return resolvedRef.value === 'dark' ? 'light' : 'dark'
    }
    const currentIndex = cycleOrder.indexOf(current)
    return cycleOrder[(currentIndex + 1) % cycleOrder.length]
  }

  const cyclePreference = () => {
    const next = computeNextPreference(preferenceRef.value)
    setPreference(next)
  }

  const nextPreference = computed(() => computeNextPreference(preferenceRef.value))

  return {
    preference: preferenceRef,
    resolved: resolvedRef,
    setPreference,
    cyclePreference,
    nextPreference
  }
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    removeListener?.()
    removeListener = null
    isInitialized = false
    mediaQuery = null
    preferenceRef.value = 'system'
    resolvedRef.value = 'light'
  })
}

export type { ThemePreference, ResolvedTheme }

export const __resetThemeState = () => {
  removeListener?.()
  removeListener = null
  isInitialized = false
  mediaQuery = null
  preferenceRef.value = 'system'
  resolvedRef.value = 'light'
}
