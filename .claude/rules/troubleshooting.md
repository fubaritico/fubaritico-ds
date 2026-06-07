# Troubleshooting & Architectural Decisions

> Real issues hit while standing up the Stencil DS monorepo. See `architecture.md` for the layout.

## Monorepo / tooling

### Vitest `SnapshotClient.setup() is not found` in a pnpm monorepo

**Problem**: `toMatchSnapshot()` fails with "The snapshot state … is not found. Did you call 'SnapshotClient.setup()'?".
**Root cause**: duplicate/mismatched `vitest` (and `@vitest/snapshot`) instances across packages — a version split (e.g. one package on 3.2.4 via catalog, another resolving 3.2.6 via `^3.1.2`), often amplified by a `jsdom` split.
**Solution**: pin all vitest-related deps on the **pnpm catalog** (`"vitest": "catalog:"`, same for `jsdom`, `@vitest/coverage-v8`); dedupe. Ref: vitest-dev/vitest#7668, #7430.
**Rule**: never declare vitest with a `^` range that can drift from the catalog.

### `@testing-library/jest-dom/vitest` → `Cannot find package 'vitest'`

**Problem**: jest-dom's `/vitest` entry does `import 'vitest'` but jest-dom does **not** declare vitest as a dep/peer — it relied on vitest being hoisted (e.g. as a root dep). Removing vitest from the root broke it.
**Solution**: `packageExtensions` in `pnpm-workspace.yaml` declaring `vitest` as an optional peer of `@testing-library/jest-dom`, so pnpm co-locates it wherever both are used.
**Rule**: a clean `pnpm install` may "reuse" node_modules and not restructure; delete `pnpm-lock.yaml` (or node_modules) to force re-resolution when peers are stale.

### `lerna run` → `ENOLERNA lerna.json does not exist`

**Solution**: Lerna v8 requires `lerna.json` (`{ "version": "independent", "npmClient": "pnpm" }`).

### Cross-package types unresolved during `type-check`/`test`

**Problem**: `reference` can't resolve `@fubaritico-ds/shared` because types come from `dist/*.d.ts` (no tsconfig `paths` to source) and `shared` wasn't built.
**Solution**: `nx.json` `targetDefaults` with `dependsOn: ['^build']` on `type-check`/`test`/`build` — Nx builds dependencies first. Don't build manually.

### Husky hooks never run

**Problem**: copying `.husky/` is not enough — `core.hooksPath` is never set, so git uses the empty `.git/hooks`.
**Solution**: add `"prepare": "husky"` to root `package.json` (runs on install) and run `pnpm exec husky` once. Verify `git config core.hooksPath` → `.husky/_`.

### Root `tsconfig` / `vitest` are not the source of truth

The repo originated from a single-app project; a root `tsconfig.json` with `include: ["src"]` (no root `src/`) and a root `vitest.config.ts` are vestigial. Verifs are **per-package**, orchestrated by Lerna/Nx — the root does not type-check/test directly.

## Stencil

### `react-output-target` requires `externalRuntime: false`

**Problem**: build/test fails: "the 'react-output-target' requires the 'dist-custom-elements' output target to have 'externalRuntime: false'".
**Solution**: set `externalRuntime: false` on the `dist-custom-elements` target (inlines the Stencil runtime).

### `stencil test --spec` is deprecated

Deprecated in Stencil v4.43 (removed in v5) AND not zero-dep (wants `jest@29` + `@types/jest@29` + `jest-cli@29`). Use **`@stencil/vitest`** (ref: stenciljs/core#6584).

### `tsconfig.json` must not reference `stencil.config.ts`

Stencil warns "tsconfig.json should not reference stencil.config.ts". Keep the build tsconfig `include: ["src"]`; use a separate `tsconfig.eslint.json` (extends it + adds `stencil.config.ts`) for ESLint typed rules and `type-check`, so an empty `src` doesn't trigger `TS18003 No inputs were found`.

### Stencil JSX vs root ESLint

Stencil JSX compiles via the `h()` pragma (classic mode: `jsx: 'react'` + `jsxFactory: 'h'` + `jsxFragmentFactory: 'Fragment'` — the Stencil default), NOT React's `react-jsx`. The root `eslint.config.js` has a `packages/stencil/**` override (sets the `h` pragma, neutralizes React-only rules). Don't extend the root React tsconfig from stencil.
