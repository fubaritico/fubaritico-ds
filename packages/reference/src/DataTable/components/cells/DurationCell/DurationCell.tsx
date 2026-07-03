import { UI_TABLE_DURATION_CLASS } from '@fubaritico-ds/variants'

import { formatDuration } from '../../../utils'
import { TableCell } from '../../primitives/TableCell'

import type { Row } from '@tanstack/react-table'
import type { ReactNode } from 'react'

/**
 * Duration cell factory — reads an `"HH:mm:ss"` string from `colName` on each row and renders a
 * human-readable label (e.g. "1 hour 30 mins") via {@link formatDuration}.
 *
 * @param colName - Column key used to read the duration value from the row.
 * @param className - Optional extra classes for the cell.
 * @returns A TanStack cell renderer.
 */
const DurationCell =
  (colName: string, className?: string) =>
  <TData,>({ row }: { row: Row<TData> }): ReactNode => {
    const formatted = formatDuration(row.getValue<string>(colName))
    return (
      <TableCell className={className}>
        <span className={UI_TABLE_DURATION_CLASS}>{formatted}</span>
      </TableCell>
    )
  }

export default DurationCell
