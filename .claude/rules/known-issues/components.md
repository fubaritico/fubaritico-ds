---
paths:
  - "packages/reference/src/components/**"
  - "packages/styles/src/styles/**"
  - "packages/variants/src/**"
  - "apps/storybook-react/stories/**"
---
# Known issues — the components

> Slice of `.claude/known-issues.md` (the index). Loads when a component, its skin, its resolver or its story is touched.

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
- **`.ui-card__footer` n'avait aucun `justify-content` (corrigé 2026-10-08)** — il retombait donc sur
  `flex-start`, et les actions se ferraient à gauche par accident plutôt que par choix. Le footer
  porte désormais un axe `align` (`start` / `center` / `end` / `between`), **`center` par défaut**
  (choix dev). Corollaire : `Card.Footer` **EST** la rangée d'actions — ne pas emballer les boutons
  dans un `div`, ça les réduit à un seul enfant flex et neutralise gap ET alignement.
- **`--ui-slider-track-image` est la couture du futur color picker (2026-10-09)** — un curseur de
  teinte, d'alpha ou de canal **n'est pas un composant de plus** : c'est le `Slider` avec un fond de
  piste et `imaged: true` (qui escamote la portion remplie). Ne pas créer de `ColorSlider` séparé.
- **JAMAIS de `display` sur un `<dialog>` hors de `[open]` (piège rencontré DEUX fois, 2026-10-08)** —
  le navigateur masque un dialog fermé via la règle UA `dialog:not([open]) { display: none }`. Toute
  déclaration `display` d'auteur (skin **ou** style inline) l'écrase, et le dialog reste affiché en
  permanence. Symptômes observés : « tous les drawers sont ouverts au démarrage », « ils s'empilent
  dans le showcase », « le bouton close est inactif » (il marchait, le panneau ne disparaissait
  jamais) ; côté Modal, la story injectait `style={{ display: 'grid' }}` pour centrer et cassait tout
  l'état fermé. **Règle** : le layout d'un dialog va sur `.ui-<bloc>[open]`, jamais sur la base, et
  **jamais** via `style`/`className` côté consommateur. Pour repositionner, exposer une var
  (`--ui-modal-place-items`). Concerne `.ui-modal`, `.ui-drawer` et `.ui-popover`.
  **[GARDÉ 2026-10-11]** `styles/state-guards.css` (`@layer ui.reset`, `display: none !important` sur
  les trois blocs fermés) : en couches, l'important s'inverse, la première couche gagne et bat même
  le `style` inline normal. Le piège ne peut plus venir d'un consommateur. Couvert par les tests
  navigateur Modal/Drawer/Popover (classe non layered + `style` inline), sortie en fondu du Popover
  comprise (les transitions passent avant l'important). La règle « pas de `display` sur la base »
  reste valable pour le skin lui-même.
- **Le backdrop d'un `<dialog>` se déclare LUI-MÊME comme cible du clic (2026-10-08)** — donc
  `e.target === dialog` ne distingue PAS un clic sur le backdrop d'un clic sur le fond propre du
  panneau. Ça ne marche que si le dialog couvre le viewport et que le panneau est un enfant (cas
  `Modal`). Quand le dialog **EST** le panneau (cas `Drawer`), il faut un test géométrique contre sa
  bounding box. D'où l'option `backdropArea: 'self' | 'outside'` de `useNativeDialog`. En test, jsdom
  mesure tout à zéro : stubber `getBoundingClientRect` et cliquer via `user.pointer({ coords })`.
- **Recette top layer (2026-10-11, Tooltip / Dropdown / Typeahead / BottomSheet)** : `popover="manual"`
  rendu EN PLACE (jamais de portal par défaut — sur `body` il finit inerte sous une Modal),
  `showPopover()` dans un callback ref, ancre CSS par instance `--ui-<bloc>-anchor` (posée sur la
  racine ET sur la surface), placement `@supports (position-anchor: …)`, test navigateur « ouvert
  dans une Modal ». Un menu portalisé perd les vars du bloc → `.ui-x, body > .ui-x__menu { vars }`.
- **React propage `close` à travers l'arbre React** (l'événement DOM ne bulle pas) : un `<dialog>`
  imbriqué fermait son parent. `useNativeDialog.handleClose` ignore `target !== currentTarget` —
  tout nouveau dialog passe par ce hook.
- **Un popover a aussi un `::backdrop`** : le voile d'un dialog qui peut être popover va sur
  `:modal::backdrop`, sinon la surface non modale assombrit la page.
- **Chromium rend une liste qui défile atteignable au Tab** : dans une combobox (focus dans le
  champ), `tabIndex={-1}` sur la liste, sinon Tab y entre au lieu de quitter le composant.
- **Bordure de la Tooltip claire : exception WCAG 1.4.11 ASSUMÉE (2026-10-21)** : `--ui-tooltip-border-color`
  = `--color-border` (neutral.200, ~1,2:1 sur blanc). Une infobulle n'est pas un contrôle, son texte
  reste lisible et l'ombre (`--shadow-lg`) détache déjà la bulle. Choix dev. Si un contour plus franc
  est voulu : `--color-border-strong` (scopé, sans autre consommateur). Flèche = deux triangles
  (`::before` contour, `::after` fond) ; `--ui-tooltip-arrow-size` = `ARROW_SIZE` (test navigateur) ;
  contraste élevé : `forced-color-adjust: none` sur les triangles, sinon ils deviennent des rectangles.
- **Chevron atténué d'`ArrowUpDown` : exception WCAG 1.4.11 ASSUMÉE (2026-10-08)** :
  `--ui-sort-arrows-dimmed-opacity: 0.5` ramène `--color-text-secondary` (neutral.500) à ~2,05:1 sur
  blanc, sous le plancher de 3:1 des objets graphiques. **Accepté, ce n'est pas un trou** : la direction
  active est portée **redondamment** par l'autre chevron à pleine opacité (~5,3:1) ET par l'`aria-label`
  du bouton (`Sort <col> (ascending|descending)`) — le chevron atténué ne porte aucune information
  nécessaire à la compréhension. Même raisonnement que la piste vide du `Rating`. Si un contraste plus
  franc est voulu un jour, remonter `--ui-sort-arrows-dimmed-opacity` à ~0,65–0,7 (var d'override,
  scopée). **Ne PAS le « corriger » d'office** — c'est un choix visuel délibéré.
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
