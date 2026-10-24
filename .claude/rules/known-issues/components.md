---
paths:
  - "packages/reference/src/components/**"
  - "packages/styles/src/styles/**"
  - "packages/variants/src/**"
  - "apps/storybook-react/stories/**"
---
# Known issues — the components

> Slice of `.claude/known-issues.md` (the index). Loads when a component, its skin, its resolver or its story is touched.

- **Listbox = VISUAL primitives (`ListboxList`/`ListboxItem`), not a widget (2026-07-16)**: they carry the
  look only; **the ARIA/keyboard/`aria-activedescendant` belong to the composer** (`Menu`/`Typeahead`).
  `ListboxItem` renders `role="option"` + `aria-selected={isSelected}` **by default**, **overridable through
  rest** (Typeahead passes `aria-selected={isActive}`). **Pass `variant` to BOTH** (list AND items) — `--dark`
  is an ELEMENT modifier (a flat-selector choice, assumed, not a block cascade). States = the neutral scale
  (zero shadcn alias); emphasis ladder **selected < hover < active**; 2px gap between items (flex `gap`, leaves
  padding/text alone). Dark variant = neutral primitives (no on-dark tokens yet). Resolver: a single `state`
  axis (active > selected > default); `:where(:not(--disabled))` guards active/selected. See
  [[token-neutral-scale-role-vars]].
- **Badge `canTruncate` (2026-07-16)**: opt-in (default `false`); wraps the label in `.ui-badge__label`
  (ellipsis) ONLY when `true`, the icon stays visible; truncation is **visual** (the full text stays in the
  DOM, read by screen readers). The hover affordance came with the Tooltip (`TruncatedText`).
- **`.ui-card__footer` had no `justify-content` (fixed 2026-10-08)** — it fell back to `flex-start`, so the
  actions sat at the start by accident rather than by choice. The footer now carries an `align` axis
  (`start` / `center` / `end` / `between`), **`center` by default** (the dev's choice). Corollary: `Card.Footer`
  **IS** the action row — do not wrap the buttons in a `div`: it makes them one flex child and cancels both
  gap AND alignment.
- **`--ui-slider-track-image` is the seam of the color picker (2026-10-09)** — a hue, alpha or channel slider
  **is not one more component**: it is the `Slider` with a track background and `imaged: true` (which hides the
  filled part). Do not create a separate `ColorSlider`.
- **NEVER a `display` on a `<dialog>` outside `[open]` (trap met TWICE, 2026-10-08)** — the browser hides a
  closed dialog through the UA rule `dialog:not([open]) { display: none }`. Any author `display` (skin **or**
  inline style) overrides it, and the dialog stays on screen for good. Symptoms seen: « tous les drawers sont
  ouverts au démarrage », « ils s'empilent dans le showcase », « le bouton close est inactif » (it worked, the
  panel never went away); on the Modal side, the story injected `style={{ display: 'grid' }}` to centre and
  broke the whole closed state. **Rule**: a dialog's layout goes on `.ui-<block>[open]`, never on the base, and
  **never** through a consumer's `style`/`className`. To reposition, expose a var (`--ui-modal-place-items`).
  Concerns `.ui-modal`, `.ui-drawer` and `.ui-popover`.
  **[GUARDED 2026-10-11]** `styles/state-guards.css` (`@layer ui.reset`, `display: none !important` on the three
  closed blocks): in layers, important reverses, the first layer wins and beats even a normal inline `style`.
  The trap can no longer come from a consumer. Covered by the Modal/Drawer/Popover browser tests (an
  unlayered class + an inline `style`), the Popover's exit fade included (transitions run before the
  important). The rule « no `display` on the base » still holds for the skin itself.
- **A `<dialog>`'s backdrop reports ITSELF as the click target (2026-10-08)** — so `e.target === dialog` does
  NOT tell a backdrop click from a click on the panel's own background. It only works when the dialog covers
  the viewport and the panel is a child (the `Modal` case). When the dialog **IS** the panel (the `Drawer`
  case), it takes a geometric test against its bounding box. Hence `useNativeDialog`'s option
  `backdropArea: 'self' | 'outside'`. In tests jsdom measures everything as zero: stub
  `getBoundingClientRect` and click through `user.pointer({ coords })`.
- **Top-layer recipe (Tooltip, Dropdown, Typeahead, BottomSheet, Toast)**: `popover="manual"` rendered IN PLACE
  (never a portal by default — on `body` it ends up inert under a Modal), `showPopover()` in a callback ref, a
  browser test « open inside a Modal ». **Anchored** blocks (Dropdown, Typeahead): a per-instance CSS anchor
  `--ui-<block>-anchor` (set on the root AND the surface), placement under `@supports (position-anchor: …)`; the
  Tooltip is placed in JS, the BottomSheet by its edge. The Toast's page-wide stack is portalled INTO the open
  modal dialog (outside it, it is inert). A portalled menu loses the block's vars →
  `.ui-x, body > .ui-x__menu { vars }`.
