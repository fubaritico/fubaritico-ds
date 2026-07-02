import clsx from 'clsx'

import { UI_TABLE_HEAD_STRONG_MODIFIER } from '@fubaritico-ds/variants'

import { TableHead } from '../../primitives/TableHead'

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
        className={clsx(UI_TABLE_HEAD_STRONG_MODIFIER, className)}
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
