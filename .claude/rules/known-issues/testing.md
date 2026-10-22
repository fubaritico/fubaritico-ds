---
paths:
  - "**/*.test.{ts,tsx}"
  - "**/*.spec.{ts,tsx}"
  - "**/vitest.config.ts"
  - "**/vitest.setup.ts"
  - "**/vitest.browser.*"
---
# Known issues — testing

> Slice of `.claude/known-issues.md` (the index). Loads when a test or a Vitest config is touched.

- **Vitest Browser Mode: a dependency discovered mid-run → two Reacts** (`Cannot read properties of null
  (reading 'useState')`, different `?v=` hashes). Vite re-optimises and reloads; passes on the 2nd run, breaks
  cold (CI). Add the dependency to `optimizeDeps.include` of the `browser` project
  (`packages/reference/vitest.config.ts`).
