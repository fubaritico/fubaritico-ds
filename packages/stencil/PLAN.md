# Plan — `@fubaritico/stencil`

> The steps of the Stencil package and their **state**. The detailed walk-through of each file lives in
> `README.md` (the set-up log). Skill reference: `.claude/skills/stencil/references/10-project-monorepo.md`.
> On the board: STENCIL-130 (steps 4 → 6 as a checklist), initiative DESIGN-122.

## Goal

Set up a **Stencil sandbox** (`packages/stencil`) that, from **one** Web Component project, produces:

1. native **Web Components** (`dist-custom-elements`, tree-shakeable),
2. a generated **React wrapper** (`dist/react/`),
3. a generated **Angular wrapper** (`dist/angular/`),

by **porting 3 components** already in `packages/reference`, to compare the generated code with the React code
written by hand.

**Ported components** (simplest to richest): `ui-badge` → `ui-button` → `ui-rating`.

## Architecture decisions (locked)

- **Self-contained**, no nested monorepo: one `package.json`, the wrappers are **build artefacts** in
  `dist/react` and `dist/angular` (not installable packages). Everything can be removed with
  `rm -rf packages/stencil`.
- **Its own toolchain, but a first-class package**: Stencil **is the subject of the project**, so it is **not
  excluded** from the root scripts and checks. It keeps a standalone tsconfig (`jsx: "react"` + `jsxFactory: "h"`
  - `jsxFragmentFactory: "Fragment"`, does NOT extend the root tsconfig — the two JSX modes are incompatible) and
    an **override block** in the root `eslint.config.js` (pragma `h`, React import rules off) rather than an ignore.
- **Tags prefixed `ui-`** to mirror the `packages/reference` design system.
- **Test runner**: `@stencil/vitest` (the initial plan — confirmed right). The "built-in runner"
  `stencil test --spec` is **deprecated** in Stencil v4.43 (removed in v5) AND is **not** zero-dependency (it
  needs `jest@29` + `@types/jest@29` + `jest-cli@29`): its locked justification was wrong. `@stencil/vitest`
  aligns with the Vitest already in the repository. The package's `vitest.config.ts` (through
  `defineVitestConfig`, specs `*.spec.{ts,tsx}`, env `stencil`) is picked up **automatically** by the root
  `vitest run`. The full Vitest config + the first spec come at step 6.
- One Storybook application per UI framework.

## Conventions (inherited from CLAUDE.md)

- **Strict JSDoc** on every public `@Prop` / `@Event` / `@Method` (feeds the docs + the wrappers' types).
- **Never `console.log`** → `console.warn` / `console.error`.
- **Never an explicit `any`** — strict TS.
- **5-level tests** per component (`tests.md`).
- **Discuss the approach first**; validate each step with a green `stencil build`.

---

## Steps & state

### ✅ Step 1 — `package.json`

Done. `@stencil/core` in deps; `@stencil/react-output-target` + `@stencil/angular-output-target` +
react/react-dom in devDeps; scripts `build` / `dev` / `test` / `lint`. _(detail: README step 1)_

### ✅ Step 2 — `tsconfig.json`

Done. Isolated config (decorators, `jsx: "react"`, `jsxFactory: "h"`, `jsxFragmentFactory: "Fragment"`).
_(detail: README step 2)_

### ✅ Step 3 — `stencil.config.ts`

Done. 5 output targets: `dist` (+loader), `dist-custom-elements` (auto-define + **`externalRuntime: false`**,
required by `@stencil/react-output-target` 1.x — without it the config does not validate), `reactOutputTarget`,
`angularOutputTarget` (standalone), `docs-readme`. _(detail: README step 3)_

### 🟡 Step 4 — Toolchain integration + `exports` (checked 2026-10-22: mostly done)

- [x] **Root ESLint override**: a `{ files: ['packages/stencil/**/*.{ts,tsx}'], ... }` block in the root
      `eslint.config.js` (pragma `h`, `tsconfig.eslint.json`) — not an ignore: `pnpm lint` covers stencil.
- [x] The `package.json` `exports` field (`.`, `./components/*`, `./loader`, `./dist/*`).
- [x] A `type-check` script (`tsc --noEmit -p tsconfig.eslint.json`).
- [x] Wired into the root `type-check`, `lint` and `test`.
- [ ] Wired into the root **`build`**: still excluded (`build:packages` ignores it; `.github/workflows/build.yml`
      too) until step 5 makes `stencil build` green.

### ⬜ Step 5 — Global style (`globalStyle` points to a missing file → the build breaks today)

- [ ] Create `src/global/ui-stencil.css`: tokens import (`@fubaritico/tokens`), accent variables, a minimal reset.
- [ ] `stencil build` → **must go green** (validates the chain before any component); then add stencil back to
      the root build and the CI build.

### ⬜ Step 6 — Port `ui-badge` (an atom, simple CSS) — validates the whole chain

- [ ] `src/components/ui-badge/ui-badge.tsx` (`@Component`, `@Prop`, JSDoc) + `ui-badge.css` (BEM, overridable
      CSS variables — or the shared `@fubaritico/styles` skin + `@fubaritico/variants` resolver).
- [ ] `src/components/ui-badge/test/ui-badge.spec.tsx` (5 levels).
- [ ] `stencil build` → read `dist/react/` and `dist/angular/` + the generated `readme.md`.
- [ ] Compare the generated React wrapper with `packages/reference/src/components/Badge`.

### ⬜ Step 7 — Port `ui-button` (discriminated union + event)

- [ ] Map the polymorphic prop (`as`) and the event (`@Event` camelCase, `e.detail`).
- [ ] `.tsx` + BEM `.css` + `.spec.tsx` (5 levels).
- [ ] Rebuild → compare the wrapper with `packages/reference/src/components/Button` (props and events fidelity).

### ⬜ Step 8 — Port `ui-rating` (state / interactivity)

- [ ] Probe `@State` / `@Method` (async) / slots if needed.
- [ ] `.tsx` + BEM `.css` + `.spec.tsx` (5 levels).
- [ ] Rebuild → compare the wrapper with `packages/reference/src/components/Rating`.

### ⬜ Step 9 — Discovery synthesis

- [ ] Notes in the README: props fidelity, events (`e.detail`), BEM + CSS vars strategy, quality of the generated
      types (React & Angular).
- [ ] Decide whether `dist/react` / `dist/angular` become real packages a host can consume.

---

## Validation checkpoint (at each component step)

```bash
pnpm --filter @fubaritico/stencil build   # = stencil build: must be green
pnpm --filter @fubaritico/stencil test    # = vitest (@stencil/vitest): 5 levels green
pnpm --filter @fubaritico/stencil lint    # eslint --max-warnings 0
```

Then, at the root, make sure nothing broke elsewhere: `pnpm type-check && pnpm lint && pnpm test`.

## Current resume point

**Step 5** (global style) — `stencil build` fails as long as `src/global/ui-stencil.css` does not exist; then
the root and CI builds take stencil back.
