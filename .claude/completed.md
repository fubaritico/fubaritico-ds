## Completed

Put here the completed tasks and plans to avoid cluttering the context window.

### 2026-06-12 — DS primary → neutral + IconButton (Open/Closed extension of Button)

- **Primary neutral strategy** (`4cebb80`): `color.semantic.primary.default` `blue.600` → `neutral.900`
  (#171717), hover → `neutral.800`; foreground (white) + destructive untouched. Re-skins Button + Badge
  primary. **DS strategy locked**: the default is **neutral**, brand colour is **opt-in emphasis**
  (shadcn/Radix); the blue was only a white-label proof. Memory: `neutral-default-emphasis-strategy`.
- **IconButton migrated** (`10de488`) as an **Open/Closed (the "O" of SOLID) extension of Button**:
  renders `<Button>` + a `.ui-icon-button` shape layer (square/circular, zero padding) — Button.tsx /
  button.css / `buttonVariants` **untouched**. `iconButtonVariants` (in `variants`) emits only the shape
  classes; colours reuse `buttonVariants`, icon px reuses Button's `iconSizeMap`. `ghost-dark` is
  IconButton-only (redefines the reused `--ui-button-*` vars, mapped to primitive neutrals with a
  `TODO(tokens)` to mint semantic on-dark tokens WITH Drawer). Flat atom, NOT a compound. 5-level
  userEvent tests, `Reference/IconButton` story, co-located README.
- **/review** (7 agents): 6 fixes applied (`--ui-icon-button-radius` var; `ButtonProps` via the `../Button`
  barrel; dedicated L4 comment; story `DARK_SURFACE_BG` const; Drawer test `React.`→named import). 3
  false-positives rejected (ghost-dark ring contrast OK on dark ~4.5:1; import-order — lint green, matches
  `Button.shared`; `sm`=32px is WCAG 2.5.5 **AAA**, project targets **AA** where 24px suffices).
- **Pre-existing a11y debt FIXED, not deferred** (`bacc280`): focus-ring `--color-ring` `neutral.400` →
  `neutral.500` (#6b6b6b, ≥3:1 on white ~5.3:1 AND on the dark ghost-dark surface ~3.4:1 — WCAG 1.4.11);
  `button.css` now suppresses its colour transition under `prefers-reduced-motion` (WCAG 2.3.3). New
  workflow rule (`80c2d78`): **fix pre-existing issues a review surfaces in touched files — no
  out-of-scope deferral**. All pushed (`d9f0cd7..80c2d78`).

### 2026-06-12 — Avatar: migrated, then rewritten as a React 19 compound

- **Tokens kebab-case** (`d6b0f3e`): `toKebabName` helper in `sd.config.js` splits camelCase humps
  only (`lineHeight`→`line-height`), preserving numeric segments (`2xl`/`3xl`/`0.5`). All `--font-*` /
  `--typography-*` vars now kebab; skin consumers (badge/typography css) updated. The TS tokens object
  stays camelCase (JS dot-access ergonomics — the rule targets CSS custom-property names).
- **Avatar flat migration** (`facecc5`): `.ui-avatar` BEM skin + `avatarVariants` resolver + flat API
  (`src/alt/initials/size`); composes `Icon` as-is. **Talent** composite removed (obsolete consumer of
  the dropped `testId`).
- **Avatar compound rewrite** (`4136a10`): full **React 19 compound** — `Avatar.{Image,Fallback,Icon,
Initials}`, resolution **resolver** (Model A: first viable wins; a pending image blocks later
  candidates = anti-flash), **split contexts** (stable config / dynamic resolver) with guarded access
  hooks, React 19 idioms (`<Context value>`, `use()`, `useEffectEvent`, `ref`-as-prop). a11y: root
  `role="img"` + required `aria-label`; image/initials/icon decorative. 5-level tests, story, README.
  Docs: **Compound Components (React 19)** section in `patterns-ui.md` + documentation rules in
  `new-react-component` (fixed the broken `component-patterns.md` ref → `patterns-ui.md`).
- **Hardening / review** (`bfe4eab`,`ba69b4d`,`0e6c7e4`,`470da87`,`096ee0f`,`8f9cee1`): candidates MUST
  live inside `Avatar.Fallback` (access hooks throw, standalone mode dropped); loading **Spinner** via
  the `Avatar.Image` render-prop (doc + Showcase, no baked-in default); `STATUS_TO_CANDIDATE` Record
  map (no nested ternary); enforced **`react/jsx-no-leaked-render`** (eslint); `modeFor`→
  `getCandidateMode`; `Cascade`→`Resolver` everywhere. Avatar is now the **reference template** for the
  heavy compounds (Listbox/Typeahead). All pushed to `origin/main` (`952b757..8f9cee1`).

### 2026-06-12 — Headless UI deep-dive + `/state-storage` skill (no component change)

- **Research turn, no code/component change.** Deep analysis of **Headless UI React v2.2.10** internals
  → personal working docs in `files/analysis/` (gitignored): `headlessui-state-machine.md` (the `Machine`
  store-reducer + selectors + effects, why state lives OUTSIDE React), `headlessui-context-vs-machine.md`
  (the re-render gain: Context = O(N) on all consumers vs Machine + per-slice = ~O(1)),
  `headlessui-combobox-vertical-slice.md` (end-to-end: `as`-render → machine → `dataRef` → keyboard →
  form → transitions), `state-externalization-3-levels-and-hooks.md` (4 storage tiers + behavior-hooks).
- **New committed skill `/state-storage`** (`8c22477`): decides the **lightest sufficient** state tier —
  **local · createStore · Zustand · simplified Machine** — challenge-by-default; `references/` carry the
  full per-tier code + the **real behavior-hooks source** (useEvent/useControllable/useOutsideClick/…).
  Wired into `decision-tree.md`. Memory: **`storage-levels-playbook`**.
- **`/review` SKILL hardened** (`6cfa3cf`, dev's own edit): findings-table columns now mandatory
  (`ID`, `Sév`, `Catégorie`, `Description`, `Statut`).
- **Key insights locked**: HeadlessUI's `Machine` is framework-agnostic _by design but NOT shared_ (Vue
  reimplements with its own reactivity) — machines are justified by **render-volume + keyboard +
  cross-instance coordination**, NOT by being unstyled. Most DS components stay **Tier-1 local**; a
  machine is only for **Listbox/Typeahead**. The `useSyncExternalStore` gotcha (derived slice → loop →
  use `…WithSelector`). Pushed `origin/main` (`aeb64b6..6cfa3cf`).

### 2026-06-10 — Skeleton migrated onto the native skin

- **Skeleton migrated** (`07cf01e`): `.ui-skeleton` BEM skin (`@layer`, `--ui-skeleton-*` override
  vars, shimmer `::before` with an overridable `--ui-skeleton-shimmer-direction`, keyframes ported from
  `packages/reference/src/styles.css`), `skeletonVariants` CVA resolver (`rectangle`/`circle`/`line`
  shapes + a `rounded` boolean → `--square` via `compoundVariants`; `rectangle` is the base).
- **Two deliberate divergences from the Badge/Spinner precedent**: (1) `width`/`height` are no longer
  Tailwind classes — they're CSS length values applied as logical inline styles (`inlineSize`/
  `blockSize`), alongside `aspectRatio`; the skin owns only the look, not dimensions. (2) Under
  `prefers-reduced-motion` the shimmer is **removed** (non-essential decorative motion — the block
  alone conveys "loading"), unlike the Spinner whose essential motion only slows.
- 5-level tests (component + resolver), co-located README, `Reference/Skeleton` story. Stale Tailwind
  snapshot dropped. `SkeletonShape` exported from both barrels (parity with `SpinnerSize`).
- **/review** ran → verdict `ready`. 8 fixes applied (order-independent `--square` selector via a
  compound `.ui-skeleton--line.ui-skeleton--square`; `--ui-skeleton-shimmer-direction` var; RTL
  `:dir(rtl)::before { animation-direction: reverse }`; `Readonly<SkeletonProps>`; `SkeletonShape`
  exports ×2; resolver no-op comments). Discarded false-positives: import-order (lint green, identical
  to Badge/Spinner), `--color-white-80` "missing" (it exists in tokens), inline-style-object
  over-memoization (presentational atom, no `memo` boundary).

### 2026-06-10 — Spinner migrated + doc-debt backfill + storybook-state fix

- **Doc debt cleared** for the already-migrated Button family: co-located `README.md` added for
  **Button** + **Badge** (`c76e217`), then **LinkButton** + **NextLinkButton** (`2c414a7`). Rule
  refined with the dev: the README is **post-migration** — written once a component is migrated, whatever
  it is. `IconButton`'s README is therefore deferred until IconButton itself is migrated (still Tailwind).
- **Spinner migrated** to the native skin (`77262f5`), **now with `sm`/`md`/`lg` sizes** (dev request,
  like Button): `.ui-spinner` BEM skin (`@layer`, `--ui-spinner-*` override vars, headless
  `currentColor` ring, logical props, `@keyframes` inside the layer, `prefers-reduced-motion` slows the
  spin), `spinnerVariants` CVA resolver (md = base), `Spinner` extends `ComponentProps<'div'>` with an
  overridable `aria-label` + `role="status"`. 5-level tests (component + resolver), co-located README,
  stale Tailwind snapshot dropped. Story added under `Reference/Spinner` (`a0a6c2b`).
- **/review** ran → verdict `ready`. 4 fixes applied (export `SpinnerSize` from the barrel +
  `Spinner/index.ts`; `--ui-spinner-radius` var for Badge parity; track derived from
  `--ui-spinner-indicator`; keyframes moved inside `@layer`). Discarded false-positives: JSDoc/`Readonly<>`
  findings that contradict the validated Badge pattern; reduced-motion "stop" (a spinner is _essential_
  motion, WCAG-exempt); border-width tokenisation (deliberate literal, Badge precedent).
- **Stale docs corrected** (`61efd07`): CLAUDE.md + `architecture.md` wrongly listed every
  `apps/storybook-*` as an empty scaffold — **`storybook-react` is set up** (Storybook 10 + React-Vite,
  stories in `apps/storybook-react/stories/reference/*.stories.tsx`, preview loads tokens + skin, run via
  `pnpm storybook:ref`). Only `angular`/`vuejs`/`web-component` remain empty scaffolds.

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
