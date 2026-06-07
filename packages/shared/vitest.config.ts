import { defineConfig } from 'vitest/config'

// Default env is `node` (util tests). Files needing the DOM opt in per-file via the
// `// @vitest-environment jsdom` directive (e.g. getBlurDataUrl.test.ts).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
