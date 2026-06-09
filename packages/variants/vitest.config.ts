import { defineConfig } from 'vitest/config'

// Pure string-resolver tests — no DOM needed, default `node` environment.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**'],
      exclude: ['src/**/*.test.ts'],
    },
  },
})
