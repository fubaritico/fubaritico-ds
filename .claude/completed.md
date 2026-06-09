## Completed

Put here the completed tasks and plans to avoid cluttering the context window.

### 2026-06-07 — CI + git remote

- **git remote created**: `origin` = https://github.com/fubaritico/fubaritico-ds (public, org `fubaritico`), `main` pushed. Needed `gh auth refresh -s workflow` + `gh auth setup-git`.
- **CI built** (`.github/`): composite `setup` action → `ci.yml` orchestrates `validate` (lint/type-check/test) → `build` (`build:packages`, **stencil excluded** until its build is green) → `sonarqube` (self-skips without `SONAR_TOKEN`) → `quality-gate`. **Green on first run.**
- Deferred CI stubs (`e2e`, `pa11y`, `deploy-storybook`) as `workflow_dispatch`-only.
- GitHub Actions bumped to Node 24 majors (`pnpm/action-setup@v6`, `upload-artifact@v6`, `sonarqube-scan-action@v7`).
- SonarCloud project initialized (key `fubaritico-ds`, org `fubaritico`); `sonar-init` ran green; sonar now active in CI.
- `nx.json`: `lint`/`coverage` added to `targetDefaults` (`dependsOn: ['^build']`). Coverage v8 + lcov on shared/reference/stencil.

### 2026-06-09 — Button + Typography migrated; component-README doc rule

- **Button** migrated to the native skin and split into Button / LinkButton / NextLinkButton
  (commit `532cb3c`) — LinkButton keeps `react-router-dom` as a routing **adapter** (presentational
  primitive `Button` stays framework-free).
- **TMDB MovieCard composites removed** (base + `next/` + `react-router/` dirs) + dropped the
  `./react-router` package export (`5953964`) — out of migration scope, infra-named dirs.
- **Typography** migrated to the native skin: BEM `.ui-typography` skin (`@layer`, logical props),
  `typographyVariants` CVA resolver, semantic `--typography-*` token scale (fluid headings via
  `clamp`, fixed body roles), `font.letterSpacing` tokens (`e1b3ba8`). 5-level tests + story.
- **/review** ran on the migration → 1 fix applied: `ComponentProps` (ref-as-prop) instead of
  `ComponentPropsWithoutRef` (`f27d34b`). Discarded false positives (import-order — lint is green;
  STYLE-008 `--ui-*` layer — tokens already are the override surface; STYLE-011 left/right — MUI
  parity, physical on purpose).
- **`label` variant fix** (`5d3ae53`): renders a `<span>` (was an orphan `<label>`, WCAG 1.3.1); a
  real form label is an explicit opt-in via `as="label"` with **`htmlFor` required at compile time**.
- **New rule — every component ships a co-located `README.md`** usage doc (`.claude/rules/component-docs.md`):
  structured like a DS site page (identity, capabilities, import, basic/variants/edge examples, props,
  a11y, consumer-facing **Notes** for gotchas/misuse). Wired into `new-react-component` (scaffold) +
  `review` (Step 2b presence check). First applied to Typography (`c8f18e7`). CLAUDE.md workflow rule
  tightened: confirm the approach ONCE, then execute the whole block without re-asking.

### 2026-06-08/09 — White-label native-CSS pivot + Badge spike

- **New `packages/styles`** (`@fubaritico-ds/styles`, CSS-only): portable native **BEM skin** in `@layer ui.components`, **component-scoped `--ui-*` variables** for override, PostCSS bundle (import+nested+autoprefixer+minify) → `dist/styles.css`. peerDep on tokens.
- **tokens**: primary amber → **Material UI blue** (`#1976d2`, new `blue` primitive) — white-label proof.
- **Badge migrated off Tailwind** to BEM + **CVA** (`badgeVariants`), `extends ComponentProps<'span'>`; tests rewritten in BEM (5-level); static demo harness (`packages/styles/demo/index.html`).
- **`/review` hardened**: added 7th subagent **`review-styles`** (CSS/BEM rules) + `*.css` scope; it immediately caught real CSS issues the TS-only review had missed (tokenized paddings, line-height var, md emits no class).
- Added BEM skills (`bem-structure`, ` audit-style`); cleaned `settings.local.json` (removed obsolete RN/Expo skills + context7); refined `CLAUDE.md` rules (plans in `files/plans/`, challenge-by-default, push allowed).
- All green: `type-check && lint && test && build:packages`. Plan: `files/plans/badge-spike-native-css.md`.
- **Decision locked**: `packages/reference` is a **guide/sandbox, NOT a deliverable** (may be deleted at the end). Real deliverables = framework packages consuming `@fubaritico-ds/{tokens,styles}`.

### 2026-06-09 — CVA resolver package `@fubaritico-ds/variants` + import group

- **New package `packages/variants`** (`@fubaritico-ds/variants`): framework-agnostic CVA resolvers
  (pure TS, no React/DOM, dep `class-variance-authority` only) emitting the skin's BEM classes.
  Home for variant→class logic — **decided over `shared`** (React grab-bag) **and over a `styles`
  JS-entry** (keeps `styles` CSS-only), after challenging the dev twice. Rationale: variants are
  reused across React/WC/Angular/Vue and must stay React-free. tsconfig (type-check) + tsconfig.build
  (emit, excludes tests) + vitest (node) + scoped eslint override. Commit `b487b4c`.
- **Badge migrated** off `reference`-local `Badge.variants.ts` onto `@fubaritico-ds/variants`
  (`badgeVariants` + `BADGE_ICON_CLASS`); `class-variance-authority` dropped from `reference` deps.
  13 resolver tests (5-level). `architecture.md` documents 6 packages + `variants → reference` order.
- **eslint `@fubaritico-ds/*` import group** (commit `01e6b63`): `import/order` pathGroup
  (`group: internal`, `pathGroupsExcludedImportTypes: ['builtin','type']` keeps `import type` last);
  6 reference files auto-reordered. Makes the documented import convention actually enforced.
- **Plan**: `files/plans/native-css-migration.md`. **Memory**: `native-css-migration-backlog`.
- **Workflow locked**: migrate EXISTING reference primitives onto the Badge pattern first (web-only,
  primitives only, one commit each) → THEN copy in 9 new components one-by-one (+ `icons` package).
