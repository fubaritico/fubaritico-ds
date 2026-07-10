import {
  UI_DATA_TABLE_HEAD_INNER_CLASS,
  UI_DATA_TABLE_HEAD_LABEL_CLASS,
  UI_DATA_TABLE_SEPARATOR_CLASS,
  UI_DATA_TABLE_SORT_TOGGLE_CLASS,
} from '@fubaritico-ds/variants'

import { useIsTextTruncated } from '../../../hooks'
import { ArrowUpDown } from '../../features/ArrowUpDown'
import { TableHead } from '../../primitives/TableHead'

import type { Column } from '@tanstack/react-table'

/** Props of {@link SortableHeaderCellView}. */
export interface SortableHeaderCellViewProps {
  /** Extra classes for the header cell. */
  className?: string
  /** Column data-type (drives the default column width via the table CSS). */
  dataType?: string
  /** Visible header label. */
  headerLabel: string
  /** Column name (for the sort control's accessible label). */
  colName: string
  /** The TanStack column instance. */
  column: Column<unknown>
  /** Whether to render a trailing column separator. */
  withSeparator?: boolean
}

/**
 * Sortable header cell view — the label plus the {@link ArrowUpDown} sort toggle. When the label is
 * truncated, the full text is exposed via the native `title` attribute.
 *
 * @param props - {@link SortableHeaderCellViewProps}.
 * @returns The header cell.
 */
export function SortableHeaderCellView({
  className,
  dataType,
  headerLabel,
  colName,
  column,
  withSeparator,
}: Readonly<SortableHeaderCellViewProps>) {
  const { elementRef, isTruncated } =
    useIsTextTruncated<HTMLSpanElement>(headerLabel)

  const sorted = column.getIsSorted()
  const ariaSort =
    sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'

  return (
    <TableHead className={className} data-type={dataType} aria-sort={ariaSort}>
      <div className={UI_DATA_TABLE_HEAD_INNER_CLASS}>
        {/* TODO(tooltip): show a <Tooltip> when truncated once the wrapping-trigger Tooltip lands. */}
        <span
          ref={elementRef}
          title={isTruncated ? headerLabel : undefined}
          aria-label={isTruncated ? headerLabel : undefined}
          className={UI_DATA_TABLE_HEAD_LABEL_CLASS}
        >
          {headerLabel}
        </span>
        <ArrowUpDown
          colName={colName}
          className={UI_DATA_TABLE_SORT_TOGGLE_CLASS}
          onClick={() => {
            column.toggleSorting(sorted === 'asc')
          }}
          sorting={sorted}
        />
        {withSeparator ? <div className={UI_DATA_TABLE_SEPARATOR_CLASS} /> : null}
      </div>
    </TableHead>
  )
}

export default SortableHeaderCellView
