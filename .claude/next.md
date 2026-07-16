# Next — current actionable state

> Loaded at session start (CLAUDE.md `### Next` → `@next.md`). Single source for "what's next".
> North-star program: **`files/plans/roadmap.md`** (phases A→F).

> **▶ PROCHAINE SESSION — CRÉER UN COMPOSANT FEATURE « Tooltip on truncated text ».** Un composant/feature
> qui déclenche une **Tooltip** quand un texte est **tronqué** (ellipsis) — remplace les stopgaps `title`/
> `aria-label` partout où on tronque (DataTable cells, `TruncatedContent`, `DateCell`, Badge `canTruncate`,
> Listbox items…). Bases : DS `Tooltip` (migré) + hook `useIsTextTruncated` (existe déjà, ResizeObserver).
> Charger `patterns-ui` (+ `state-storage` si stateful) ; `/new-react-component` + `/story` + `/test`.
> Idée : un wrapper `TruncateWithTooltip` (ConditionalWrapper) qui n'affiche la Tooltip que si tronqué.
>
> **Thread parallèle** : adoption « agent-ready » (étude Astryx) — plans dans `files/plans/agent-ready/`,
> commencer par **P1 doc-as-data** (Button cobaye). Voir [[astryx-agent-ready-study]].

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
**DONE** (log dans `completed.md`) : Badge, Button(+Link/NextLink), Typography(body1/body2), Spinner,
Skeleton, Avatar(R19 compound), IconButton, Card — atoms ; Input, Rating — molecules. DS primary = neutral ;
radius ≤ 6px ; `react/jsx-no-leaked-render` enforced ; tokens kebab-case. Chaque composant migré = README + story.
**NEXT** : **Image** (25 `ui:`, →Icon, dernière Molecule) → Compounds : Listbox(37) → Menu(5) → Modal(8) →
Drawer(38) → Tabs(49) → Carousel(138) → Typeahead(23, capstone). Icon & Portal NON migrés (rien ne les bloque).
**A11Y follow-up** : Button `outline` emprunte `--color-input` (~1.48:1) → même gap WCAG 1.4.11 que l'input.

## Décisions verrouillées

Lerna + Nx (no Turbo) ; `reference` = sandbox **NON livrable** ; skin = `@fubaritico-ds/styles` ; CVA
resolvers in `@fubaritico-ds/variants` (pur TS, React/DOM-free) ; web-only. Stateful/compound → skill
`/state-storage`. Phase 2 (dev) = 9 composants neufs + package `icons`. Phase 3 = finir Stencil → wire `build:packages`.

## Artefacts d'analyse (ce soir, persistés)

`files/analysis/storage-port-design.md` (StoragePort seam/sink, observable, même-écran, commenté ligne à ligne).
Notes Basic Memory : `scope-object-builder-latency-analysis-odaseva`,
`data-table-industrial-multi-framework-goal-external-selection-store-decision`,
`data-table-review-backlog-deferred-findings` (résultats benchmark ajoutés).
