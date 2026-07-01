import SortableHeaderCellView from './views/SortableHeaderCellView'

import type { Column } from '@tanstack/react-table'

/**
 * Sortable header cell factory.
 *
 * @param colName - Column name used by TanStack Table (sorting/filtering).
 * @param headerLabel - Label displayed in the header cell.
 * @param withSeparator - Whether to render a trailing column separator.
 * @param dataType - Column data-type, drives the default column width (see `components/TableHeader`).
 * @param className - Extra classes for the header cell.
 * @returns A TanStack header renderer for a sortable column.
 */
const SortableHeaderCell =
  (
    colName: string,
    headerLabel: string,
    withSeparator?: boolean,
    dataType?: string,
    className?: string
  ) =>
  // TanStack `Column` is invariant in TData; a reusable header factory must accept `any` here so the
  // renderer stays assignable to `ColumnDef<TData>['header']` for any concrete row type (library idiom).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ({ column }: { column: Column<any> }) => {
    return (
      <SortableHeaderCellView
        className={className}
        headerLabel={headerLabel}
        colName={colName}
        column={column}
        dataType={dataType}
        withSeparator={withSeparator}
      />
    )
  }

export default SortableHeaderCell
