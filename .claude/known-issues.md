# Known Issues

Put here the know issues to avoid cluttering the context window.

- **Listbox = primitives VISUELLES (`ListboxList`/`ListboxItem`), pas un widget (2026-07-16)** : elles
  portent le look uniquement ; **l'ARIA/keyboard/`aria-activedescendant` appartient au composeur**
  (`Menu`/`Typeahead`). `ListboxItem` rend `role="option"` + `aria-selected={isSelected}` **par défaut**,
  **overridable via rest** (Typeahead passe `aria-selected={isActive}`). **Passer `variant` aux DEUX**
  (liste ET items) — le `--dark` est un modifier d'ÉLÉMENT (choix flat-selector assumé, pas cascade block).
  États = échelle neutral (zéro alias shadcn) ; échelle d'emphase **selected < hover < active** ; gap 2px
  entre items (flex `gap`, ne touche pas le padding/texte). Variante dark = primitives neutral (pas de
  tokens on-dark encore). Resolver : `state` mono-axe (active > selected > default) ; `:where(:not(--disabled))`
  garde active/selected. Voir [[token-neutral-scale-role-vars]].
- **Badge `canTruncate` (2026-07-16)** : opt-in (défaut `false`) ; wrappe le label dans `.ui-badge__label`
  (ellipsis) SEULEMENT si `true`, icône reste visible ; troncature **visuelle** (texte complet reste dans
  le DOM, lu par les lecteurs d'écran). Affordance survol = viendra avec la Tooltip.

- **Namespace skin DataTable = `ui-data-table` (2026-07-10)** : le BEM **block `.ui-data-table` est sur la
  CONTAINER (la Card)**, pas sur le `<table>` — il porte tous les `--ui-data-table-*` vars pour que TOUT
  descendant (y compris la toolbar/footer HORS `<table>`) en hérite. Le `<table>` lui-même = l'élément
  **`.ui-data-table__table`** (box-model/border-collapse/layout). Émis par : `Table` primitive
  (`UI_DATA_TABLE_TABLE_CLASS` sur le `<table>`) + `DataTable`/`DataTableVirtualized` (`UI_DATA_TABLE_CLASS`
  sur `<Card className>`). Constantes dans `variants/src/table.ts`, parité testée. **Ne PAS remettre les
  vars sur le `<table>`** (les siblings toolbar/footer ne les verraient plus → vars grisées).
- **Custom props n'héritent qu'aux descendants** : un `--ui-*` component-var doit vivre sur un ANCÊTRE de
  tous ses consommateurs. Si des éléments hors `<table>` (toolbar/footer) l'utilisent, la var va sur le
  block-conteneur, jamais sur le `<table>` (leçon du refactor `ui-data-table`).
- **Ordre de peinture des tables : cellules AU-DESSUS des lignes** → une bordure sur `<tr>` est **repeinte
  et masquée** par un fond de cellule opaque. Corollaire : les filets d'en-tête (cellules `<th>` à fond
  blanc opaque) vont sur **`.ui-data-table__head`** (les cellules), pas sur le `<tr>`.