- **React propagates `close` through the React tree** (the DOM event does not bubble): a nested `<dialog>`
  closed its parent. `useNativeDialog.handleClose` ignores `target !== currentTarget` — every new dialog goes
  through this hook.
- **A popover has a `::backdrop` too**: the scrim of a dialog that can be a popover goes on
  `:modal::backdrop`, otherwise the non-modal surface darkens the page.
- **Chromium makes a scrolling list reachable by Tab**: in a combobox (focus in the field), `tabIndex={-1}` on
  the list, otherwise Tab enters it instead of leaving the component.
- **The light Tooltip's border: a WCAG 1.4.11 exception, ASSUMED (2026-10-21)**: `--ui-tooltip-border-color` =
  `--color-border` (neutral.200, ~1.2:1 on white). A tooltip is not a control, its text stays legible and the
  shadow (`--shadow-lg`) already detaches the bubble. The dev's choice. If a firmer outline is wanted:
  `--color-border-strong` (scoped, no other consumer). Arrow = two triangles (`::before` outline, `::after`
  fill); `--ui-tooltip-arrow-size` = `ARROW_SIZE` (browser test); forced colours: `forced-color-adjust: none`
  on the triangles, otherwise they become rectangles.
- **`ArrowUpDown`'s dimmed chevron: a WCAG 1.4.11 exception, ASSUMED (2026-10-08)**:
  `--ui-sort-arrows-dimmed-opacity: 0.5` brings `--color-text-secondary` (neutral.500) to ~2.05:1 on white,
  under the 3:1 floor of graphical objects. **Accepted, not a hole**: the active direction is carried
  **redundantly** by the other chevron at full opacity (~5.3:1) AND by the button's `aria-label`
  (`Sort <col> (ascending|descending)`) — the dimmed chevron carries no information needed to understand.
  Same reasoning as the `Rating`'s empty track. If a firmer contrast is wanted one day, raise
  `--ui-sort-arrows-dimmed-opacity` to ~0.65–0.7 (an override var, scoped). **Do NOT « fix » it on your own** —
  it is a deliberate visual choice.
