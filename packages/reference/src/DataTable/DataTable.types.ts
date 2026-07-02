import type { Row, Table as TableType } from '@tanstack/react-table'
import type { FC, ReactElement } from 'react'

/* Types */
export interface BaseDataTableProps<TData> {
  /** Rendered component that replaces the default content located above the table header. */
  actionBar?: ReactElement
  /** Extra CSS classes for the action bar (overriding the defaults). */
  actionBarClassName?: string
  /** Extra CSS classes for the root element (overriding the defaults). */
  className?: string
  /** The TanStack table state manager exposed from the `useReactTable` hook. */
  tableStateManager: TableType<TData>
  /** ID applied to the component root element for test purposes. */
  dataTestId?: string
  /** Extra CSS classes for the table header (overriding the defaults). */
  headerClassName?: string
  /** For test purposes only — inits the table at the given page index. */
  initTableAt?: number
  /** Array of React elements rendered as filter actions in the action bar. */
  leftActions?: ReactElement[]
  /** Loading state of the data (the table is responsible for its loading state). */
  loading: boolean
  /** If true, the top action bar won't show above the table. */
  noActionBar?: boolean
  /** If true, the pagination won't show below the table. */
  noPagination?: boolean
  /** If defined the entire row is clickable — use with care to avoid conflicts with link cells. */
  onRowClick?: (row: Row<TData>) => void
  /** Global-filtering callback fired when the value of the global filter changes. */
  onGlobalFilterChange?: (value: string) => void
  /** Component displaying the per-row loading (skeleton) state. */
  rowsSkeleton?: FC
  /** Extra CSS classes for the table body (overriding the defaults). */
  tBodyClassName?: string
}
