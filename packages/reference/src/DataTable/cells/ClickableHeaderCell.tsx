import clsx from 'clsx'

import { TableHead } from '../ui/table'

import type { Column } from '@tanstack/react-table'
import type { ReactElement } from 'react'

/**
 * Clickable header cell factory — renders a header button running an arbitrary action.
 *
 * @param callback - Invoked when the header button is clicked.
 * @param content - Content rendered inside the button.
 * @param className - Optional extra classes for the header cell.
 * @returns A TanStack header renderer with a clickable button.
 */
const ClickableHeaderCell =
  (callback: () => void, content: ReactElement, className?: string) =>
  <TData,>({ column }: { column: Column<TData> }) => {
    return (
      <TableHead
        id={column.id}
        tabIndex={0}
        className={clsx('tw-font-bold !tw-text-gray-900', className)}
        data-test="clickable-header-cell"
      >
        <button
          type="button"
          onClick={() => {
            callback()
          }}
        >
          {content}
        </button>
      </TableHead>
    )
  }

export default ClickableHeaderCell
