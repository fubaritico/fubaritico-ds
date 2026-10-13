# Next — current actionable state

> Loaded at session start (CLAUDE.md `### Next` → `@next.md`). Single source for "what's next".
> North-star program: **`files/plans/roadmap.md`** (phases A→F).

> ## ▶ ÉTAT AU 2026-10-13 — **0.6.0 PUBLIÉE**, handoff Atlas écrit
>
> 0.6.0 publiée le 2026-10-13 (`behaviors`, `react`, `styles`, `tokens`, `variants`) : top layer
> pour Tooltip / Dropdown / Typeahead / BottomSheet / menus du DataTable, `TooltipService`,
> `TruncatedText` (étapes 1-4), API des coins, vues de cellules exportées. CHANGELOG complétés à la
> main (`cadca4a` : retraits d'API + fix `109a8bb` mal typé). Handoff dans
> `europe-map/HANDOFF-from-fubaritico-ds.md` (leur `^0.5.0` n'accepte pas la 0.6.0).
>
> **Suite** : le chantier des **thèmes** ; focus itinérant `role="grid"` du DataTable en file.
>
> **Procédure de release** : `README.md` → « Publishing a release », skill **`/release`**. Feu vert
> du dev à chaque publication. Pistes ColorPicker (curseurs par canal, Recent Colors, EyeDropper)
> reportées par le dev — ce qu'Atlas a suffit.
>
> **Dette doc** : `completed.md` archivé au 2026-09-16 (`completed-archive.md`) ; `patterns-ui.md`
> scindé (`rules/patterns-compound.md`).

## FAIT (2026-10-11) — « Tooltip on truncated text » → `TruncatedText`

Le stub `WithTooltip` est remplacé et supprimé. Quatre étapes, **toutes faites** (étape 4 le
2026-10-12) : plus aucun `title`/`aria-label` de pis-aller. Texte coupé → `TruncatedText`
(`TruncatedContent`/`DateCell`, en-têtes, Badge `canTruncate`) ou hooks directs (cellule lien) ;
indices → `useTooltip` + texte masqué (`.ui-data-table__hint`). Listbox : rien à faire (ne tronque pas).
**Suite prévue (décision dev)** : focus itinérant **`role="grid"`** du DataTable — un seul arrêt de
Tab pour la grille, au lieu d'un par cellule coupée / indice (voir `known-issues.md`).

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

## FAIT (2026-10-12) — les portals sur `body` → top layer

La Tooltip est passée dans le top layer (prouvé : un portal sur `body` ouvert depuis une Modal
finit SOUS le `<dialog>`, dans la partie inerte). **Même défaut** chez `Dropdown`, `Typeahead`
(menu), `BottomSheet`, `DataTable/DropdownFilter` et `TableFooterContent` : ils portalisent via
`components/Portal`. Décision dev (2026-10-11) : top layer sur place par défaut, portal en
option. À traiter composant par composant, chacun avec son test navigateur « ouvert dans une Modal ».
**Dropdown FAIT** (`49faf4b`) : popover manuel ancré en CSS, focus dans le menu, Escape consommé.
**Typeahead FAIT** (`3218422`). **BottomSheet FAIT** (`3f55d36`, `<dialog>` natif modal / popover). **DropdownFilter + TableFooterContent FAITS** (`de20233`, `withPortal` retiré). Plus aucun portal par défaut.

## Thread parallèle

Adoption « agent-ready » (étude Astryx) — plans dans `files/plans/agent-ready/`, commencer par
**P1 doc-as-data** (Button cobaye). Voir [[astryx-agent-ready-study]].

## Fils longs

North-star, DataTable (milestone en cours), thread white-label, livraison 0.1.0, décisions
verrouillées, artefacts d'analyse : **`.claude/next-threads.md`** (à lire quand on y touche).
