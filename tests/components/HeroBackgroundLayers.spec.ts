import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import HeroBackgroundLayers from '../../components/hero/HeroBackgroundLayers.vue'

const renderComponent = async (props: Record<string, unknown>) => {
  const app = createSSRApp(HeroBackgroundLayers, props)
  return renderToString(app)
}

describe('HeroBackgroundLayers', () => {
  it('renders texture and noise layers with provided inline styles', async () => {
    const markup = await renderComponent({
      textureStyle: {
        backgroundImage: 'linear-gradient(#fff,#000)',
        backgroundSize: '100% 100%'
      },
      noiseStyle: {
        backgroundImage: 'url("data:image/svg+xml;base64,noise")'
      }
    })

    expect(markup).toMatch(/<span[^>]+style="[^"]*background-image:linear-gradient\(#fff,#000\)/)
    expect(markup).toContain('background-image:url(&quot;data:image/svg+xml;base64,noise&quot;)')
  })

  it('renders all decorative background spans and keeps them hidden from assistive tech', async () => {
    const markup = await renderComponent({
      textureStyle: {},
      noiseStyle: {}
    })

    const spanCount = (markup.match(/<span/g) || []).length
    expect(spanCount).toBe(10)
    expect(markup).toContain('aria-hidden="true"')
    expect(markup).toContain('rgba(24, 41, 31, 0.96)')
  })
})
