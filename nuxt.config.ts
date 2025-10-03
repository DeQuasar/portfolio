import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [tailwindcss()]
  },
  runtimeConfig: {
    public: {
      tooltipProgressDuration: process.env.NUXT_PUBLIC_TOOLTIP_PROGRESS_DURATION ? Number(process.env.NUXT_PUBLIC_TOOLTIP_PROGRESS_DURATION) : 5000,
      tooltipRestDelay: process.env.NUXT_PUBLIC_TOOLTIP_REST_DELAY ? Number(process.env.NUXT_PUBLIC_TOOLTIP_REST_DELAY) : 220,
      heroTooltipTrace: process.env.NUXT_PUBLIC_HERO_TOOLTIP_TRACE === '1' || process.env.NUXT_PUBLIC_HERO_TOOLTIP_TRACE === 'true'
    }
  },
  modules: [
    '@nuxt/content'
  ],
  content: {
    highlight: false
  }
})
