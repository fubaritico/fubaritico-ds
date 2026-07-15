# DataTable

A **presentational, headless-driven data grid** — the rendering + chrome (toolbar, header/body,
pagination) for a table whose **state manager is injected** (a TanStack `useReactTable` instance).
The table owns _how it looks and behaves_; the caller owns _the data, columns and state_ and passes the
table instance in. This is the dependency-injection seam that keeps the grid framework-agnostic-ready.

> **Draft / WIP** — the DataTable milestone is in progress (skin done; a11y-root, `<tfoot>` summaries,
> Tooltip still open). This doc tracks the current public API and will tighten as the component lands.

## Capabilities

- **Two rendering modes** — paginated (`DataTable`, default export) and virtualized
  (`DataTableVirtualized`, for large datasets: the virtualizer mounts only visible rows).
- **Injected state manager** — you build the TanStack table (`useReactTable`) and pass it as
  `tableStateManager`. Sorting, filtering, pagination, selection are TanStack's; the grid renders them.
- **Quick filter** — the action-bar search drives TanStack `globalFilter` (needs `getFilteredRowModel()`
  in your table options — see Notes).
- **Sticky header + body scroll** — opt-in via `stickyHeader` + `maxHeight` (paginated) / `height`
  (virtualized): the `<thead>` pins on vertical scroll and follows columns on horizontal scroll.
- **Composable cells** — the column `cell`/`header` renderers (Badge/Date/Checkbox/Clickable/… ) are
  exported building blocks you assemble in your `columns` definition.
- **Row selection, clickable rows, per-row skeletons, empty state, left filter actions** — all opt-in.
- **Native BEM skin** — `.ui-data-table` on the container Card, overridable via `--ui-data-table-*` vars.

## Import

```tsx
import DataTable, {
  DataTableVirtualized,
} from '@fubaritico-ds/reference/DataTable'
// building blocks for your columns:
import {
  BadgeStatusCell,
  DateCell,
  SimpleCell,
} from '@fubaritico-ds/reference/DataTable'
```

## Basic usage

You build the table instance and inject it. Register the row models for the features you use:

```tsx
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel, // required for the quick filter
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table'
import { useState } from 'react'
import DataTable from '@fubaritico-ds/reference/DataTable'

function JobsTable({ data, columns }) {
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <DataTable
      tableStateManager={table}
      loading={false}
      onGlobalFilterChange={setGlobalFilter}
    />
  )
}
```

## Variants & options

```tsx
// Sticky header + scrolling body (both props required together):
<DataTable tableStateManager={table} loading={false} stickyHeader maxHeight={400} />

// Virtualized (large datasets) — drop the pagination row model, give a viewport height:
<DataTableVirtualized tableStateManager={table} loading={false} height={600} noPagination />

// No toolbar / no pagination:
<DataTable tableStateManager={table} loading={false} noActionBar noPagination />

// Clickable rows + left filter actions:
<DataTable
  tableStateManager={table}
  loading={false}
  onRowClick={(row) => open(row.original)}
  leftActions={[<StatusFilter key="status" />]}
/>

// Loading with a per-row skeleton:
<DataTable tableStateManager={table} loading rowsSkeleton={JobRowSkeleton} />
```

## Edge cases

```tsx
// Empty data → the built-in NoResults state renders (no pagination):
<DataTable tableStateManager={emptyTable} loading={false} />

// stickyHeader WITHOUT maxHeight throws (they must be paired) — this is a compile-time-ish guard:
<DataTable tableStateManager={table} loading={false} stickyHeader /> // ❌ throws at runtime
```

## Props / API reference

### `DataTable` — `BaseDataTableProps<TData> & DataTableProps`

| Prop                                                                      | Type                        | Default | Description                                                  |
| ------------------------------------------------------------------------- | --------------------------- | ------- | ------------------------------------------------------------ |
| `tableStateManager`                                                       | `Table<TData>`              | —       | **Required.** The injected `useReactTable` instance.         |
| `loading`                                                                 | `boolean`                   | —       | **Required.** Drives the skeleton/loading render.            |
| `maxHeight`                                                               | `number`                    | —       | Caps the scroll area (px); **required with** `stickyHeader`. |
| `stickyHeader`                                                            | `boolean`                   | —       | Pins the header; **required with** `maxHeight`.              |
| `onGlobalFilterChange`                                                    | `(value: string) => void`   | —       | Quick-filter change callback (wire to your state).           |
| `onRowClick`                                                              | `(row: Row<TData>) => void` | —       | Makes the whole row clickable.                               |
| `leftActions`                                                             | `ReactElement[]`            | —       | Filter actions rendered in the action bar.                   |
| `actionBar`                                                               | `ReactElement`              | —       | Replace the default action bar entirely.                     |
| `noActionBar`                                                             | `boolean`                   | `false` | Hide the toolbar.                                            |
| `noPagination`                                                            | `boolean`                   | `false` | Hide the pagination bar.                                     |
| `rowsSkeleton`                                                            | `FC`                        | —       | Per-row skeleton component for the loading state.            |
| `initTableAt`                                                             | `number`                    | —       | Test-only: initial page index.                               |
| `className` · `actionBarClassName` · `headerClassName` · `tBodyClassName` | `string`                    | —       | Class overrides.                                             |
| `dataTestId`                                                              | `string`                    | —       | Test id on the root.                                         |

### `DataTableVirtualized` — `BaseDataTableProps<TData> & { height: number }`

Same as above minus `maxHeight`/`stickyHeader`; adds **`height`** (viewport px of the scrollable region;
the header is always sticky in virtualized mode).

## Accessibility

- The grid renders a semantic `<table>`; header cells expose `aria-sort`; the sort toggle has a dynamic
  accessible name; the status icon text is available to assistive tech.
- **Known open item**: a clickable row currently uses `role="button"` on the `<tr>`, which breaks table
  semantics (finding A11Y-003) — being reworked. `<caption>` / `aria-busy` / a scrollable-region label
  are also on the a11y follow-up list.

## Notes

> **Warning** — the quick filter needs `getFilteredRowModel()` in your `useReactTable` options.
> Without it the search input updates state but **no rows filter**. Same for `getPaginationRowModel()`
> (pagination) and `getSortedRowModel()` (sort) — register the row model for each feature you use.

> **Warning** — `stickyHeader` and `maxHeight` are **paired**: passing one without the other throws.
> Use them together to get a fixed-height, scrolling body with a pinned header.

> **Note** — the **cell renderers are composable building blocks**, not a fixed schema. Assemble them in
> your `columns` definition; ones you don't use are not dead code.

> **Note** — the pagination bar is **chrome**: it sits outside the scrolling table region (always
> visible below). The `<tfoot>` element is reserved for future column-summary rows, not pagination.

> **Note** — this is a **reference/sandbox** component (`packages/reference`), not a shipped package.
> The public deliverable will be the framework packages consuming `@fubaritico-ds/{tokens,styles}`.
