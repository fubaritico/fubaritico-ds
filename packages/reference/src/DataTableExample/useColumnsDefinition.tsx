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

import type { JobItem } from './jobFactory'
import type { ColumnDef, SortingFn } from '@tanstack/react-table'

/**
 * Registers the custom `sortByDate` sorting function on TanStack's `SortingFns` map so columns can
 * reference it by name (the implementation is provided in the table options of the consumer).
 */
declare module '@tanstack/react-table' {
  interface SortingFns {
    sortByDate: SortingFn<unknown>
  }
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
        sortingFn: 'sortByDate',
        header: SortableHeaderCell(
          'systemModStamp',
          'system mod stamp',
          true,
          'date'
        ),
        cell: DateCell('systemModStamp', locale, TIMEZONE),
      },
      {
        accessorKey: 'lastModifiedDate',
        sortingFn: 'sortByDate',
        header: SortableHeaderCell(
          'lastModifiedDate',
          'last modified date',
          true,
          'date'
        ),
        cell: DateCell('lastModifiedDate', locale, TIMEZONE),
      },
      {
        accessorKey: 'createdDate',
        sortingFn: 'sortByDate',
        header: SortableHeaderCell('createdDate', 'created date', true, 'date'),
        cell: DateCell('createdDate', locale, TIMEZONE),
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