- **`border-collapse: collapse` + `<thead>` sticky : bordures des cellules NON peintes** (bug navigateur
  connu) → le filet header/corps est un **`box-shadow` inset** sur `.ui-data-table__head`, pas une
  `border`. Aussi : en `border-collapse: separate` les bordures `<tr>` sont **ignorées** (spec) ; c'est
  `collapse` qui les honore (d'où `border-collapse: collapse` sur `.ui-data-table__table`).
- **`:has([role=checkbox])` NE matche PAS un `<input type=checkbox>` natif** (rôle checkbox implicite, pas
  d'attribut `role`) → utiliser **`:has(input[type=checkbox])`** (colonne select carrée/flush).
- **`DropdownFilter` : gardé, PAS mort** — c'est une **brique composable** (comme toutes les cells), juste
  non câblée dans la config d'exemple. NE PAS la supprimer sous prétexte qu'aucune config ne l'appelle.
  Décision de câblage (`leftActions`) à venir.
- **`cn` vit dans `DataTable/utils/cn.ts`** + `normalizeTimestamp` + `formatDuration` dans `utils/` ;
  `ui/` n'existe plus. Les primitives importent `cn` via `../../../utils`.
- **Pagination = chrome, PAS dans `<tfoot>` (décidé 2026-07-15)** : `TableFooterContent` (pagination) reste
  un `<div>` frère HORS du `<table>` (donc hors de la zone de scroll → épinglé en bas gratuitement). La
  primitive `TableFooter` (`<tfoot>`) est **réservée aux lignes de synthèse/totaux de colonnes** (parité
  AG-Grid, « pinned bottom rows », phase ultérieure), PAS à la pagination. Mettre la pagination dans
  `<tfoot>` imposerait un wrapper `<tr><td colSpan>` + un collage `sticky bottom` (gotcha border-collapse)
  pour zéro gain visible. **Ne PAS « câbler » `TableFooter` sur la pagination.**

- **Avatar candidates throw outside `Avatar.Fallback`**: it's a full compound (no standalone mode) — the resolver access hooks (`useAvatarResolverActions/State`) throw if a candidate (`Avatar.Image/Initials/Icon`) is used without a surrounding `Avatar.Fallback`. By design.
- **`react/jsx-no-leaked-render` is enforced (eslint, error)**: `{value && <JSX/>}` is forbidden when `value` is non-boolean (empty-string / zero leak) → use a ternary (`cond ? <JSX/> : null`) or coerce (`!!value &&`). Gotcha: `Boolean(src)` does **not** narrow the type — for `src: string | null` keep the ternary `src ? … : null` (narrows `src` AND avoids the leak); `Boolean(src) &&` loses the narrowing → TS error on `src={src}`.
- **`--ui-avatar-line-height`**: Avatar exposes an override var for the initials line-height (parity with the rest of the skin's typographic vars); defaults to `var(--font-line-height-none)` (= 1).
- **Dotted spacing tokens are dash-ified in the native CSS output (2026-07-16)**: the `css/variables-flat`
  format in `sd.config.js` replaces `.` with `-`, so `spacing.0.5` emits **`--spacing-0-5`** (referenceable
  via `var()`), `2.5`→`--spacing-2-5`, etc. The **Tailwind** `@theme` output KEEPS the dots
  (`--spacing-0.5`) to match Tailwind's `p-0.5` utility convention → the two outputs diverge by design.
  Use `var(--spacing-0-5)` in the skin (badge/listbox do). Was previously worked around with rem literals.
- **`packages/styles` has no lint/type-check/test scripts** (CSS-only) → `lerna run` and CI silently skip it. Acceptable for now; add `stylelint` later if we want CSS coverage in the quality gate.
- **eslint typed-lint poison from empty-src `stencil/tsconfig.json`**: the base `project: ['./packages/*/tsconfig.json']` glob loads stencil's build tsconfig, which has no inputs (TS18003). Any package **alphabetically after `stencil`** that relies on the base glob (e.g. `variants`) crashes with "Unable to parse the specified tsconfig". Fix per package = a scoped eslint override pointing at its own tsconfig (see the `variants` override in `eslint.config.js`, mirroring the `stencil` one). Real fix later: migrate the root config to `projectService: true`, or give stencil a non-empty tsconfig.
- **`color.semantic.badge.primary` token still references amber** (not blue) — unused by the migrated Badge default (which uses `--color-primary`), but inconsistent; arbitrate later (follow primary, or rename to a distinct accent).
- **Harness "plan mode" green overlay can persist** in the prompt (cosmetic, harness-side). Exit with Shift+Tab / Esc. We don't use plan mode — plans live in `files/plans/`.
- **commitlint `subject-case`**: the commit subject must be **lowercase** — a subject starting with a PascalCase word (e.g. `Typography uses…`) is rejected. Write `use … on Typography` instead.
- **`ui-typography--gutter-bottom` uses a hardcoded `0.35em`** (commented MUI parity, em-relative so it scales with the variant). No token for it; tokenize later if a per-theme gutter is wanted.
- **`--ui-spinner-thickness` is derived from the size** (`calc(var(--ui-spinner-size) / 8)`, ≈12.5% of the diameter) so the ring scales with every size automatically and the size modifiers only set `--ui-spinner-size`. No border-width token needed; consumers can still override the component var directly.
- **Spinner `prefers-reduced-motion` slows (2s) rather than stops** the spin — deliberate: a spinner is _essential_ motion (conveys "busy"), so it's exempt from WCAG 2.3.3, and a fully-stopped ring reads as frozen/broken. Revisit if a static/pulse fallback is preferred.
- **Skeleton vs Spinner reduced-motion are intentionally OPPOSITE**: Skeleton **removes** the shimmer under `prefers-reduced-motion` (the placeholder block alone conveys "loading" → the shimmer is non-essential decorative motion), whereas the Spinner only slows (essential motion). Don't "harmonize" them.
- **IconButton is a skin EXTENSION of Button, not a standalone block**: `.ui-icon-button` is always MIXED onto `.ui-button` (`class="ui-button ui-button--ghost ui-icon-button"`) — it reuses Button's colours/box-sizing/font-family and only adds the icon-fitting geometry. `icon-button.css` MUST be `@import`ed **after** `button.css` in `native-styles.css` so its single-class rules win the geometry props they override within `@layer ui.components`. `ghost-dark` is an IconButton-only variant that redefines the reused `--ui-button-*` vars; it reaches into the **primitive** neutral scale (`neutral-400/800/0`) because no semantic on-dark token exists yet — `TODO(tokens)` in `icon-button.css` to mint `--color-on-dark-*` WITH the Drawer/bottom-sheet work.
- **`--color-ring` is `neutral.500`** (#6b6b6b), chosen so the `:focus-visible` outline meets WCAG 1.4.11 (≥3:1) on BOTH a white background (~5.3:1) and the dark `ghost-dark` surface (~3.4:1). Don't lighten it back to `neutral.400` (fails on white).
- **Skeleton has no intrinsic size**: `width`/`height`/`aspectRatio` are CSS length values applied as logical inline styles (`inlineSize`/`blockSize`) — NOT Tailwind classes anymore. Without them the block collapses to 0 and is invisible (documented in its README).
- **Card slots throw outside `<Card>`**: `Card.Header/Body/Footer` read a marker context via a guarded hook (`useCardContext`) and **throw** if rendered without a surrounding `<Card>`. By design (slots aren't general-purpose padded boxes); the context carries no state — it only enforces composition (Avatar-style discipline).
- **Card root is intentionally UNPADDED**: a bare `<Card>text</Card>` lets the text touch the edges. Padding lives on the slots so a direct media child (`<img>`) can sit edge-to-edge (clipped by `overflow:hidden` to the radius). Wrap content in `Card.Body`. Documented in the Card README.
- **Card has NO region dividers**: `Card.Header/Footer` carry no separating border (removed on dev request) — regions are grouped by spacing only. `header` = tight column (title), `footer` = action row, `body` = grows (`flex:1`). Don't reintroduce borders.
- **`.ui-card` sets `--ui-card-font-family` (Inter)**: without it, raw text inside a Card falls back to the browser serif default (Times New Roman). Composing `Typography` inside is still the recommended path; the font var only covers loose text.
- **Typography `body` variant REMOVED → `body1`/`body2`**: MUI parity — `body1` (16px, the default) and `body2` (14px, compact). `variant="body"` no longer type-checks. Use `body2` for compact contexts (e.g. a Card body under a `h6` title, so the body doesn't read larger than the title).
- **Radius scale capped at 6px (deliberate)**: `--radius-sm` stays 4px, but `default/md/lg/xl/2xl/3xl` are ALL flattened to 6px (0.375rem) in `tokens/radius.json` — dev decision "nothing rounder than 6px". The scale is intentionally degenerate above `sm`. Card + Skeleton corners (on `lg`) are therefore 6px. Don't reintroduce 8/12/16px radii.
- **Input `size` repurposes the native HTML attribute**: `InputProps extends Omit<ComponentProps<'input'>, 'size'>` — `size` is the DS axis (`sm`/`md`/`lg`), matching every other component. The native `size` (character width) is intentionally **removed**; control width via CSS. (Was `inputSize` pre-migration — renamed during the migration for DS consistency.)
- **`.ui-field` is a GENERIC reusable block (its own `field.css`)**: the field layer (label + control + message) is `.ui-field` / `.ui-field__label` / `.ui-field__message` (+ `--error`), NOT `ui-input-field`. It lives in `packages/styles/src/styles/field.css` (imported BEFORE `input.css`) so Select/Textarea/Checkbox can reuse it without pulling the Input control skin. Resolver `inputFieldVariants` (in `variants/src/input.ts`) emits `ui-field`; reuse it (or add a sibling) for future controls.
- **`--color-input-border` (neutral.450 #949494) is Input-scoped AA border**: minted because `--color-input` (neutral.300 #d4d4d4) is only ~1.48:1 on white (fails WCAG 1.4.11 ≥3:1). neutral.450 is the lightest grey that clears 3:1 (~3.0:1). The shared `--color-input` is **left at neutral.300** — Button's `outline` variant borrows it and has the **same latent 1.4.11 gap** (address when revisiting Button). New primitive `neutral.450` slots between 400/500 purely as the AA-minimum control-border shade.
- **Input error state is NOT colour-only**: an error (`messageType="error"` + a non-empty `message`) recolours the message to `--color-destructive-hover` (red.600 #dc2626, ~5.9:1 — red.500 #ef4444 is only 3.73:1, fails AA text) AND prepends an `ExclamationCircle` icon (aria-hidden) so it reads by icon+text, not colour (WCAG 1.4.1). The border/ring keep red.500 (#ef4444, 3.73:1 ≥3:1 OK for a UI-component boundary). `messageType="error"` with no `message` does nothing (no `aria-invalid`, no styling).
- **Input `role="alert"` is conditionally rendered** (alert `<p>` appears with the error): this matches MUI/react-aria FormHelperText and is conformant; a few screen readers may under-announce a live region injected already-populated. Deliberate (no always-present `sr-only` container) — revisit only if real SR testing shows a miss.
- **Rating is display-only + grayscale by design**: `role="img"` + computed `aria-label` ("Rating: X out of Y", English default — pass `aria-label` to localise); the SVG/stars are `aria-hidden`. NO interaction/keyboard (a settable rating would be a separate interactive control; dev's Phase-2 shape = half-step clickable stars + callbacks, nothing more). NO traffic-light: fill = `--color-rating-filled` (neutral.900, repointed from amber.400) on `--color-rating-empty` (neutral.300); the score is read from the fill proportion + the number (never colour → 1.4.1).
- **Rating `--color-rating-empty` (neutral.300, ~1.48:1 on white) is a DELIBERATE dev choice**: a review flagged it vs WCAG 1.4.11 (≥3:1 for graphical objects), but it's NOT treated as a blocker because (a) Rating is display-only, not a control boundary; (b) the score is redundantly conveyed by the high-contrast fill (neutral.900 ~17:1) AND the numeric value; (c) filled-vs-empty contrast is huge so the proportion is perceivable. If a stronger empty/track is wanted later, repoint `--color-rating-empty` to neutral.450 (the AA-min control shade) — scoped, no other consumer.
- **Rating stars fill is RTL-safe via `--ui-rating-fill`**: the component passes ONLY the fill fraction as the `--ui-rating-fill` custom property (a 0–100% length); the skin owns the `clip-path` DIRECTION (LTR clips inline-end, a `:dir(rtl)` rule clips the other physical edge). Don't move the clip-path back inline (it was physical `inset(0 …% 0 0)` → broke RTL). The SVG ring geometry (svg px / stroke / dash arrays) stays inline (Skeleton precedent — skin owns look, not geometry).
- **Storybook (storybook-react) consumes the BUILT `reference` dist, not src** (exports map → `dist/*`, no Vite alias to source). After changing a `reference` component you MUST rebuild it (the root `pnpm type-check`/`lint`/`test` gate does it via Nx `^build`) AND restart Storybook — Vite does NOT hot-reload a workspace dep's `dist`. Symptom: story shows stale behaviour despite saved edits.
- **React `<Profiler>` does NOT fire in a production Storybook build** (needs the `react-dom/profiling` build). For prod perf measurement rely on the plain `debugTimings` (`performance.now` + `console.warn`, the `[DataTable] selection: …ms` line) + Chrome's `[Violation] 'click' handler took …ms` long-task warning. The `[DataTable] render: …ms` Profiler lines only appear in dev.
- **DataTable select-all cost is TanStack O(N) (materializes a 150k-key `rowSelection`), so prod ≈ dev** — it's plain-JS data-structure work, not React render, so dev-mode inflation doesn't apply (don't expect a prod speedup). `startTransition` lowers the blocking time but RAISES the perceived total (two render passes) → don't default it for select-all-and-wait. O(1) needs the external "flag + exceptions" selection store (`files/analysis/storage-port-design.md`), reserved for the extreme (millions / Web Workers) — delegate only when necessary.
