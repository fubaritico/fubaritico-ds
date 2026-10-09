# Next — fils longs (programme, milestones, livré)

> Scindé de `next.md` le 2026-10-09 (plafond 200 lignes). `next.md` = l'actionnable immédiat ;
> ici = la toile de fond : north-star, milestones en cours, décisions verrouillées.

## North-star (roadmap.md)

White-label, multi-framework, **industrial-grade** DS — DataTable aiming at **AG-Grid parity**.
Foundation = **`@tanstack/table-core`** (no headless rewrite). Logic must be **agnostic / pluggable /
pure-TS** (TS is the real support, not React). **Perf rule: delegate a heavy op ONLY when necessary**
(150k / ~2M acceptable; Web Workers à la Handsontable for millions). Memory:
`data-table-industrial-multi-framework-goal-external-selection-store-decision`.

Phases: **A** DataTable skin (React) → **B** finish reference DS → **C** maximise DataTable features
(≈AG Grid) → **D** Stencil generation (WC/Angular/Vue/React, no DataTable) → **E** DataTable on
`table-core` (agnostic) → **F** DataTable in Stencil (multi-framework). Plans C/E/F = to write.

## ACTIVE — DataTable (milestone EN COURS, PAS finie)

**Objectif : ZÉRO bug.** Le skin BEM est largement fait mais la milestone table **n'est pas terminée** —
le dev pilote et donnera les prochaines tâches au fil de l'eau. Ne pas considérer la table comme « done ».

**Skin de-Tailwind DONE ✅** (session 2026-07-10, 8 commits `bd33847`..`5ad66f5`, cf. `completed.md`) :
cells + features + chrome skinnés, namespace **`ui-data-table`** ; **block `.ui-data-table` sur la Card**
(porte les vars, toolbar/footer héritent) ; `<table>` = `.ui-data-table__table` ; `Readonly<Props>`
partout ; a11y cells (aria-sort, texte masqué statut, noms accessibles) ; `DateCell` prop `truncate`.
Constantes dans `variants/src/table.ts`, tests de parité dans `table.test.ts`.

**Résolu cette session (2026-07-16)** : scroll paginé (`overflow: auto`) ; **quickfilter réparé**
(`getFilteredRowModel`) ; **footer = chrome sibling, PAS `<tfoot>`** (tranché — `<tfoot>` réservé aux
lignes de synthèse) ; **Tooltip-texte-tronqué = PROCHAINE SESSION** (voir bandeau haut) ; README draft.
Détails : [[datatable-behavior-decisions]].

**Loose ends restants (à traiter quand le dev le dira)** :

- **a11y root** : le `role="button"` sur `<tr>` (ligne cliquable) **casse la sémantique table** (finding
  A11Y-003 ouvert) ; `<caption>` / `aria-busy` sur le `<table>` ; label de région scrollable.
- **`DropdownFilter`** : gardé (biblio composable, PAS mort), non câblé — décision à venir.
- **Nettoyage tokens** : la direction est tranchée (rôle→value-scale, drop des alias shadcn — voir
  [[token-neutral-scale-role-vars]]) ; reste à repointer le skin DataTable (utilise encore les alias).

Perf (`data-table-review-backlog-deferred-findings`) : select-all 150k ≈ **207 ms (OFF, prod)**, coût =
bookkeeping TanStack O(N), pas le paint ; `startTransition` = pansement, pas par défaut. Le skin doit
survivre au swap `react-table`→`table-core` (Phase E) : classes sur les primitives sémantiques, pas sur
l'API TanStack. Plan/checklist : `files/plans/datatable-migration.md`.

## THREAD — white-label native-CSS DS (Phase B)

Plan : `files/plans/native-css-migration.md`. Memory : `native-css-migration-backlog`, `white-label-native-css`.

**MIGRATION QUASI TERMINÉE.** 28 composants portent un README et un skin BEM. Ajouts du 2026-10-08/09
au-delà du backlog initial : **Menu, Modal, Typeahead, Image, Drawer, Tabs** migrés ; **Alert**,
**ProgressBar**, **Slider** écrits ; **BottomSheet** (ex-Drawer, renommé) ; **Drawer** réécrit sur
`<dialog>` natif.

**RESTE SUR TAILWIND — exclu du paquet publié, pas supprimé** : `Carousel` (138 classes) et
`next/*` (50). Ils vivent au dépôt, hors build. `HeroImage` est **parqué en `.bak`** (voir son
`PARKED.md`), `TrailerCard` supprimé — tous deux couplés au domaine TMDB.

**Icon, Portal, ConditionalWrapper** : zéro Tailwind, donc déjà compatibles ; il leur manque
seulement un README.

## LIVRÉ — paquets consommables par le monorepo voisin

`01be734`. Quatre paquets publics en **0.1.0**, tarballs dans `dist-tarballs/` (gitignoré) avec un
`INSTALL.md`. Doc d'intégration à la racine : **`INTEGRATION.md`**.

Cinq blocages levés : `styles` n'était pas publiable ; le barrel injectait Tailwind + preflight ;
l'export `./styles.css` pointait le mauvais fichier ; `msw` était livré en dépendance (désormais
peer optionnelle) ; **les 27 README de composants ne partaient pas** (`files: ['dist']`) — un script
les copie maintenant dans `dist`, ce qui compte surtout pour une IA intégratrice.

`getBlurDataUrl` est internalisé ⇒ `reference` ne dépend plus de `shared` à l'exécution.

⚠️ `reference` reste officiellement un **bac à sable, pas un livrable** (cf. `CLAUDE.md`). On le
consomme comme **v1 temporaire**, décision assumée du dev ; les chemins pourront bouger.

## Décisions verrouillées

Lerna + Nx (no Turbo) ; `reference` = sandbox **NON livrable** ; skin = `@fubaritico/styles` ; CVA
resolvers in `@fubaritico/variants` (pur TS, React/DOM-free) ; web-only. Stateful/compound → skill
`/state-storage`. Phase 2 (dev) = 9 composants neufs + package `icons`. Phase 3 = finir Stencil → wire `build:packages`.

## Artefacts d'analyse (ce soir, persistés)

`files/analysis/storage-port-design.md` (StoragePort seam/sink, observable, même-écran, commenté ligne à ligne).
Notes Basic Memory : `scope-object-builder-latency-analysis-odaseva`,
`data-table-industrial-multi-framework-goal-external-selection-store-decision`,
`data-table-review-backlog-deferred-findings` (résultats benchmark ajoutés).