- **Avatar candidates throw outside `Avatar.Fallback`**: it's a full compound (no standalone mode) — the resolver access hooks (`useAvatarResolverActions/State`) throw if a candidate (`Avatar.Image/Initials/Icon`) is used without a surrounding `Avatar.Fallback`. By design.
- **`react/jsx-no-leaked-render` is enforced (eslint, error)**: `{value && <JSX/>}` is forbidden when `value` is non-boolean (empty-string / zero leak) → use a ternary (`cond ? <JSX/> : null`) or coerce (`!!value &&`). Gotcha: `Boolean(src)` does **not** narrow the type — for `src: string | null` keep the ternary `src ? … : null` (narrows `src` AND avoids the leak); `Boolean(src) &&` loses the narrowing → TS error on `src={src}`.
- **`--ui-avatar-line-height`**: Avatar exposes an override var for the initials line-height (parity with the rest of the skin's typographic vars); defaults to `var(--font-line-height-none)` (= 1).
- **`--ui-spinner-thickness` is derived from the size** (`calc(var(--ui-spinner-size) / 8)`, ≈12.5% of the diameter) so the ring scales with every size automatically and the size modifiers only set `--ui-spinner-size`. No border-width token needed; consumers can still override the component var directly.
- **Spinner `prefers-reduced-motion` slows (2s) rather than stops** the spin — deliberate: a spinner is _essential_ motion (conveys "busy"), so it's exempt from WCAG 2.3.3, and a fully-stopped ring reads as frozen/broken. Revisit if a static/pulse fallback is preferred.
- **Skeleton vs Spinner reduced-motion are intentionally OPPOSITE**: Skeleton **removes** the shimmer under `prefers-reduced-motion` (the placeholder block alone conveys "loading" → the shimmer is non-essential decorative motion), whereas the Spinner only slows (essential motion). Don't "harmonize" them.
- **IconButton is a skin EXTENSION of Button, not a standalone block**: `.ui-icon-button` is always MIXED onto `.ui-button` (`class="ui-button ui-button--ghost ui-icon-button"`) — it reuses Button's colours/box-sizing/font-family and only adds the icon-fitting geometry. `icon-button.css` MUST be `@import`ed **after** `button.css` in `native-styles.css` so its single-class rules win the geometry props they override within `@layer ui.components`. `ghost-dark` is an IconButton-only variant that redefines the reused `--ui-button-*` vars; it reads the inverse colour roles (`--color-surface-inverse-*`, `--color-text-on-inverse-*`).
- **Skeleton has no intrinsic size**: `width`/`height`/`aspectRatio` are CSS length values applied as logical inline styles (`inlineSize`/`blockSize`) — NOT Tailwind classes anymore. Without them the block collapses to 0 and is invisible (documented in its README).
- **Card slots throw outside `<Card>`**: `Card.Header/Body/Footer` read a marker context via a guarded hook (`useCardContext`) and **throw** if rendered without a surrounding `<Card>`. By design (slots aren't general-purpose padded boxes); the context carries no state — it only enforces composition (Avatar-style discipline).
- **Card root is intentionally UNPADDED**: a bare `<Card>text</Card>` lets the text touch the edges. Padding lives on the slots so a direct media child (`<img>`) can sit edge-to-edge (clipped by `overflow:hidden` to the radius). Wrap content in `Card.Body`. Documented in the Card README.
- **Card has NO region dividers**: `Card.Header/Footer` carry no separating border (removed on dev request) — regions are grouped by spacing only. `header` = tight column (title), `footer` = action row, `body` = grows (`flex:1`). Don't reintroduce borders.
- **`.ui-card` sets `--ui-card-font-family` (Inter)**: without it, raw text inside a Card falls back to the browser serif default (Times New Roman). Composing `Typography` inside is still the recommended path; the font var only covers loose text.
- **Typography `body` variant REMOVED → `body1`/`body2`**: MUI parity — `body1` (16px, the default) and `body2` (14px, compact). `variant="body"` no longer type-checks. Use `body2` for compact contexts (e.g. a Card body under a `h6` title, so the body doesn't read larger than the title).
- **Input `size` repurposes the native HTML attribute**: `InputProps extends Omit<ComponentProps<'input'>, 'size'>` — `size` is the DS axis (`sm`/`md`/`lg`), matching every other component. The native `size` (character width) is intentionally **removed**; control width via CSS. (Was `inputSize` pre-migration — renamed during the migration for DS consistency.)
- **`.ui-field` is a GENERIC reusable block (its own `field.css`)**: the field layer (label + control + message) is `.ui-field` / `.ui-field__label` / `.ui-field__message` (+ `--error`), NOT `ui-input-field`. It lives in `packages/styles/src/styles/field.css` (imported BEFORE `input.css`) so Select/Textarea/Checkbox can reuse it without pulling the Input control skin. Resolver `inputFieldVariants` (in `variants/src/input.ts`) emits `ui-field`; reuse it (or add a sibling) for future controls.
- **Input error state is NOT colour-only**: an error (`messageType="error"` + a non-empty `message`) recolours the message to `--color-destructive-hover` (red.600 #dc2626, ~5.9:1 — red.500 #ef4444 is only 3.73:1, fails AA text) AND prepends an `ExclamationCircle` icon (aria-hidden) so it reads by icon+text, not colour (WCAG 1.4.1). The border/ring keep red.500 (#ef4444, 3.73:1 ≥3:1 OK for a UI-component boundary). `messageType="error"` with no `message` does nothing (no `aria-invalid`, no styling).
- **Input `role="alert"` is conditionally rendered** (alert `<p>` appears with the error): this matches MUI/react-aria FormHelperText and is conformant; a few screen readers may under-announce a live region injected already-populated. Deliberate (no always-present `sr-only` container) — revisit only if real SR testing shows a miss.
- **Rating is display-only + grayscale by design** — REACT-140 (the clickable Phase-2 shape): `role="img"` + computed `aria-label` ("Rating: X out of Y", English default — pass `aria-label` to localise); the SVG/stars are `aria-hidden`. NO interaction/keyboard (a settable rating would be a separate interactive control; dev's Phase-2 shape = half-step clickable stars + callbacks, nothing more). NO traffic-light: fill = `--color-rating-filled` (neutral.900, repointed from amber.400) on `--color-rating-empty` (neutral.300); the score is read from the fill proportion + the number (never colour → 1.4.1).
- **Rating `--color-rating-empty` (neutral.300, ~1.48:1 on white) is a DELIBERATE dev choice**: a review flagged it vs WCAG 1.4.11 (≥3:1 for graphical objects), but it's NOT treated as a blocker because (a) Rating is display-only, not a control boundary; (b) the score is redundantly conveyed by the high-contrast fill (neutral.900 ~17:1) AND the numeric value; (c) filled-vs-empty contrast is huge so the proportion is perceivable. If a stronger empty/track is wanted later, repoint `--color-rating-empty` to neutral.450 (the AA-min control shade) — scoped, no other consumer.
- **Rating stars fill is RTL-safe via `--ui-rating-fill`**: the component passes ONLY the fill fraction as the `--ui-rating-fill` custom property (a 0–100% length); the skin owns the `clip-path` DIRECTION (LTR clips inline-end, a `:dir(rtl)` rule clips the other physical edge). Don't move the clip-path back inline (it was physical `inset(0 …% 0 0)` → broke RTL). The SVG ring geometry (svg px / stroke / dash arrays) stays inline (Skeleton precedent — skin owns look, not geometry).
