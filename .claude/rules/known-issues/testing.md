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

- **Vitest Browser Mode : dépendance découverte en cours de run → double React** (`Cannot read
properties of null (reading 'useState')`, hash `?v=` différents). Vite ré-optimise et recharge ;
  passe au 2e run, casse à froid (CI). Ajouter la dép à `optimizeDeps.include` du projet `browser`
  (`packages/reference/vitest.config.ts`).
