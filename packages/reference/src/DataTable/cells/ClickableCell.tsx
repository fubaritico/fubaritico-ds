import clsx from 'clsx'

import { TableCell } from '../components/TableCell'

import type { Row } from '@tanstack/react-table'
import type { ReactElement } from 'react'

/**
 * Clickable cell factory — renders a button that passes the row data to a callback on click.
 *
 * @param callback - Invoked with `row.original` when the button is clicked.
 * @param content - Content rendered inside the button.
 * @param tooltipText - Optional hint; currently surfaced via the native `title` attribute.
 * @param className - Optional extra classes for the cell.
 * @returns A TanStack cell renderer with a clickable button.
 */
const ClickableCell =
  <TData,>(
    callback: (rowData: TData) => void,
    content: ReactElement,
    tooltipText?: string,
    className?: string
  ) =>
  ({ row }: { row: Row<TData> }) => {
    return (
      <TableCell
        tabIndex={0}
        className={clsx('tw-flex tw-items-center', className)}
      >
        {/* TODO(tooltip): wrap in <Tooltip> once the wrapping-trigger Tooltip lands (Tooltip migrated last). */}
        <button
          type="button"
          title={tooltipText}
          onClick={() => {
            callback(row.original)
          }}
        >
          {content}
        </button>
      </TableCell>
    )
  }

export default ClickableCell
