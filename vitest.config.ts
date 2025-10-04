import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 20000,
    hookTimeout: 180000,
    include: ['tests/**/*.{test,spec}.ts'],
    exclude: ['tests/e2e/**'],
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
