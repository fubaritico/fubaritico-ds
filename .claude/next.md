# Next — current actionable state

> Loaded at session start (CLAUDE.md `### Next` → `@next.md`). Single source for "what's next".
> North-star program: **`files/plans/roadmap.md`** (phases A→F).

> ## ▶ ÉTAT AU 2026-10-11 SOIR — **0.5.0 PUBLIÉE**, 8 commits poussés NON publiés
>
> Depuis `v0.5.0` : garde `display`, API des coins, Tooltip top layer, `TooltipService`/`useTooltip`,
> `TruncatedText`, Dropdown / Typeahead / BottomSheet dans le top layer (voir `completed.md`).
>
> **Suite immédiate, dans l'ordre** :
> 1. **DropdownFilter** puis **TableFooterContent** → top layer (même recette, test « dans une Modal »).
> 2. **Release 0.6.0** (`/release`, minor : il y a des `feat` et des retraits d'API) + **handoff Atlas** :
>    Échap dans leur modale ne ferme plus que le menu du Dropdown ; leur contournement
>    `.polity-form .ui-card { overflow: visible }` devient inutile ; retraits : axe `flipped` de
>    `dropdownMenuVariants`, `--ui-dropdown-z`, `typeaheadMenuVariants`, `--ui-typeahead-menu-z-index`,
>    `BOTTOM_SHEET_OVERLAY_CLASS`, `--ui-bottom-sheet-z-index` ; `aria-label` requis sur BottomSheet.
> 3. Étape 4 de TruncatedText (section ci-dessous), puis le chantier des **thèmes**.
>
> **Procédure de release** : `README.md` → « Publishing a release », skill **`/release`**. Feu vert
> du dev à chaque publication. Pistes ColorPicker (curseurs par canal, Recent Colors, EyeDropper)
> reportées par le dev — ce qu'Atlas a suffit.
>
> **Dette doc** : `completed.md` archivé au 2026-09-16 (`completed-archive.md`) ; `patterns-ui.md`
> scindé (`rules/patterns-compound.md`).

## FAIT (2026-10-11) — « Tooltip on truncated text » → `TruncatedText`

Le stub `WithTooltip` est remplacé et supprimé. En quatre étapes validées : Tooltip dans le top
layer (portal en option), `TooltipService` + `useTooltip` (WCAG 1.4.13), `TruncatedText` (mesuré,
bulle `aria-hidden`, focusable seulement si coupé). **Reste l'étape 4** : remplacer les pis-aller
`title`/`aria-label` dans `TruncatedContent`, `TruncableLinkCellView`, `SortableHeaderCellView`,
Badge `canTruncate`, `DateCell`, items du Listbox — et les cellules qui recâblent la Tooltip à la
main (`ClickableCell`, `IconStatusCellView`, `LabelWithTooltipCellView`) → `useTooltip`.

## FAIT (2026-10-09) — tests navigateur (Vitest Browser Mode + Playwright)

> **En place** : projets `unit` (jsdom) + `browser` (Chromium, `*.browser.test.tsx`) dans
> `packages/reference/vitest.config.ts`, skin réel chargé, commandes pointeur, CI installe Chromium.
> Premier lot : `Slider` (clavier natif). **Restent** : ColorPicker (en cours), Drawer/Modal (`<dialog>`
> réel + règle `display`), Image (IntersectionObserver). Cadrage d'origine : historique git de ce fichier.

## FAIT (2026-10-11) — border-radius : l'API des coins

Coins logiques sur les 21 skins, formes rondes sur `--radius-full`, littéral du dropdown nettoyé.
Détails : `known-issues.md`. **Suite = le chantier des THÈMES** (dev, 2026-10-11) : deux ou trois
thèmes par défaut, pour montrer qu'à partir des seuls tokens on obtient ce qu'on veut — dont un
« coins carrés » (tokens `sm`/`md`/`lg` à 0) et au moins un arrondi. Voir [[theming-strategy]].

## À FAIRE — les autres portals sur `body` (relevé 2026-10-11)

La Tooltip est passée dans le top layer (prouvé : un portal sur `body` ouvert depuis une Modal
finit SOUS le `<dialog>`, dans la partie inerte). **Même défaut** chez `Dropdown`, `Typeahead`
(menu), `BottomSheet`, `DataTable/DropdownFilter` et `TableFooterContent` : ils portalisent via
`components/Portal`. Décision dev (2026-10-11) : top layer sur place par défaut, portal en
option. À traiter composant par composant, chacun avec son test navigateur « ouvert dans une Modal ».
**Dropdown FAIT** (`49faf4b`) : popover manuel ancré en CSS, focus dans le menu, Escape consommé.
**Typeahead FAIT** (`3218422`). **BottomSheet FAIT** (`3f55d36`, `<dialog>` natif modal / popover). Restent DropdownFilter, TableFooterContent.

## Thread parallèle

Adoption « agent-ready » (étude Astryx) — plans dans `files/plans/agent-ready/`, commencer par
**P1 doc-as-data** (Button cobaye). Voir [[astryx-agent-ready-study]].

## Fils longs

North-star, DataTable (milestone en cours), thread white-label, livraison 0.1.0, décisions
verrouillées, artefacts d'analyse : **`.claude/next-threads.md`** (à lire quand on y touche).
