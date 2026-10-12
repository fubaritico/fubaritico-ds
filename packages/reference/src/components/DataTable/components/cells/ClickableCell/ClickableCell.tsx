import ClickableCellView from '../views/ClickableCellView'

import type { Row } from '@tanstack/react-table'
import type { ReactElement } from 'react'

/**
 * Clickable cell factory — renders a button that passes the row data to a callback on click.
 *
 * @param callback - Invoked with `row.original` when the button is clicked.
 * @param content - Content rendered inside the button.
 * @param tooltipText - Optional hint, shown in a tooltip on hover / keyboard focus.
 * @param ariaLabel - Accessible name for the button (required when `content` is icon-only — WCAG
 *   4.1.2); falls back to `tooltipText`.
 * @param className - Optional extra classes for the cell.
 * @returns A TanStack cell renderer with a clickable button.
 */
const ClickableCell =
  <TData,>(
    callback: (rowData: TData) => void,
    content: ReactElement,
    tooltipText?: string,
    ariaLabel?: string,
    className?: string
  ) =>
  ({ row }: Readonly<{ row: Row<TData> }>) => (
    <ClickableCellView
      ariaLabel={ariaLabel}
      className={className}
      content={content}
      tooltipText={tooltipText}
      onClick={() => {
        callback(row.original)
      }}
    />
  )

export default ClickableCell
