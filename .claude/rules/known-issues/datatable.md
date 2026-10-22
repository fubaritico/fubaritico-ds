---
paths:
  - "packages/reference/src/components/DataTable/**"
  - "apps/storybook-react/stories/reference/DataTable*"
---
# Known issues — the DataTable

> Slice of `.claude/known-issues.md` (the index). Loads when the DataTable is touched.

- **DataTable skin namespace = `ui-data-table` (2026-07-10)**: the BEM **block `.ui-data-table` sits on the
  CONTAINER (the Card)**, not on the `<table>` — it carries every `--ui-data-table-*` var so that EVERY
  descendant (the toolbar/footer OUTSIDE the `<table>` included) inherits them. The `<table>` itself = the
  element **`.ui-data-table__table`** (box model / border-collapse / layout). Emitted by: the `Table` primitive
  (`UI_DATA_TABLE_TABLE_CLASS` on the `<table>`) + `DataTable`/`DataTableVirtualized` (`UI_DATA_TABLE_CLASS` on
  `<Card className>`). Constants in `variants/src/table.ts`, parity tested in `table.test.ts`. **Do NOT put the
  vars back on the `<table>`** (the toolbar/footer siblings would not see them → greyed-out vars).
- **Custom properties only inherit to descendants**: a `--ui-*` component var must live on an ANCESTOR of all
  its consumers. If elements outside the `<table>` (toolbar/footer) use it, the var goes on the container block,
  never on the `<table>` (lesson of the `ui-data-table` refactor).
- **Table paint order: cells ABOVE rows** → a border on a `<tr>` is **repainted and hidden** by an opaque cell
  background. Corollary: the header rules (`<th>` cells with an opaque white background) go on
  **`.ui-data-table__head`** (the cells), not on the `<tr>`.
- **`border-collapse: collapse` + sticky `<thead>`: the cells' borders are NOT painted** (a known browser bug) →
  the header/body rule is an inset **`box-shadow`** on `.ui-data-table__head`, not a `border`. Also: under
  `border-collapse: separate` the `<tr>` borders are **ignored** (spec); `collapse` honours them (hence
  `border-collapse: collapse` on `.ui-data-table__table`).
- **`:has([role=checkbox])` does NOT match a native `<input type=checkbox>`** (implicit checkbox role, no
  `role` attribute) → use **`:has(input[type=checkbox])`** (square, flush select column).
- **Hint cells / cut text = one Tab stop each (ASSUMED 2026-10-12)** — REACT-129: a cut `TruncatedText` and
  `.ui-data-table__hint` (`<span tabIndex={0}>` WITHOUT a role, an accepted ARIA exception) until the planned
  `role="grid"` roving focus. The hint is also hidden text (`aria-describedby` exists only while the bubble is
  open). `--ui-data-table-hint-*` vars on `.ui-data-table`: the test fixture must have it.
- **NEVER augment TanStack's `SortingFns` (or `FilterFns`) (2026-10-12)**: once a key is added, `sortingFns`
  becomes REQUIRED on every `useReactTable` (`RowSorting.d.ts`, `ResolvedSortingFns`), and a `declare module`
  ships in the published `.d.ts`, so to the consumer. Pass the comparator as a FUNCTION to the column
  (`sortingFn: sortByDate`).
- **`DropdownFilter`: kept, NOT dead** — REACT-133 — it is a **composable brick** (like every cell), just not
  wired into the example configuration. Do NOT delete it because no configuration calls it. The wiring
  decision (`leftActions`) is pending.
- **`cn` lives in `DataTable/utils/cn.ts`** + `normalizeTimestamp` + `formatDuration` in `utils/`; `ui/` no
  longer exists. The primitives import `cn` through `../../../utils`.
- **Pagination = chrome, NOT inside `<tfoot>` (decided 2026-07-15)**: `TableFooterContent` (pagination) stays a
  sibling `<div>` OUTSIDE the `<table>` (so outside the scroll area → pinned at the bottom for free). The
  `TableFooter` primitive (`<tfoot>`) is **reserved for summary/total rows** (AG Grid parity, « pinned bottom
  rows », a later phase), NOT for pagination. Pagination in `<tfoot>` would need a `<tr><td colSpan>` wrapper +
  a `sticky bottom` glue (border-collapse trap) for zero visible gain. **Do NOT « wire » `TableFooter` to the
  pagination.**
- **React `<Profiler>` does NOT fire in a production Storybook build** (needs the `react-dom/profiling` build). For prod perf measurement rely on the plain `debugTimings` (`performance.now` + `console.warn`, the `[DataTable] selection: …ms` line) + Chrome's `[Violation] 'click' handler took …ms` long-task warning. The `[DataTable] render: …ms` Profiler lines only appear in dev.
- **DataTable select-all cost is TanStack O(N) (materializes a 150k-key `rowSelection`), so prod ≈ dev** — it's plain-JS data-structure work, not React render, so dev-mode inflation doesn't apply (don't expect a prod speedup). `startTransition` lowers the blocking time but RAISES the perceived total (two render passes) → don't default it for select-all-and-wait. O(1) needs the external "flag + exceptions" selection store (`files/analysis/storage-port-design.md`), reserved for the extreme (millions / Web Workers) — delegate only when necessary.
