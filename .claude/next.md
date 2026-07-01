# Next — current actionable state

> Loaded at session start (CLAUDE.md `### Next` → `@next.md`). Single source for "what's next".
> North-star program: **`files/plans/roadmap.md`** (phases A→F).

> **▶ PROCHAINE SESSION — COMMENCER PAR LE CSS BEM.** Première tâche : **skin BEM de la DataTable**
> (Phase A, de-Tailwind, moteur-indépendant). Charger `bem-structure` + `audit-style` ; partir des
> primitives `components/primitives/*` + les classes `tw-`. Détail : section ACTIVE ci-dessous.

## North-star (roadmap.md)

White-label, multi-framework, **industrial-grade** DS — DataTable aiming at **AG-Grid parity**.
Foundation = **`@tanstack/table-core`** (no headless rewrite). Logic must be **agnostic / pluggable /
pure-TS** (TS is the real support, not React). **Perf rule: delegate a heavy op ONLY when necessary**
(150k / ~2M acceptable; Web Workers à la Handsontable for millions). Memory:
`data-table-industrial-multi-framework-goal-external-selection-store-decision`.

Phases: **A** DataTable skin (React) → **B** finish reference DS → **C** maximise DataTable features
(≈AG Grid) → **D** Stencil generation (WC/Angular/Vue/React, no DataTable) → **E** DataTable on
`table-core` (agnostic) → **F** DataTable in Stencil (multi-framework). Plans C/E/F = to write.

## ACTIVE — DataTable (Phase-2)

Recâblé web-only sur les primitives DS ; repo VERT (type-check + lint + **532 tests**). **COMMITÉ**
(`f0ca817` recâblage + benchmark 150k, `21a0087` hook `useVirtualizedTable`). **Arbre interne
RESTRUCTURÉ le 2026-07-02** (`4fbc266`/`fe192d4`/`571c860`, cf. `completed.md`) :
`DataTable/{components/{primitives,features,cells},hooks,utils,filters}` + barrels par groupe, `ui/`
supprimé. **Barrel-policy** : seules les **cells** sont ré-exportées au barrel racine `DataTable/index.ts`
(briques de config) ; **primitives & features restent internes** (échafaudage). Plan + checklist :
**`files/plans/datatable-migration.md`**. Backlog : `data-table-review-backlog-deferred-findings`.

**Step 1 (benchmark 150k) DONE ✅** — story `Reference/DataTable` (`Benchmark150k` / `Benchmark150kTransition`),
`DataTableExample` props benchmark (`virtualized`/`height`/`enableRowSelection`/`useTransitionForSelection`/
`debugTimings`), `useColumnsDefinition(locale,{withSelection})`, `makeJobs` exporté, test resolver.
**Mesuré (dev + build prod)** : select-all 150k ≈ **207 ms (OFF, prod)** ; coût = **bookkeeping TanStack
O(N)** (matérialise 150k clés), **pas le paint** → **prod ≈ dev** ; `startTransition` = pansement (baisse
le blocage, monte le total) → **pas par défaut**.

**NEXT = Phase A : skin BEM de la DataTable** (de-Tailwind, features actuelles), **moteur-indépendant**
(doit survivre au swap react-table→table-core de la Phase E). Détail : `datatable-migration.md` (étapes
2→8) — th scope/aria-sort/tabIndex/caption/aria-busy ; classes mortes gray_oda/elevation-1/muted.
Charger `bem-structure`/`audit-style` ; partir des primitives `components/primitives/*` (déjà en
ref-prop React 19) + les `tw-`. `SortableHeaderCell` garde `Column<any>` (invariance TanStack). Tooltip EN DERNIER.

**Dettes légères à traiter au passage** (avant/pendant la Phase A) : câbler la primitive **`TableFooter`
(`<tfoot>`)** autour de `TableFooterContent` (actuellement rendu en `<div>` frère, hors `<table>`) ;
**`DropdownFilter` est mort** (importé nulle part) → câbler dans `leftActions` ou supprimer. Findings de
review encore ouverts (verbatim/planifiés) : gray_oda ×3, `whitespace-nowrap` sans préfixe `tw-`, a11y
(scope/aria-sort/tabindex région scrollable), `onClick` inline dans le `.map` des lignes, callbacks
instables `TableFooterContent`, `<input>` brut → DS `Input`.

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
