# Next — current actionable state

> Loaded at session start (CLAUDE.md `### Next` → `@next.md`). Single source for "what's next".
> North-star program: **`files/plans/roadmap.md`** (phases A→F).

> ## ▶ ÉTAT AU 2026-10-21 (soir) — **0.7.0 publiée et adoptée par Atlas ; thèmes, étape 2 à faire**
>
> Plan : **`files/plans/theming.md`**. Étape 1 (rôles de couleur) publiée en 0.7.0 ; Atlas a migré
> (`aef0bf1` chez eux). Le « petit truc » du 13/10 (la flèche de la Tooltip) est réglé (`76bde29`,
> non publié → partira en 0.7.1 ou avec la prochaine minor).
>
> **Demain, au choix du dev** :
> 1. **Thèmes, étape 2** : marque blanche radius → 0 (tokens radius) + note CHANGELOG. Puis 3 :
>    mécanisme `[data-theme]` (build SD par thème, toolbar Storybook, test de contraste navigateur) ;
>    4 : `tone` ; 5 : `dark`. Notes pour l'étape 3 : survol de ligne du tableau dérivé de `selected`
>    à 50 % ; bordure de l'alerte success (green.500, ~2,3:1) → `success-hover` ?
> 2. **Menu de commandes pour Atlas** (`files/REQUEST-menu-role-from-europe-historical-atlas.md`,
>    CARTO-122, basse priorité) : `role="menu"`/`menuitem`, Tab ferme, typeahead optionnel,
>    `aria-keyshortcuts` transmis. Ma reco : composant frère (`ActionMenu`) plutôt qu'une prop `kind`
>    — à débattre avec le dev.
>
> **En file** : focus itinérant `role="grid"` du DataTable. Release : `/release` (tapé par le dev),
> feu vert du dev à chaque publication.

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
