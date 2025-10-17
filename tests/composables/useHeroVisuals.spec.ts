import { describe, expect, it } from 'vitest'
import { useHeroVisuals } from '../../composables/useHeroVisuals'

const expectedTextureSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">
      <rect width="480" height="480" fill="#2F4632" />
      <g opacity="0.32">
        <circle cx="364" cy="96" r="124" fill="#4A6C4D" />
        <circle cx="86" cy="368" r="152" fill="#6A916C" />
      </g>
      <g opacity="0.18" stroke="#ECF5EF" stroke-width="34" stroke-linecap="round">
        <path d="M-48 168L196 -76" />
        <path d="M128 372L372 128" />
        <path d="M304 548L548 304" />
      </g>
    </svg>
  `

const expectedNoiseSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <filter id="n" x="0" y="0">
        <feTurbulence type="fractalNoise" baseFrequency="1.28" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="120" height="120" fill="#2F4632" opacity="0" />
      <rect width="120" height="120" filter="url(#n)" opacity="0.42" />
    </svg>
  `

const decodeSvgFromDataUrl = (dataUrl: string | undefined) => {
  if (!dataUrl) {
    throw new Error('Missing data URL')
  }
  const prefix = 'url("data:image/svg+xml,'
  const start = dataUrl.indexOf(prefix)
  if (start === -1) {
    throw new Error('Data URL not found')
  }
  const end = dataUrl.indexOf('")', start)
  if (end === -1) {
    throw new Error('Malformed data URL')
  }
  const encoded = dataUrl.slice(start + prefix.length, end)
  return decodeURIComponent(encoded)
}

describe('useHeroVisuals', () => {
  it('provides consistent backdrop and overlay styles', () => {
    const { heroBackdropStyle, heroTextureOverlayStyle, heroNoiseOverlayStyle } = useHeroVisuals()

    expect(heroBackdropStyle.value).toEqual({ backgroundColor: '#18291f' })

    const textureStyle = heroTextureOverlayStyle.value
    expect(textureStyle.backgroundSize).toBe('160% 160%, 140% 140%, 118% 118%, 820px 820px')
    expect(textureStyle.backgroundRepeat).toBe('no-repeat, no-repeat, no-repeat, no-repeat')
    expect(textureStyle.backgroundPosition).toBe('12% 120px, 80% calc(100% + 140px), center, 52% 180px')
    expect(textureStyle.backgroundImage).toContain('radial-gradient(ellipse at 18% 12%, rgba(236, 245, 239, 0.32) 0%, rgba(236, 245, 239, 0) 58%)')
    expect(textureStyle.backgroundImage).toContain('radial-gradient(ellipse at 76% 90%, rgba(106, 145, 108, 0.18) 0%, rgba(106, 145, 108, 0) 65%)')
    expect(textureStyle.backgroundImage).toContain('linear-gradient(132deg, rgba(24, 42, 30, 0.94) 0%, rgba(74, 108, 77, 0.82) 52%, rgba(236, 245, 239, 0.12) 100%)')

    const decodedTextureSvg = decodeSvgFromDataUrl(textureStyle.backgroundImage)
    expect(decodedTextureSvg).toBe(expectedTextureSvg)

    const noiseStyle = heroNoiseOverlayStyle.value
    expect(noiseStyle.backgroundSize).toBe('280px')
    expect(noiseStyle.backgroundPosition).toBe('center')

    const decodedNoiseSvg = decodeSvgFromDataUrl(noiseStyle.backgroundImage)
    expect(decodedNoiseSvg).toBe(expectedNoiseSvg)
  })
})
