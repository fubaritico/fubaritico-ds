import type { Row, Table as TableType } from '@tanstack/react-table'
import type { FC, ReactElement } from 'react'

/* Types */
export type BaseDataTableProps<TData> = {
  /* rendered component that will replace the component located above the table header */
  actionBar?: ReactElement
  /* Extra CSS classes for the action bar (overriding tailwind) */
  actionBarClassName?: string
  /* Extra CSS classes for the root element (overriding tailwind) */
  className?: string
  /* The tan stack table state manager exposed from the useReactTable hook */
  tableStateManager: TableType<TData>
  /* ID applied to the component root element for test purposes */
  dataTestId?: string
  /* Extra CSS classes for the table header(overriding tailwind)  */
  headerClassName?: string
  /*  For test purposes only, will init the table at a page */
  initTableAt?: number
  /* Array of React elements to be rendered (filter actions) */
  leftActions?: ReactElement[]
  /* loading state of data (the table is responsible for its loading state) */
  loading: boolean
  /* If true, the top action won't show above the table */
  noActionBar?: boolean
  /* If true, the pagination won't show below the table */
  noPagination?: boolean
  /* If true, no shadow will be added to the container box */
  noShadow?: boolean
  /* If defined the entire row will be clickable, use with care to avoid conflicts with link cells */
  onRowClick?: (row: Row<TData>) => void
  /* Global Filtering callback executed when changing/typing the value of the global filter (string) */
  onGlobalFilterChange?: (value: string) => void
  /* Component to display the loading state of rows */
  rowsSkeleton?: FC
  /* Extra CSS classes for the table body (overriding tailwind) */
  tBodyClassName?: string
}
