---
paths:
  - "packages/styles/**"
  - "packages/tokens/**"
  - "packages/variants/**"
---
# Known issues — tokens and skin API

> Slice of `.claude/known-issues.md` (the index). Loads when the skin, the tokens or the resolvers are touched.

- **Police serif par défaut : le DS ne livre AUCUN reset global (rappel, élargi 2026-10-08)** —
  chaque bloc de skin déclare sa propre `font-family` ; tout texte brut **hors** d'un bloc retombe
  sur le serif du navigateur (Times New Roman). Déjà connu pour la `Card` ; `drawer.css`,
  `bottom-sheet.css` et `modal.css` l'avaient oublié → corrigé. **Côté Storybook** le canvas n'avait
  pas non plus de police de base, donc tout le décor des stories (libellés `<strong>`, légendes)
  était en serif : ajout de `.storybook/preview-base.css` qui pose `--font-inter` sur `.sb-show-main`
  — c'est le **rôle de l'app hôte**, pas du DS, et c'est documenté comme tel dans le fichier.
  **Règle pour un nouveau bloc** : si du texte brut peut y atterrir, poser `--ui-<bloc>-font-family`.
- **Les tokens ne sont PAS en OKLCH, contrairement à `CLAUDE.md` (relevé 2026-10-09)** — REPO-136 — les sources
  DTCG **et** la sortie CSS sont en **hexadécimal** (`#ffffff`, `#6b6b6b`). La ligne « Style
  Dictionary (OKLCH, DTCG) » de `rules/architecture.md` et de `CLAUDE.md` est fausse. À corriger —
  et à trancher séparément : passer réellement en OKLCH aurait du sens (dégradés perceptuellement
  uniformes, meilleur comportement d'une aire 2D de color picker).
- **API des coins (FAIT 2026-10-11)** — chaque radius du skin est `--ui-<bloc>-radius` + quatre
  coins LOGIQUES optionnels, NON déclarés, qui retombent dessus :
  `border-start-start-radius: var(--ui-<bloc>-radius-start-start, var(--ui-<bloc>-radius))`.
  21 skins, testé en navigateur (Card : un coin, le bord du haut, RTL). Règle pour un nouveau bloc
  dans `patterns-ui.md`. **Formes rondes par nature** (avatar, spinner, thumbs, points du dropdown) :
  UNE var sur `--radius-full`, SANS coins (un coin isolé les déformerait ; relevé en review), jamais
  `sm`/`md`/`lg`, pour qu'un thème « coins carrés » ne les équarrisse pas. Parité vérifiée par
  `packages/styles/test/radius-api.test.ts` (82 déclarations de coin). **Pilules** (Badge, ProgressBar, piste du Slider, IconButton) : rondes pour
  l'instant, surchargeables (choix dev). `dropdown.css` : le `9999px` en dur est devenu
  `--ui-dropdown-dot-radius`. `progress-bar.css` `border-radius: inherit` : légitime, ne pas toucher.
  **Valeur par défaut** : les valeurs actuelles (4–6px) restent ; le « zéro » ira dans un thème,
  chantier des thèmes à venir (voir `next.md`).
- **Dotted spacing tokens are dash-ified in the native CSS output (2026-07-16)**: the `css/variables-flat`
  format in `sd.config.js` replaces `.` with `-`, so `spacing.0.5` emits **`--spacing-0-5`** (referenceable
  via `var()`), `2.5`→`--spacing-2-5`, etc. The **Tailwind** `@theme` output KEEPS the dots
  (`--spacing-0.5`) to match Tailwind's `p-0.5` utility convention → the two outputs diverge by design.
  Use `var(--spacing-0-5)` in the skin (badge/listbox do). Was previously worked around with rem literals.
- **`ui-typography--gutter-bottom` uses a hardcoded `0.35em`** — TOKENS-139 (commented MUI parity, em-relative so it scales with the variant). No token for it; tokenize later if a per-theme gutter is wanted.
- **`--color-focus` (ex-`ring`) is `neutral.500`** (#6b6b6b), chosen so the `:focus-visible` outline meets WCAG 1.4.11 (≥3:1) on BOTH a white background (~5.3:1) and the dark `ghost-dark` surface (~3.4:1). Don't lighten it back to `neutral.400` (fails on white).
- **Radius scale capped at 6px (deliberate)** — superseded by the themes: the white-label base goes to 0, TOKENS-124: `--radius-sm` stays 4px, but `default/md/lg/xl/2xl/3xl` are ALL flattened to 6px (0.375rem) in `tokens/radius.json` — dev decision "nothing rounder than 6px". The scale is intentionally degenerate above `sm`. Card + Skeleton corners (on `lg`) are therefore 6px. Don't reintroduce 8/12/16px radii.
- **Colour roles renamed (2026-10-13)** : `--color-<ce qu'on peint>-<rôle>` (`surface`, `text-secondary`, `hover`, `border-strong`, `focus`…), plus de `foreground`/`muted`/`accent`/`card`. Skin = rôles seulement, sauf le color picker (invariant). Garde : `styles/test/color-roles.test.ts`. Un thème redéfinit les rôles, JAMAIS l'échelle de gris.
- **`--color-border-strong` (neutral.450 #949494) = every control boundary** (field, outline button, outline badge): neutral.300 is only ~1.48:1 on white (fails WCAG 1.4.11 ≥3:1); 450 is the lightest grey clearing 3:1. The outline Button's latent gap (it read neutral.300) closed with the 2026-10-13 role rename.
