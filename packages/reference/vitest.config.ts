import { playwright } from '@vitest/browser-playwright'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

import { pointerDown, pointerMove, pointerUp } from './vitest.browser.commands'

// Two projects, one run (`vitest run` executes both):
// - `unit` (jsdom): logic, wiring, static ARIA — fast, the bulk of the suite.
// - `browser` (Chromium via Playwright): only `*.browser.test.tsx`, for what jsdom cannot do —
//   native range keyboard, real `<dialog>`, layout and geometry, pointer capture, `:has()`, RTL.
export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.browser.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        // Pre-bundled up front: discovered mid-run, a dependency makes Vite re-optimize and reload,
        // and the reloaded copy runs against a second React (`Cannot read properties of null`).
        optimizeDeps: { include: ['@tanstack/react-table'] },
        test: {
          name: 'browser',
          include: ['src/**/*.browser.test.{ts,tsx}'],
          setupFiles: ['./vitest.browser.setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            // Motion off, through the skin's OWN `prefers-reduced-motion` branches rather than a
            // test-only stylesheet: no test waits on a slide or a fade, geometry is read at rest,
            // and a component that forgets its reduced-motion rule shows up here first.
            provider: playwright({ contextOptions: { reducedMotion: 'reduce' } }),
            instances: [{ browser: 'chromium' }],
            commands: { pointerDown, pointerMove, pointerUp },
          },
        },
      },
    ],
  },
})
