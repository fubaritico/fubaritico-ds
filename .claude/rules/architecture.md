---
paths:
  - 'packages/**'
  - 'apps/**'
  - 'package.json'
  - 'pnpm-workspace.yaml'
  - 'nx.json'
  - 'lerna.json'
  - 'eslint.config.js'
  - '.github/**'
---

# Architecture — fubaritico-ds

> Multi-framework **design-system generator** built on **Stencil**. From one Web Component project
> (`packages/stencil`) we produce native Web Components + generated **React** and **Angular** wrappers,
> showcased in per-framework Storybook apps. `packages/reference` is the **React deliverable**, published
> as `@fubaritico/react` (decided 2026-10-09), and the source the Stencil ports compare against.

## Tech Stack

| Category        | Technology                                      | Version |
| --------------- | ----------------------------------------------- | ------- |
| Package manager | pnpm (workspaces + catalog)                     | 10.8.1  |
| Monorepo runner | Lerna (powered by Nx)                           | 8.2.x   |
| Web Components  | Stencil (`@stencil/core`)                       | 4.43.5  |
| WC → React      | `@stencil/react-output-target`                  | 1.5.x   |
| WC → Angular    | `@stencil/angular-output-target`                | 1.3.x   |
| Reference UI    | React                                           | 19.2.x  |
| Styling         | Native BEM skin (`@layer`, `--ui-*` vars) + CVA | —       |
| Design tokens   | Style Dictionary (DTCG, hex output)             | —       |
| Language        | TypeScript                                      | ~5.7.2  |
| Testing         | Vitest 4.1.8 (+ `@stencil/vitest`, RTL, jsdom)  | —       |
| Lint            | ESLint 9 (flat config)                          | —       |

## Project Structure

