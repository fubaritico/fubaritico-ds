---
paths:
  - "packages/styles/**"
  - "packages/tokens/**"
  - "packages/variants/**"
---
# Known issues — tokens and skin API

> Slice of `.claude/known-issues.md` (the index). Loads when the skin, the tokens or the resolvers are touched.

- **Serif by default: the DS ships NO global reset (reminder, widened 2026-10-08)** — every skin block declares
  its own `font-family`; any raw text **outside** a block falls back to the browser's serif (Times New Roman).
  Known for the `Card`; `drawer.css`, `bottom-sheet.css` and `modal.css` had forgotten it → fixed. **On the
  Storybook side** the canvas had no base font either, so all the stories' decor (`<strong>` labels, captions)
  was serif: `.storybook/preview-base.css` sets `--font-inter` on `.sb-show-main` — the **host app's role**,
  not the DS's, documented as such in the file. **Rule for a new block**: if raw text can land in it, set
  `--ui-<block>-font-family`.
- **The tokens are NOT in OKLCH, unlike what `CLAUDE.md` says (found 2026-10-09)** — REPO-136 — the DTCG
  sources **and** the CSS output are **hexadecimal** (`#ffffff`, `#6b6b6b`). The line « Style Dictionary
  (OKLCH, DTCG) » of `rules/architecture.md` and `CLAUDE.md` is wrong. To fix — and to settle separately: a
  real move to OKLCH would make sense (perceptually uniform ramps, a better 2D area in the color picker).
- **The corner API (DONE 2026-10-11)** — every radius of the skin is `--ui-<block>-radius` + four optional
  LOGICAL corners, NOT declared, falling back to it:
  `border-start-start-radius: var(--ui-<block>-radius-start-start, var(--ui-<block>-radius))`. 21 skins,
  browser-tested (Card: one corner, the top edge, RTL). Rule for a new block in `patterns-ui.md`. **Shapes
  round by nature** (avatar, spinner, thumbs, the dropdown's dots): ONE var on `--radius-full`, NO corners (a
  lone corner would deform them; found in review), never `sm`/`md`/`lg`, so a « square corners » theme does
  not square them. Parity checked by `packages/styles/test/radius-api.test.ts` (82 corner declarations).
  **Pills** (Badge, ProgressBar, the Slider's track, IconButton): round for now, overridable (the dev's
  choice). `dropdown.css`: the hard-coded `9999px` became `--ui-dropdown-dot-radius`. `progress-bar.css`
  `border-radius: inherit`: legitimate, leave it. **Default value**: the current values (4–6px) stay; the
  « zero » goes into a theme (TOKENS-124).
- **Dotted spacing tokens are dash-ified in the native CSS output (2026-07-16)**: the `css/variables-flat`
  format in `sd.config.js` replaces `.` with `-`, so `spacing.0.5` emits **`--spacing-0-5`** (referenceable
  via `var()`), `2.5`→`--spacing-2-5`, etc. The **Tailwind** `@theme` output KEEPS the dots
  (`--spacing-0.5`) to match Tailwind's `p-0.5` utility convention → the two outputs diverge by design.
  Use `var(--spacing-0-5)` in the skin (badge/listbox do). Was previously worked around with rem literals.
- **`ui-typography--gutter-bottom` uses a hardcoded `0.35em`** — TOKENS-139 (commented MUI parity, em-relative so it scales with the variant). No token for it; tokenize later if a per-theme gutter is wanted.
- **`--color-focus` (ex-`ring`) is `neutral.500`** (#6b6b6b), chosen so the `:focus-visible` outline meets WCAG 1.4.11 (≥3:1) on BOTH a white background (~5.3:1) and the dark `ghost-dark` surface (~3.4:1). Don't lighten it back to `neutral.400` (fails on white).
- **Radius scale capped at 6px (deliberate)** — superseded by the themes: the white-label base goes to 0, TOKENS-124: `--radius-sm` stays 4px, but `default/md/lg/xl/2xl/3xl` are ALL flattened to 6px (0.375rem) in `tokens/radius.json` — dev decision "nothing rounder than 6px". The scale is intentionally degenerate above `sm`. Card + Skeleton corners (on `lg`) are therefore 6px. Don't reintroduce 8/12/16px radii.
- **Colour roles renamed (2026-10-13)**: `--color-<what it paints>-<role>` (`surface`, `text-secondary`,
  `hover`, `border-strong`, `focus`…), no more `foreground`/`muted`/`accent`/`card`. The skin reads roles only,
  except the color picker (invariant). Guard: `styles/test/color-roles.test.ts`. A theme redefines the roles,
  NEVER the grey scale.
- **`--color-border-strong` (neutral.450 #949494) = every control boundary** (field, outline button, outline badge): neutral.300 is only ~1.48:1 on white (fails WCAG 1.4.11 ≥3:1); 450 is the lightest grey clearing 3:1. The outline Button's latent gap (it read neutral.300) closed with the 2026-10-13 role rename.
