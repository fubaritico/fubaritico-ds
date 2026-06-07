# Architecture — fubaritico-ds

> Multi-framework **design-system generator** built on **Stencil**. From one Web Component project
> (`packages/stencil`) we produce native Web Components + generated **React** and **Angular** wrappers,
> showcased in per-framework Storybook apps. `packages/reference` (React/Tailwind) is the hand-written
> reference we port from.

## Tech Stack

| Category        | Technology                                     | Version |
| --------------- | ---------------------------------------------- | ------- |
| Package manager | pnpm (workspaces + catalog)                    | 10.8.1  |
| Monorepo runner | Lerna (powered by Nx)                          | 8.2.x   |
| Web Components  | Stencil (`@stencil/core`)                      | 4.43.5  |
| WC → React      | `@stencil/react-output-target`                 | 1.5.x   |
| WC → Angular    | `@stencil/angular-output-target`               | 1.3.x   |
| Reference UI    | React                                          | 19.2.x  |
| Styling         | Tailwind CSS v4 (CSS-first)                    | 4.x     |
| Design tokens   | Style Dictionary (OKLCH, DTCG)                 | —       |
| Language        | TypeScript                                     | ~5.7.2  |
| Testing         | Vitest 3.2.4 (+ `@stencil/vitest`, RTL, jsdom) | —       |
| Lint            | ESLint 9 (flat config)                         | —       |

## Project Structure

```
apps/                       # empty scaffolds — no package.json yet
├── storybook-web-component/
├── storybook-react/
├── storybook-angular/
└── storybook-vuejs/

packages/
├── reference/    @fubaritico-ds/reference — React/Tailwind DS components (the port source)
│   ├── src/<Component>/  → Component.tsx, .types.ts, .test.tsx, index.ts
│   ├── vitest.config.ts, vitest.setup.ts, tsconfig.json, tsconfig.build.json
│   └── prefix: `ui:` on all Tailwind classes
├── shared/       @fubaritico-ds/shared — utils, test-utils, browser mocks, theme, fonts, vite plugins
│   └── src/{utils,hooks,tailwind,fonts,test-utils,mocks/browser,vite}/
├── stencil/      @fubaritico-ds/stencil — the Stencil sandbox (SUBJECT of the project)
│   ├── stencil.config.ts (5 output targets), tsconfig.json (jsx:react + h), tsconfig.eslint.json
│   ├── vitest.config.ts (minimal now; full @stencil/vitest at step 6 — see PLAN.md)
│   ├── src/global/ui-stencil.css, src/components/ui-*/   → tag prefix `ui-`
│   └── dist/{components,react,angular} — generated artefacts to compare (not installable yet)
└── tokens/       @fubaritico-ds/tokens — Style Dictionary → dist/{css,js,ts,tailwind}
```

Only these **4 packages** exist. `apps/storybook-*` are placeholders.

## Monorepo Orchestration (Lerna + Nx)

Root scripts **delegate** to each package's own script — root does not run `tsc`/`vitest`/`eslint` directly.

```bash
pnpm build        # lerna run build        (topo order via Nx)
pnpm type-check   # lerna run type-check
pnpm test         # lerna run test
pnpm lint         # lerna run lint
pnpm dev          # lerna run --parallel --stream dev
```

- `nx.json` `targetDefaults`: `build`/`type-check`/`test` have `dependsOn: ['^build']` so dependencies
  are built first (cross-package types come from `dist/*.d.ts` — there are no tsconfig `paths` to source).
  `build` declares `outputs: ['{projectRoot}/dist']`.
- Dependency order: **tokens → shared → reference**; **stencil** is independent.
- `lerna.json`: `version: independent`, `npmClient: pnpm`.
- Nx cache lives in `.nx/` (gitignored).
- **TODO (planned): migrate Lerna → Turbo.**

## Versions & pnpm catalog

- Shared dep versions are pinned in `pnpm-workspace.yaml` `catalog:` and referenced as `"dep": "catalog:"`
  in packages (e.g. `vitest`, `jsdom`, `react`). Keep test tooling on the catalog to avoid version splits.
- `packageExtensions` in `pnpm-workspace.yaml` declares `vitest` as an optional peer of
  `@testing-library/jest-dom` (its `/vitest` entry imports vitest without declaring it).
- Root is NOT a test-running package — it has no `vitest`/`jsdom`/`@testing-library/*` deps.

## Stencil output targets (`packages/stencil/stencil.config.ts`)

1. `dist` (+ `esmLoaderPath: '../loader'`) — lazy bundle + loader for plain HTML usage
2. `dist-custom-elements` (`auto-define-custom-elements`, **`externalRuntime: false`** — required by the
   React target 1.x) — tree-shakeable WC, required by the React wrapper
3. `reactOutputTarget` → `dist/react/`
4. `angularOutputTarget` (standalone) → `dist/angular/`
5. `docs-readme` — generated `readme.md` per component from JSDoc

## Testing

- Each package owns its Vitest config. Spec/test files: `*.test.tsx` (reference), `*.test.ts` (shared),
  `*.spec.{ts,tsx}` (stencil, via `@stencil/vitest`). 5-level policy in `tests.md`.
- `stencil test --spec` is **deprecated** (removed in Stencil v5) — use `@stencil/vitest`.

## CSS / Styling

- Tailwind v4, CSS-first (no `tailwind.config.js`).
- `packages/reference`: `ui:` class prefix.
- `packages/stencil`: BEM + overridable CSS variables (light DOM), global sheet `src/global/ui-stencil.css`,
  fed by `@fubaritico-ds/tokens`; component tags prefixed `ui-`.
- New package/app: define a new prefix, never reuse an existing one.

## Git & Commits

Conventional commits — pre-commit hook (husky) runs `type-check && lint && test`; commit-msg runs
commitlint (body lines ≤ 100 chars). Husky is wired via the root `prepare: husky` script.

Allowed types: `build chore ci docs feat fix perf refactor revert style test`
Format: `type(scope): subject` (lowercase, no trailing period, ≤ 100 chars).
Scopes: `reference` (or `ui`), `shared`, `stencil`, `tokens`, `repo` (root/monorepo).

## Forbidden

```
❌ console.log              → use console.warn / console.error
❌ explicit any             → strict TypeScript
❌ CSS Modules / CSS-in-JS  → Tailwind (reference) / BEM+CSS vars (stencil)
❌ edit generated artefacts → packages/stencil/dist/{react,angular}, components.d.ts (regen via build)
❌ unsorted / unused imports → ESLint enforced
❌ vitest version drift     → keep on the pnpm catalog (avoids SnapshotClient errors)
```
