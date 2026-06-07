# 10 — This Repo: Self-Contained `packages/stencil`

Project-specific setup decided for **fubaritico-ds**. Goal: a discovery sandbox to port a few
`packages/reference` components to Web Components and compare the generated React/Angular wrappers — without
polluting the monorepo's Vite/ESLint/Lerna config.

## Decision: self-contained, not nested-monorepo

We do **not** create separate `react-library` / `angular-workspace` workspace packages. Instead, one
package emits its wrappers into its own subdirectories as build artifacts. This avoids nested pnpm
workspaces and keeps everything deletable with `rm -rf packages/stencil`.

```
packages/stencil/              # ONE package.json, ONE workspace entry
├── stencil.config.ts
├── package.json
├── tsconfig.json
├── src/
│   ├── global/
│   │   └── ui-stencil.css     # global stylesheet (tokens + accent + reset)
│   └── components/
│       ├── ui-badge/          # ported Badge
│       ├── ui-button/         # ported Button
│       └── ui-rating/         # ported Rating
└── dist/
    ├── components/            # dist-custom-elements (raw WC, tree-shakeable)
    ├── react/                 # reactOutputTarget — inspect & compare here
    └── angular/               # angularOutputTarget — inspect & compare here
```

> The `dist/react` and `dist/angular` folders are **generated artifacts to read/compare**, not
> installable packages. Promote them to real packages only if we later test real consumption in the
> host.

## stencil.config.ts (discovery)

```typescript
import { Config } from '@stencil/core'
import { reactOutputTarget } from '@stencil/react-output-target'
import { angularOutputTarget } from '@stencil/angular-output-target'

export const config: Config = {
  namespace: 'ui-stencil',
  globalStyle: 'src/global/ui-stencil.css',
  outputTargets: [
    { type: 'dist', esmLoaderPath: '../loader' }, // esmLoaderPath is relative to the dist output dir
    {
      type: 'dist-custom-elements', // required by React target
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false, // REQUIRED by @stencil/react-output-target 1.x — else config validation fails
    },
    reactOutputTarget({ outDir: './dist/react/' }),
    angularOutputTarget({
      componentCorePackage: '@fubaritico-ds/stencil',
      outputType: 'standalone',
      directivesProxyFile: './dist/angular/components.ts',
      directivesArrayFile: './dist/angular/index.ts',
    }),
    { type: 'docs-readme' },
  ],
}
```

## Monorepo integration steps

1. **Workspace** — confirm `packages/*` is in `pnpm-workspace.yaml` (it is). The Stencil package
   joins as `@fubaritico-ds/stencil`. Its Rollup/TS toolchain is independent of the root Vite.
2. **ESLint override (not exclude)** — Stencil's JSX is **not** React JSX. Stencil **is the subject of
   this project**, so it must be linted by the root `pnpm lint`. Add a dedicated override block to the
   **root** `eslint.config.js` (`{ files: ['packages/stencil/**/*.{ts,tsx}'], ... }`) that sets the `h`
   pragma / `Fragment` factory and disables the React import-order rules. Only `ignore` the generated
   output (`packages/stencil/dist`, `src/components.d.ts`). A _local_ `eslint.config.js` would NOT be
   read by a single root `eslint .` invocation in flat-config mode.
3. **Separate tsconfig** — Stencil's default `tsconfig.json` (what `stencil` scaffolds, see
   `createDefaultTsConfig` in `@stencil/core`) uses **classic JSX**: `jsx: 'react'` + `jsxFactory: 'h'`
   - `jsxFragmentFactory: 'Fragment'`. (The automatic runtime — `jsx: 'react-jsx'` +
     `jsxImportSource: '@stencil/core'` — is a supported _alternative_, not the default.) Keep this file
     standalone; do **not** extend the root React tsconfig (`react-jsx`) — the two JSX modes are incompatible.
4. **Lerna / root verifs** — Stencil has its own `build`/`test`/`type-check` scripts. Wire them into the
   root verifs (`type-check`, `test`, `build:packages`) so the pre-commit gate covers Stencil. Its own
   compiler type-checks during `stencil build`; `stencil test --spec` runs its Jest-based specs.
5. **Naming** — package name `@fubaritico-ds/stencil`; component tags prefixed `ui-` to mirror the
   `packages/reference` design system being ported.

## Conventions to keep (from CLAUDE.md)

- **JSDoc** on every public `@Prop`/`@Event`/`@Method` (strict — feeds generated docs & wrapper types).
- **No `console.log`** — `console.warn`/`console.error` only.
- **No explicit `any`** — strict TS.
- **Tests** for every component — use **`@stencil/vitest`** (`references/09-testing.md`), 5-level policy.
  ⚠️ Do NOT use the integrated `stencil test --spec`: in Stencil v4.43 it is **deprecated** (removed in
  v5, see `stenciljs/core#6584`) AND not zero-dep (it requires `jest@29` + `@types/jest@29` +
  `jest-cli@29`). The package's `vitest.config.ts` (via `defineVitestConfig`, specs `*.spec.{ts,tsx}`,
  `environment: 'stencil'`) is auto-discovered by the root `vitest run` through `projects: ['packages/*']`
  — no change to the root `test` script needed.
- **Discuss approach first**, run `pnpm type-check && pnpm lint && pnpm test` after changes — these now
  cover Stencil (see step 4). Always validate the package builds with `stencil build`.

## Suggested discovery sequence

1. `npm init stencil components` inside `packages/` → rename/clean to `packages/stencil`.
2. Wire `stencil.config.ts` as above; add the ESLint override + standalone tsconfig + root verifs wiring (steps 2–4).
3. Port **Badge** (atom, plain CSS) → `stencil build` → read `dist/react/` wrapper.
4. Port **Button** (discriminated union + event) → rebuild → compare wrapper vs `packages/reference/Button`.
5. Port **Rating** (`@State` / interactivity) → rebuild → probe `@State`/`@Method`/slots limits.
6. Write up findings: prop fidelity, events (`e.detail`), Tailwind loss, generated type quality.

See `references/08-porting-react-to-wc.md` for the per-component mapping and the Tailwind tradeoff.
