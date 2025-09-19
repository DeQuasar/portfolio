export const colors = {
  background: '#F7F9F7',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F4F1',
  textPrimary: '#333333',
  textMuted: '#5F6671',
  primaryStart: '#4A6C4D',
  primaryEnd: '#6E8B6D',
  accent: '#F9A03F',
  border: '#D7DED7'
} as const

export const typography = {
  fontDisplay: '"Lora", serif',
  fontBody: '"Source Sans Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  h1: {
    size: 'clamp(3rem, 7vw, 4.5rem)',
    weight: 700,
    lineHeight: 1.1
  },
  h2: {
    size: '2.5rem',
    weight: 700,
    lineHeight: 1.2
  },
  h3: {
    size: '1.75rem',
    weight: 600,
    lineHeight: 1.3
  },
  body: {
    size: '1.125rem',
    weight: 400,
    lineHeight: 1.6
  },
  small: {
    size: '1rem',
    weight: 400,
    lineHeight: 1.5
  },
  label: {
    size: '0.875rem',
    weight: 600,
    lineHeight: 1.4
  }
} as const

export const spacing = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1.25rem',
  lg: '2rem',
  xl: '3rem',
  xxl: '4rem'
} as const

export const radii = {
  sm: '0.5rem',
  lg: '1.5rem',
  pill: '999px'
} as const

export const elevation = {
  sm: '0 4px 6px -1px rgba(74,108,77,0.15), 0 2px 4px -2px rgba(74,108,77,0.15)',
  lg: '0 20px 25px -5px rgba(74,108,77,0.15), 0 10px 10px -5px rgba(74,108,77,0.1)'
} as const

export type ColorToken = keyof typeof colors
export type TypographyToken = keyof typeof typography
