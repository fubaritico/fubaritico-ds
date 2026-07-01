import { TableCell } from '../../primitives/TableCell'

import type { Row } from '@tanstack/react-table'
import type { ReactNode } from 'react'

/**
 * Formats an `"HH:mm:ss"` duration string into a human-readable label (e.g. "1 hour 30 mins").
 * Native parsing (split on `:`) — no date library; non-numeric / missing segments coerce to 0.
 *
 * @param durationString - Duration in `"HH:mm:ss"` format.
 * @returns The formatted duration, or an empty string when every segment is 0.
 */
const formatDuration = (durationString: string): string => {
  const [hours = 0, minutes = 0, seconds = 0] = durationString
    .split(':')
    .map(Number)

  const parts: string[] = []
  if (hours > 0) parts.push(`${String(hours)} hour${hours > 1 ? 's' : ''}`)
  if (minutes > 0) parts.push(`${String(minutes)} min${minutes > 1 ? 's' : ''}`)
  if (seconds > 0) parts.push(`${String(seconds)} sec${seconds > 1 ? 's' : ''}`)

  return parts.join(' ')
}
const DurationCell =
  (colName: string, className?: string) =>
  <TData,>({ row }: { row: Row<TData> }): ReactNode => {
    const date = row.getValue(colName) as string
    return (
      <TableCell
        aria-label={formatDuration(date)}
        className={className}
        tabIndex={0}
      >
        <div className="tw-flex tw-items-center">
          <div className="tw-flex tw-flex-wrap tw-gap-x-2 tw-items-baseline">
            <p className="tw-font-medium">{formatDuration(date)}</p>
          </div>
        </div>
      </TableCell>
    )
  }
export default DurationCell
