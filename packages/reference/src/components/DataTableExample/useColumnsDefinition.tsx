import { useMemo } from 'react'

import {
  CheckboxCell,
  CheckboxHeaderCell,
  DateCell,
  JobStatusCell,
  SimpleCell,
  SortableHeaderCell,
  TruncableLinkCell,
} from '../DataTable'
import { toEpochMs } from '../DataTable/utils'

import type { JobItem } from './jobFactory'
import type { ColumnDef, SortingFn } from '@tanstack/react-table'

/**
 * Sorts two rows on a date column (Unix seconds or milliseconds, normalised by {@link toEpochMs}).
 * Passed to the columns as a function, not registered by name on TanStack's `SortingFns`: a module
 * augmentation would make `sortingFns` required on every table of every consumer. Same direction
 * convention as `sortNumbers` (`DataTable/sorting`); equal dates return `0` so the sort stays stable.
 *
 * @param rowA - First row whose value will be compared.
 * @param rowB - Second row whose value will be compared.
 * @param columnId - Column id (property name) to sort on.
 * @returns A negative number, `0`, or a positive number, per the comparator contract.
 */
const sortByDate: SortingFn<JobItem> = (rowA, rowB, columnId) => {
  const dateA = toEpochMs(rowA.getValue<number>(columnId))
  const dateB = toEpochMs(rowB.getValue<number>(columnId))

  if (dateA === dateB) return 0

  return dateA < dateB ? 1 : -1
}

/** Time zone used to format the date columns (was a user setting; constant for the demo). */
const TIMEZONE = 'GMT'

/** Options toggling the optional columns of the jobs DataTable. */
export interface ColumnsDefinitionOptions {
  /** When `true`, prepends a row-selection column (select-all header + per-row checkbox). */
  withSelection?: boolean
}

/**
 * Builds the column definitions for the jobs DataTable example.
 *
 * @param locale - Locale used to format date cells (e.g. `'en_US'`).
 * @param options - Optional column toggles (e.g. the row-selection column).
 * @returns The TanStack column definitions for {@link JobItem}.
 */
export default function useColumnsDefinition(
  locale: string,
  options?: ColumnsDefinitionOptions
): ColumnDef<JobItem>[] {
  const withSelection = options?.withSelection ?? false

  return useMemo<ColumnDef<JobItem>[]>(() => {
    const dataColumns: ColumnDef<JobItem>[] = [
      {
        accessorKey: 'customName',
        header: SortableHeaderCell('customName', 'Name', true, 'link-name'),
        cell: TruncableLinkCell('customName', '#'),
      },
      {
        accessorKey: 'id',
        header: SortableHeaderCell('id', 'ID', true),
        cell: SimpleCell('id'),
      },
      {
        accessorKey: 'systemModStamp',
        sortingFn: sortByDate,
        header: SortableHeaderCell(
          'systemModStamp',
          'system mod stamp',
          true,
          'date'
        ),
        cell: DateCell('systemModStamp', locale, TIMEZONE, true),
      },
      {
        accessorKey: 'lastModifiedDate',
        sortingFn: sortByDate,
        header: SortableHeaderCell(
          'lastModifiedDate',
          'last modified date',
          true,
          'date'
        ),
        cell: DateCell('lastModifiedDate', locale, TIMEZONE, true),
      },
      {
        accessorKey: 'createdDate',
        sortingFn: sortByDate,
        header: SortableHeaderCell('createdDate', 'created date', true, 'date'),
        cell: DateCell('createdDate', locale, TIMEZONE, true),
      },
      {
        accessorKey: 'status',
        header: SortableHeaderCell('status', 'Status'),
        cell: JobStatusCell(),
      },
    ]

    if (!withSelection) return dataColumns

    return [
      {
        id: 'select',
        enableSorting: false,
        header: CheckboxHeaderCell('select-all-rows'),
        cell: CheckboxCell(),
      },
      ...dataColumns,
    ]
  }, [locale, withSelection])
}
