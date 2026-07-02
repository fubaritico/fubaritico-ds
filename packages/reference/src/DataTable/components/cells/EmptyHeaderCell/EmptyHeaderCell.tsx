import clsx from 'clsx'

import { UI_TABLE_HEAD_STRONG_MODIFIER } from '@fubaritico-ds/variants'

import { TableHead } from '../../primitives/TableHead'

import type { Column } from '@tanstack/react-table'

/**
 * Empty header cell factory — renders a blank header (e.g. above an actions or selection column).
 *
 * @param className - Optional extra classes for the header cell.
 * @returns A TanStack header renderer that renders nothing visible.
 */
const EmptyHeaderCell =
  (className?: string) =>
  <TData,>({ column }: { column: Column<TData> }) => {
    return (
      <TableHead
        id={column.id}
        className={clsx(UI_TABLE_HEAD_STRONG_MODIFIER, className)}
      >
        &nbsp;
      </TableHead>
    )
  }

export default EmptyHeaderCell
