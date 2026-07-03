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
 * @param ariaLabel - Accessible name for the button (required when `content` is icon-only — WCAG 4.1.2).
 * @param className - Optional extra classes for the header cell.
 * @returns A TanStack header renderer with a clickable button.
 */
const ClickableHeaderCell =
  (
    callback: () => void,
    content: ReactElement,
    ariaLabel?: string,
    className?: string
  ) =>
  <TData,>({ column }: { column: Column<TData> }) => {
    return (
      <TableHead
        id={column.id}
        className={clsx(UI_TABLE_HEAD_STRONG_MODIFIER, className)}
        data-test="clickable-header-cell"
      >
        <button type="button" aria-label={ariaLabel} onClick={callback}>
          {content}
        </button>
      </TableHead>
    )
  }

export default ClickableHeaderCell
