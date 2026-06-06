# 10 — This Repo: Self-Contained `packages/stencil`

Project-specific setup decided for **fubaritico-ds**. Goal: a discovery sandbox to port a few
`packages/ui` components to Web Components and compare the generated React/Angular wrappers — without
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
│   └── components/
│       ├── ui-badge/          # ported Badge
│       └── ui-button/         # ported Button
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
  namespace: 'mf-stencil',
  srcDir: 'src',
  outputTargets: [
    { type: 'dist', esmLoaderPath: './loader' },
    { type: 'dist-custom-elements' }, // required by React target
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
2. **Isolate from root ESLint** — Stencil's JSX is **not** React JSX. Add a local
   `eslint.config.js` in `packages/stencil` (or add `packages/stencil/dist` + generated files to the
   root ESLint `ignores`) so the React import-order / `h` pragma rules don't fight it.
3. **Isolate from root tsconfig** — Stencil generates its own `tsconfig.json` with
   `jsx: 'react-jsx'` + `jsxImportSource: '@stencil/core'`. Do not extend the root React tsconfig.
4. **Lerna** — Stencil has its own `build`/`test` scripts; no special wiring needed for discovery.
   Don't add it to the root `pnpm dev` parallel run.
5. **Naming** — package name `@fubaritico-ds/stencil`; component tags prefixed `ui-` to mirror the
   `packages/ui` design system being ported.

## Conventions to keep (from CLAUDE.md)

- **JSDoc** on every public `@Prop`/`@Event`/`@Method` (strict — feeds generated docs & wrapper types).
- **No `console.log`** — `console.warn`/`console.error` only.
- **No explicit `any`** — strict TS.
- **Tests** for every component — use `@stencil/vitest` (`references/09-testing.md`), 5-level policy.
- **Discuss approach first**, run `pnpm type-check && pnpm lint && pnpm test` after changes (note:
  Stencil has its own build/test — validate the package builds with `stencil build`).

## Suggested discovery sequence

1. `npm init stencil components` inside `packages/` → rename/clean to `packages/stencil`.
2. Wire `stencil.config.ts` as above; isolate ESLint/tsconfig (steps 2–3).
3. Port **Badge** (atom, plain CSS) → `stencil build` → read `dist/react/` wrapper.
4. Port **Button** (discriminated union + event) → rebuild → compare wrapper vs `packages/ui/Button`.
5. (Optional) Port a compound/stateful component to probe `@State`/`@Method`/slots limits.
6. Write up findings: prop fidelity, events (`e.detail`), Tailwind loss, generated type quality.

See `references/08-porting-react-to-wc.md` for the per-component mapping and the Tailwind tradeoff.
