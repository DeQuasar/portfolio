import { TextDecoder, TextEncoder } from 'node:util'
import { defineConfig } from 'vitest/config'
import baseConfig from './vitest.config'

if (!(globalThis.TextEncoder && new globalThis.TextEncoder().encode('') instanceof Uint8Array)) {
  globalThis.TextEncoder = TextEncoder
}

if (!(globalThis.TextDecoder && new globalThis.TextDecoder().decode(new Uint8Array()) === '')) {
  globalThis.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder
}

const { test: baseTest = {}, ...rest } = baseConfig

export default defineConfig({
  ...rest,
  test: {
    ...baseTest,
    environment: 'node',
    include: ['tests/**/*.ui.spec.ts'],
    exclude: [],
    hookTimeout: baseTest?.hookTimeout ?? 180000,
    testTimeout: Math.max(baseTest?.testTimeout ?? 20000, 90000),
    teardownTimeout: Math.max(baseTest?.teardownTimeout ?? 10000, 60000),
    pool: 'forks',
    maxThreads: 1,
    minThreads: 1,
    bail: 1
  }
})
