---
paths:
  - "packages/reference/src/components/DataTable/**"
  - "apps/storybook-react/stories/reference/DataTable*"
---
# Known issues — the DataTable

> Slice of `.claude/known-issues.md` (the index). Loads when the DataTable is touched.

- **Namespace skin DataTable = `ui-data-table` (2026-07-10)** : le BEM **block `.ui-data-table` est sur la
  CONTAINER (la Card)**, pas sur le `<table>` — il porte tous les `--ui-data-table-*` vars pour que TOUT
  descendant (y compris la toolbar/footer HORS `<table>`) en hérite. Le `<table>` lui-même = l'élément
  **`.ui-data-table__table`** (box-model/border-collapse/layout). Émis par : `Table` primitive
  (`UI_DATA_TABLE_TABLE_CLASS` sur le `<table>`) + `DataTable`/`DataTableVirtualized` (`UI_DATA_TABLE_CLASS`
  sur `<Card className>`). Constantes dans `variants/src/table.ts`, parité testée. **Ne PAS remettre les
  vars sur le `<table>`** (les siblings toolbar/footer ne les verraient plus → vars grisées).
- **Custom props n'héritent qu'aux descendants** : un `--ui-*` component-var doit vivre sur un ANCÊTRE de
  tous ses consommateurs. Si des éléments hors `<table>` (toolbar/footer) l'utilisent, la var va sur le
  block-conteneur, jamais sur le `<table>` (leçon du refactor `ui-data-table`).
- **Ordre de peinture des tables : cellules AU-DESSUS des lignes** → une bordure sur `<tr>` est **repeinte
  et masquée** par un fond de cellule opaque. Corollaire : les filets d'en-tête (cellules `<th>` à fond
  blanc opaque) vont sur **`.ui-data-table__head`** (les cellules), pas sur le `<tr>`.
- **`border-collapse: collapse` + `<thead>` sticky : bordures des cellules NON peintes** (bug navigateur
  connu) → le filet header/corps est un **`box-shadow` inset** sur `.ui-data-table__head`, pas une
  `border`. Aussi : en `border-collapse: separate` les bordures `<tr>` sont **ignorées** (spec) ; c'est
  `collapse` qui les honore (d'où `border-collapse: collapse` sur `.ui-data-table__table`).
- **`:has([role=checkbox])` NE matche PAS un `<input type=checkbox>` natif** (rôle checkbox implicite, pas
  d'attribut `role`) → utiliser **`:has(input[type=checkbox])`** (colonne select carrée/flush).
- **Cellules à indice / texte coupé = un arrêt de Tab chacune (ASSUMÉ 2026-10-12)** — REACT-129 : `TruncatedText`
  coupé et `.ui-data-table__hint` (`<span tabIndex={0}>` SANS rôle, exception ARIA acceptée) jusqu'au
  focus itinérant `role="grid"` prévu. Indice aussi en texte masqué (`aria-describedby` n'existe que
  bulle ouverte). Vars `--ui-data-table-hint-*` sur `.ui-data-table` : la fixture doit l'avoir.
- **Ne JAMAIS augmenter `SortingFns` (ou `FilterFns`) de TanStack (2026-10-12)** : dès qu'une clé y
  est ajoutée, `sortingFns` devient OBLIGATOIRE sur tout `useReactTable` (`RowSorting.d.ts`,
  `ResolvedSortingFns`), et un `declare module` part dans le `.d.ts` publié, donc chez le
  consommateur. Passer le comparateur en FONCTION à la colonne (`sortingFn: sortByDate`).
- **`DropdownFilter` : gardé, PAS mort** — REACT-133 — c'est une **brique composable** (comme toutes les cells), juste
  non câblée dans la config d'exemple. NE PAS la supprimer sous prétexte qu'aucune config ne l'appelle.
  Décision de câblage (`leftActions`) à venir.
- **`cn` vit dans `DataTable/utils/cn.ts`** + `normalizeTimestamp` + `formatDuration` dans `utils/` ;
  `ui/` n'existe plus. Les primitives importent `cn` via `../../../utils`.
- **Pagination = chrome, PAS dans `<tfoot>` (décidé 2026-07-15)** : `TableFooterContent` (pagination) reste
  un `<div>` frère HORS du `<table>` (donc hors de la zone de scroll → épinglé en bas gratuitement). La
  primitive `TableFooter` (`<tfoot>`) est **réservée aux lignes de synthèse/totaux de colonnes** (parité
  AG-Grid, « pinned bottom rows », phase ultérieure), PAS à la pagination. Mettre la pagination dans
  `<tfoot>` imposerait un wrapper `<tr><td colSpan>` + un collage `sticky bottom` (gotcha border-collapse)
  pour zéro gain visible. **Ne PAS « câbler » `TableFooter` sur la pagination.**
- **React `<Profiler>` does NOT fire in a production Storybook build** (needs the `react-dom/profiling` build). For prod perf measurement rely on the plain `debugTimings` (`performance.now` + `console.warn`, the `[DataTable] selection: …ms` line) + Chrome's `[Violation] 'click' handler took …ms` long-task warning. The `[DataTable] render: …ms` Profiler lines only appear in dev.
- **DataTable select-all cost is TanStack O(N) (materializes a 150k-key `rowSelection`), so prod ≈ dev** — it's plain-JS data-structure work, not React render, so dev-mode inflation doesn't apply (don't expect a prod speedup). `startTransition` lowers the blocking time but RAISES the perceived total (two render passes) → don't default it for select-all-and-wait. O(1) needs the external "flag + exceptions" selection store (`files/analysis/storage-port-design.md`), reserved for the extreme (millions / Web Workers) — delegate only when necessary.
