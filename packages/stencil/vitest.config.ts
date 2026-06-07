import { defineConfig } from 'vitest/config'

// Minimal config — its only job for now is to STOP Vitest from resolving upward to the root
// `vitest.config.ts` (whose `projects: ['packages/*']` would otherwise run the whole monorepo when
// `vitest run` is invoked from this package via `lerna run test`).
//
// At step 6 (first `ui-badge` spec) this is replaced by the full `@stencil/vitest` setup:
//   import { defineVitestConfig } from '@stencil/vitest/config'
//   export default defineVitestConfig({ stencilConfig: './stencil.config.ts', test: { ... } })
// with `environment: 'stencil'` and a setup file loading the built components.
export default defineConfig({
  test: {
    include: ['src/**/*.spec.{ts,tsx}'],
  },
})