```
apps/
├── storybook-react/         # SET UP — Storybook 10 + React-Vite; stories in stories/reference/*.stories.tsx
│                            #   (NOT co-located); preview loads tokens + native skin; run `pnpm storybook:ref`
├── storybook-web-component/ # empty scaffold — no package.json yet
├── storybook-angular/       # empty scaffold — no package.json yet
└── storybook-vuejs/         # empty scaffold — no package.json yet

packages/
├── behaviors/    @fubaritico/behaviors — behaviour services, one per component (state/keyboard/focus/ARIA)
│   └── src/<domain>/ → dist (tsc); no React/DOM; zero dependencies
├── reference/    @fubaritico/react — the React deliverable (and the port source)
│   ├── src/components/<Component>/ → Component.tsx, .types.ts, .test.tsx, README.md, index.ts
│   ├── src/index.ts (root barrel, CSS-free since `01be734`)
│   ├── vitest.config.ts, vitest.setup.ts, tsconfig.json, tsconfig.build.json
│   └── styling: BEM skin (`@fubaritico/styles`) + resolvers (`@fubaritico/variants`).
│       The `ui:` Tailwind prefix is LEGACY — only Carousel and `next/*` still use it, out of the build.
├── shared/       @fubaritico/shared — utils, test-utils, browser mocks, theme, fonts, vite plugins
│   └── src/{utils,hooks,tailwind,fonts,test-utils,mocks/browser,vite}/
├── stencil/      @fubaritico/stencil — the Stencil sandbox (SUBJECT of the project)
│   ├── stencil.config.ts (5 output targets), tsconfig.json (jsx:react + h), tsconfig.eslint.json
│   ├── vitest.config.ts (minimal now; full @stencil/vitest at step 6 — see PLAN.md)
│   ├── src/global/ui-stencil.css, src/components/ui-*/   → tag prefix `ui-`
│   └── dist/{components,react,angular} — generated artefacts to compare (not installable yet)
├── styles/       @fubaritico/styles — portable native BEM skin (CSS-only, @layer + --ui-* vars)
│   └── src/native-styles.css + src/styles/<component>.css → dist/styles.css (PostCSS)
├── tokens/       @fubaritico/tokens — Style Dictionary → dist/{css,js,ts,tailwind}
└── variants/     @fubaritico/variants — framework-agnostic CVA resolvers (pure BEM class
    └── src/<component>.ts → dist (tsc); no React/DOM; dep: class-variance-authority only
```

These **7 packages** exist. `apps/storybook-react` is set up and wired (consumes
`reference` + `styles` + `tokens`); the other three `apps/storybook-*` are still placeholders.

## Monorepo Orchestration (Lerna + Nx)

Root scripts **delegate** to each package's own script — root does not run `tsc`/`vitest`/`eslint` directly.

```bash
pnpm build        # lerna run build        (topo order via Nx)
pnpm type-check   # lerna run type-check
pnpm test         # lerna run test
pnpm lint         # lerna run lint
pnpm dev          # lerna run --parallel --stream dev (watch modes only — NOT a full build;
                  #   includes a Stencil dev server; Storybook needs `pnpm build`)
```

- `nx.json` `targetDefaults`: `build`/`type-check`/`test` have `dependsOn: ['^build']` so dependencies
  are built first (cross-package types come from `dist/*.d.ts` — there are no tsconfig `paths` to source).
  `build` declares `outputs: ['{projectRoot}/dist']`.
- Dependency order: **tokens → styles, shared, stencil**; **behaviors** and **variants** depend on no internal
  package (variants: `class-variance-authority` only); **reference** → tokens, styles, variants, behaviors
  (`shared` as a dev dependency only, since `01be734`); `apps/storybook-react` → the packages.
- `lerna.json`: **fixed mode** (`version: X.Y.Z` — changed packages move to one shared version), `npmClient: pnpm`. Releases: `README.md` → "Publishing a release", `/release` skill.
- Nx cache lives in `.nx/` (gitignored). **Lerna + Nx stay — no Turbo** (decided `ebc3e6e`).

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

- Each package owns its Vitest config. Spec/test files: `*.test.tsx` + `*.browser.test.tsx` (reference),
  `*.test.ts` (behaviors, variants, shared, `styles/test/`), `*.spec.{ts,tsx}` (stencil, via
  `@stencil/vitest`); `*.e2e.ts` reserved for Playwright Test against Storybook. 5-level policy in `tests.md`.
- `stencil test --spec` is **deprecated** (removed in Stencil v5) — use `@stencil/vitest`.

## CSS / Styling

- **The native BEM skin is the styling mechanism**: `@fubaritico/styles` (`@layer`, `--ui-*` vars) fed by
  tokens, classes from the `@fubaritico/variants` resolvers. Tailwind v4 survives only in `shared`'s theme
  and the tokens' `dist/tailwind` output.
- `packages/reference`: the `ui:` Tailwind prefix is legacy, kept only by the components still queued for
  migration (Carousel and the `next/*` adapters, excluded from the published build — REACT-134).
- `packages/stencil`: BEM + overridable CSS variables (light DOM), global sheet `src/global/ui-stencil.css`,
  fed by `@fubaritico/tokens`; component tags prefixed `ui-`.
- New package/app: define a new prefix, never reuse an existing one.

## Git & Commits

Conventional commits — pre-commit hook (husky) runs `type-check && lint && test`; commit-msg runs
commitlint (body lines ≤ 100 chars). Husky is wired via the root `prepare: husky` script.

Allowed types: `build chore ci docs feat fix perf refactor revert style test`
Format: `type(scope): subject` (lowercase, no trailing period, ≤ 100 chars).
Scopes: `reference` (or `ui`), `behaviors`, `shared`, `stencil`, `styles`, `tokens`, `variants`, `repo` (root/monorepo).

**Branches and pull requests (the dev's call, 2026-10-23)** — so `main` stays releasable while a
ticket spans several commits:

- A ticket's work goes on its own branch, cut from `main` before the first edit (`git switch -c`
  carries uncommitted work along), named `<type>/<TICKET>-<title-slug>`: the commit type, the ticket
  (`/trello`), its title in lowercase ASCII with dashes — `[REACT-152 · BEHAVIORS] Toast : la pile de
notifications` → `feat/REACT-152-toast-la-pile-de-notifications`.
- Once the dev validated the work: push, open a PR to `main` (`gh pr create`, the ticket in the
  body), link it on the ticket (`trello link`). `ci.yml` runs on it.
- CI green → merge **fast-forward** (`git merge --ff-only` on `main`, push): GitHub marks the PR merged.
  Never squash or rebase-merge — they rewrite the hashes the tickets cite. `main` behind → rebase the
  branch first, before any hash is cited.
- Pushing and merging are outward-facing: the dev's go each time.

## Forbidden

```
❌ console.log              → use console.warn / console.error
❌ explicit any             → strict TypeScript
❌ CSS Modules / CSS-in-JS  → BEM skin + CVA resolvers (reference) / BEM+CSS vars (stencil)
❌ new `ui:` Tailwind class → the skin is the styling mechanism; `ui:` is legacy-only
❌ edit generated artefacts → packages/stencil/dist/{react,angular}, components.d.ts (regen via build)
❌ unsorted / unused imports → ESLint enforced
❌ vitest version drift     → keep on the pnpm catalog (avoids SnapshotClient errors)
```
