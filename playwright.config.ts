import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? '') || 4173
const HOST = process.env.PLAYWRIGHT_HOST && process.env.PLAYWRIGHT_HOST.trim() ? process.env.PLAYWRIGHT_HOST : '127.0.0.1'
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://${HOST}:${PORT}`
const previewCommand = `node ./scripts/local-preview.mjs --dir ./.output/public --host ${HOST} --port ${PORT}`

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  reporter: process.env.CI
    ? [['line'], ['html', { outputFolder: 'reports/playwright', open: 'never' }]]
    : [['list']],
  webServer: {
    command: previewCommand,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: {
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7']
      }
    },
    {
      name: 'desktop-firefox',
      use: {
        ...devices['Desktop Firefox']
      }
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13']
      }
    }
  ]
})
