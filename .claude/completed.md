## Completed

The last two sessions, short, citing their tickets (what shipped lives in the Fait tickets). Older ones:
`completed-archive.md`.

### 2026-10-21 — release 0.7.0, Atlas migrated, the light Tooltip's arrow

**One span** (20:06 → 22:45, 2h39), resumed after 7 days. A new chantier.

- **0.7.0 published** through `/release minor` (the skill only starts by the dev's hand:
  `disable-model-invocation`, on purpose). Beforehand: Stencil's `components.d.ts` ignored (`5ef57f4`).
  Release `980d614`, tag `v0.7.0`, run `39654644976` (5 lines `+ @fubaritico/*@0.7.0`). Handoff written;
  **Atlas migrated the same evening** (`aef0bf1` on their side, no old name left), earlier than planned.
- **The "little thing in the whole type" of 13/10 = "tooltip"** (dictation), not the type. The light
  variant's arrow had no outline and sat 1px off (offsets in border-box, an absolute box in padding-box).
  **`76bde29` `fix(styles)`**: two triangles `::before` outline / `::after` fill (Bootstrap's technique),
  `--ui-tooltip-arrow-size` tied to `ARROW_SIZE` by a test, **forced colours** (proven in Chromium: the
  triangles became rectangles) → `forced-color-adjust: none`. Browser command `forcedColors`
  (`vitest.browser.media.ts`). A thin light border = a WCAG 1.4.11 exception, assumed (the dev).
- `known-issues.md` past 200 lines → `known-issues-datatable.md` (`4167a61`).
- **Received from Atlas**: `files/REQUEST-menu-role-from-europe-historical-atlas.md` (CARTO-122, low priority).

### 2026-10-13 — release 0.6.0, colour roles renamed (themes, step 1)

**Two spans in the log** (14:55 → 15:05; 16:51 → 18:09, ~1h30 logged — the log does not see the whole
evening), 6th day of the chantier opened on 08/10. Pushed, not published.

- **0.6.0 published** + CHANGELOGs completed (`cadca4a`) + Atlas handoff.
- **Themes plan** (`files/plans/theming.md`): white label (radius 0), `tone` (shades of one seed), `dark`
  (coloured primary); OKLCH derivation at runtime from `--theme-seed`, the L/C table taken from the dev's
  date-time-picker. A theme redefines the ROLES, never the grey scale.
- **The "muted" of 16/07 clarified by the dev**: it meant the blurry NAMES, not the semantic layer. Hence
  **`c88df0f` `feat(tokens)!`**: `roles.json` replaces semantic + aliases, `--color-<what it paints>-<role>`,
  27 skins rewired, primitives only in the color picker, guard `styles/test/color-roles.test.ts`. Resolved
  diff before/after: 5 intended shifts only (hovers 100→150, outline border 300→450, destructive text
  500→600, disabled arrow 450→400).
- **Review**: the default tooltip had turned white on white (a rewrite rule too broad) — caught;
  `text-destructive` and `fill-on-inverse*` created, `black` removed.
- **Atlas migration** written (`europe-map/MIGRATION-color-roles-from-fubaritico-ds.md`), to apply only
  with 0.7.0.
