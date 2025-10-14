import tailwindcss from '@tailwindcss/vite'

const enableDevtools = process.env.NUXT_DEVTOOLS === '1'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: enableDevtools },
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: true,
      port: Number(process.env.PORT ?? 3000),
      strictPort: true,
      allowedHosts: process.env.VITE_ALLOWED_HOSTS ? process.env.VITE_ALLOWED_HOSTS.split(',') : 'all',
      hmr: process.env.VITE_DISABLE_HMR === '1' ? false : {
        protocol: process.env.VITE_HMR_PROTOCOL ?? 'ws',
        host: process.env.VITE_HMR_HOST ?? 'localhost',
        port: Number(process.env.VITE_HMR_PORT ?? process.env.PORT ?? 3000),
        clientPort: Number(process.env.VITE_HMR_CLIENT_PORT ?? process.env.VITE_HMR_PORT ?? process.env.PORT ?? 3000)
      },
      watch: {
        ignored: [
          '**/reports/**',
          '**/.lighthouseci/**',
          '**/test-results/**',
          '**/coverage/**',
          '**/dist/**'
        ]
      }
    }
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
  },
  nitro: {
    prerender: {
      ignore: ['/download/resume']
    }
  }
})
