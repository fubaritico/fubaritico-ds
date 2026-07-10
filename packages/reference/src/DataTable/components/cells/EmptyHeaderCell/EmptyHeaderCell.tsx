import clsx from 'clsx'

import { UI_DATA_TABLE_HEAD_STRONG_MODIFIER } from '@fubaritico-ds/variants'

import { TableHead } from '../../primitives/TableHead'

import type { Column } from '@tanstack/react-table'

/**
 * Empty header cell factory — renders a visually-blank header (e.g. above an actions or selection
 * column). Pass `ariaLabel` to give the column an accessible name (WCAG 1.3.1) — screen readers
 * otherwise announce an empty cell.
 *
 * @param ariaLabel - Accessible name for the column header (e.g. "Actions").
 * @param className - Optional extra classes for the header cell.
 * @returns A TanStack header renderer that renders a visually-empty cell (non-breaking space placeholder).
 */
const EmptyHeaderCell =
  (ariaLabel?: string, className?: string) =>
  <TData,>({ column }: Readonly<{ column: Column<TData> }>) => {
    return (
      <TableHead
        id={column.id}
        aria-label={ariaLabel}
        className={clsx(UI_DATA_TABLE_HEAD_STRONG_MODIFIER, className)}
      >
        &nbsp;
      </TableHead>
    )
  }

export default EmptyHeaderCell
