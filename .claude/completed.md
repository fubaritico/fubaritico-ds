## Completed

Put here the completed tasks and plans to avoid cluttering the context window.

### 2026-10-21 — release 0.7.0, Atlas migré, flèche de la Tooltip claire

**Une plage** (20:06 → 22:45, 2h39), reprise après 7 jours. Nouveau chantier.

- **0.7.0 publiée** via `/release minor` (le skill ne se lance qu'à la main du dev : `disable-model-invocation`,
  voulu). Préalable : `components.d.ts` de Stencil ignoré (`5ef57f4`). Release `980d614`, tag
  `v0.7.0`, run `39654644976` (5 lignes `+ @fubaritico/*@0.7.0`). Handoff écrit ; **Atlas a migré
  le soir même** (`aef0bf1` chez eux, plus aucun ancien nom), plus tôt que prévu.
- **Le « petit truc dans tout le type » du 13/10 = « tooltip »** (dictée), pas la typo. Flèche de la
  variante claire sans contour et décalée d'1px (offsets en border-box, boîte absolue en padding-box).
  **`76bde29` `fix(styles)`** : deux triangles `::before` contour / `::after` fond (technique Bootstrap),
  `--ui-tooltip-arrow-size` lié à `ARROW_SIZE` par test, **contraste élevé** (prouvé en Chromium : les
  triangles devenaient des rectangles) → `forced-color-adjust: none`. Commande navigateur `forcedColors`
  (`vitest.browser.media.ts`). Bordure fine claire = exception WCAG 1.4.11 assumée (dev).
- `known-issues.md` au-delà de 200 lignes → `known-issues-datatable.md` (`4167a61`).
- **Reçu d'Atlas** : `files/REQUEST-menu-role-from-europe-historical-atlas.md` (CARTO-122, basse priorité).

### 2026-10-13 — release 0.6.0, rôles de couleur renommés (étape 1 des thèmes)

**Deux plages au journal** (14:55 → 15:05 ; 16:51 → 18:09, ~1h30 journalisées — le journal ne voit
pas toute la soirée), 6e jour du chantier ouvert le 08/10. Poussé, non publié.

- **0.6.0 publiée** + CHANGELOG complétés (`cadca4a`) + handoff Atlas.
- **Plan des thèmes** (`files/plans/theming.md`) : marque blanche (radius 0), `tone` (camaïeu sur
  une graine), `dark` (primary coloré) ; dérivation OKLCH au runtime depuis `--theme-seed`, table
  L/C reprise du date-time-picker du dev. Un thème redéfinit les RÔLES, jamais l'échelle de gris.
- **Le « muted » du 16/07 clarifié par le dev** : il visait les NOMS flous, pas la couche
  sémantique. D'où **`c88df0f` `feat(tokens)!`** : `roles.json` remplace semantic + aliases,
  `--color-<ce qu'on peint>-<rôle>`, 27 skins recâblés, primitives seulement dans le color picker,
  garde `styles/test/color-roles.test.ts`. Diff résolu avant/après : 5 écarts voulus seulement
  (survols 100→150, bordure outline 300→450, texte destructif 500→600, flèche désactivée 450→400).
- **Review** : l'infobulle par défaut était devenue blanche sur blanche (règle de réécriture trop
  large) — rattrapé ; `text-destructive` et `fill-on-inverse*` créés, `black` retiré.
- **Migration Atlas** écrite (`europe-map/MIGRATION-color-roles-from-fubaritico-ds.md`), à n'appliquer
  qu'avec la 0.7.0.

> Entrées antérieures : `completed-archive.md`.
