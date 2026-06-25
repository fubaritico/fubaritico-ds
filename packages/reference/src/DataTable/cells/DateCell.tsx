import { type Row } from '@tanstack/react-table'

import { toEpochMs } from '../normalizeTimestamp'
import { TableCell } from '../ui/table'

import type { ReactNode } from 'react'

/** Narrows an unknown cell value to a usable epoch timestamp (a positive finite number). */
const isTimestamp = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0

/**
 * Cell factory rendering an epoch timestamp as a localized date/time via `Intl.DateTimeFormat`.
 * Replaces the original `FriendlyDate` + `isTimestamp`; timestamps are normalised to ms by
 * {@link toEpochMs} (the source mixes seconds/milliseconds).
 *
 * @param colName - Key to read the timestamp from the row.
 * @param locale - BCP-47-ish locale (e.g. `'fr_FR'`; underscores are normalised to hyphens). Defaults to `'fr_FR'`.
 * @param timezone - IANA time zone (e.g. `'GMT'`, `'Europe/Paris'`). Defaults to `'GMT'`.
 * @param className - Optional extra classes for the cell.
 * @returns A TanStack cell renderer for a date column.
 */
const DateCell = (
  colName: string,
  locale = 'fr_FR',
  timezone = 'GMT',
  className?: string
) => {
  // Built once per column factory (Intl.DateTimeFormat construction is expensive) and reused per row.
  const formatter = new Intl.DateTimeFormat(locale.replace('_', '-'), {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone,
  })

  return <TData,>({ row }: { row: Row<TData> }): ReactNode => {
    const value = row.getValue(colName)

    // The visible text is the accessible content (no aria-label on the cell role; no extra tab stop).
    return (
      <TableCell className={className}>
        {isTimestamp(value)
          ? formatter.format(new Date(toEpochMs(value)))
          : '-'}
      </TableCell>
    )
  }
}

export default DateCell
