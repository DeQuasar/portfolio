import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

const rootDir = dirname(fileURLToPath(new URL('./vitest.config.ts', import.meta.url)))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': rootDir,
      '@': rootDir,
      '#imports': resolve(rootDir, 'tests/stubs/nuxt-imports')
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 20000,
    hookTimeout: 180000,
    include: ['tests/**/*.{test,spec}.ts'],
    exclude: ['tests/e2e/**', 'tests/**/*.ui.spec.ts'],
    setupFiles: ['tests/setup/vitest.setup.ts'],
    reporters: process.env.CI
      ? ['default', ['junit', { outputFile: 'reports/vitest/results.xml' }]]
      : 'default',
    coverage: {
      provider: 'v8',
      reportsDirectory: 'reports/coverage',
      reporter: process.env.CI ? ['text-summary', 'lcov'] : ['text', 'html'],
      include: [
        'composables/**/*.ts',
        'functions/**/*.ts',
        'plugins/**/*.ts'
      ],
      thresholds: {
        statements: 20,
        branches: 50,
        functions: 50,
        lines: 20
      }
    }
  }
})
