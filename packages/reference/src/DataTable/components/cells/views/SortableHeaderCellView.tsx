import { ArrowUpDown } from '../../features/ArrowUpDown'
import { useIsTextTruncated } from '../../../hooks'
import { TableHead } from '../../primitives/TableHead'

import type { Column } from '@tanstack/react-table'
import type { FC } from 'react'

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
const SortableHeaderCellView: FC<SortableHeaderCellViewProps> = ({
  className,
  dataType,
  headerLabel,
  colName,
  column,
  withSeparator,
}) => {
  const { elementRef, isTruncated } =
    useIsTextTruncated<HTMLSpanElement>(headerLabel)

  return (
    <TableHead className={className} data-type={dataType} tabIndex={0}>
      <div className="tw-flex tw-items-center tw-justify-start tw-gap-1">
        {/* TODO(tooltip): show a <Tooltip> when truncated once the wrapping-trigger Tooltip lands. */}
        <span
          ref={elementRef}
          title={isTruncated ? headerLabel : undefined}
          className="tw-truncate tw-uppercase tw-text-gray_oda-600 tw-text-xs tw-font-semibold"
        >
          {headerLabel}
        </span>
        <ArrowUpDown
          colName={colName}
          className="tw-h-6 tw-min-w-6 tw-cursor-pointer tw-mr-auto"
          onClick={() => {
            column.toggleSorting(column.getIsSorted() === 'asc')
          }}
          sorting={column.getIsSorted()}
        />
        {withSeparator ? <div className="tw-flex tw-gap-[2px]" /> : null}
      </div>
    </TableHead>
  )
}

export default SortableHeaderCellView
