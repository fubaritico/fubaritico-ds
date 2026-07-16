import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import clsx from 'clsx'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react'

import DataTable from '../DataTable/DataTable'
import DataTableVirtualized from '../DataTable/DataTableVirtualized'
import { toEpochMs } from '../DataTable/utils'

import JobRowSkeleton from './JobRowSkeleton'
import useColumnsDefinition from './useColumnsDefinition'

import type { JobItem } from './jobFactory'
import type { DataTableProps } from '../DataTable'
import type {
  RowSelectionState,
  SortingState,
  TableOptions,
  Updater,
} from '@tanstack/react-table'
import type { FC } from 'react'

/** Default viewport height (px) for the virtualized table when none is provided. */
const DEFAULT_VIRTUALIZED_HEIGHT = 600

export type DataTableExampleProps = Pick<
  DataTableProps<JobItem>,
  'loading' | 'initTableAt' | 'maxHeight' | 'stickyHeader'
> & {
  /** Extra CSS classes for the wrapper element. */
  className?: string
  /** The rows to display (defaults to an empty list). */
  data?: JobItem[]
  /** Locale used to format the date columns (e.g. `'en_US'`). */
  locale: string
  /** Render the virtualized table (`DataTableVirtualized`) instead of the paginated one. */
  virtualized?: boolean
  /** Viewport height (px) for the virtualized table (only used when `virtualized`). */
  height?: number
  /** Add a row-selection column and enable TanStack row selection. */
  enableRowSelection?: boolean
  /**
   * Wrap row-selection state updates in `startTransition` so a mass toggle (select-all) stays
   * responsive at scale. Mirrors the AG-Grid lesson: keep the heavy state update off the
   * blocking render path.
   */
  useTransitionForSelection?: boolean
  /**
   * When `true`, logs the perceived latency of every selection change (click → painted) via
   * `console.warn`. Benchmark-only — leave off in real usage.
   */
  debugTimings?: boolean
}

/**
 * Example container wiring the jobs data into a TanStack table instance and injecting it into the
 * presentational `DataTable` / `DataTableVirtualized`. This is the dependency-injection seam: the
 * table state manager is built here and passed down (the table itself stays presentational).
 *
 * @param props - {@link DataTableExampleProps}.
 * @returns The wired (paginated or virtualized) DataTable.
 */
const DataTableExample: FC<DataTableExampleProps> = ({
  className,
  data = [],
  initTableAt,
  loading,
  locale,
  virtualized = false,
  height = DEFAULT_VIRTUALIZED_HEIGHT,
  enableRowSelection = false,
  useTransitionForSelection = false,
  debugTimings = false,
  ...rest
}) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [, startTransition] = useTransition()

  // Timestamp (perf clock) captured when a selection toggle fires, read back after paint to log
  // the perceived latency. Benchmark-only; null when no measurement is pending.
  const selectionStartRef = useRef<number | null>(null)

  const columns = useColumnsDefinition(locale ?? 'en_US', {
    withSelection: enableRowSelection,
  })

  const handleRowSelectionChange = useCallback(
    (updater: Updater<RowSelectionState>) => {
      if (debugTimings) selectionStartRef.current = performance.now()
      if (useTransitionForSelection) {
        startTransition(() => {
          setRowSelection(updater)
        })
      } else {
        setRowSelection(updater)
      }
    },
    [debugTimings, useTransitionForSelection]
  )

  // After the selection commit has painted, log the click → painted latency. A double rAF defers
  // the read past the browser paint that follows React's commit.
  useEffect(() => {
    if (!debugTimings) return
    const start = selectionStartRef.current
    if (start === null) return
    selectionStartRef.current = null

    const selectedCount = Object.keys(rowSelection).length
    let innerRaf = 0
    const outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => {
        const elapsed = performance.now() - start
        console.warn(
          `[DataTable] selection: ${elapsed.toFixed(1)}ms — ${String(
            selectedCount
          )} selected (transition ${useTransitionForSelection ? 'on' : 'off'})`
        )
      })
    })

    return () => {
      cancelAnimationFrame(outerRaf)
      cancelAnimationFrame(innerRaf)
    }
  }, [rowSelection, debugTimings, useTransitionForSelection])

  const configuration: TableOptions<JobItem> = useMemo(
    () => ({
      columns,
      data,
      getCoreRowModel: getCoreRowModel(),
      // Required for client-side filtering (the ActionBar quick filter drives `globalFilter`) — without
      // it TanStack updates the filter state but never filters the rows.
      getFilteredRowModel: getFilteredRowModel(),
      // Virtualized mode feeds ALL rows to the virtualizer → no pagination row model.
      ...(virtualized
        ? {}
        : { getPaginationRowModel: getPaginationRowModel() }),
      getSortedRowModel: getSortedRowModel(),
      enableRowSelection,
      getRowId: (row) => row.id,
      onRowSelectionChange: handleRowSelectionChange,
      onSortingChange: setSorting,
      sortingFns: {
        sortByDate: (rowA, rowB, columnId): number =>
          toEpochMs(rowA.getValue<number>(columnId)) <
          toEpochMs(rowB.getValue<number>(columnId))
            ? 1
            : -1,
      },
      onGlobalFilterChange: setGlobalFilter,
      state: {
        sorting,
        globalFilter,
        rowSelection,
      },
    }),
    [
      columns,
      data,
      virtualized,
      enableRowSelection,
      handleRowSelectionChange,
      sorting,
      globalFilter,
      rowSelection,
    ]
  )

  const tableStateManager = useReactTable(configuration)

  return (
    <div className={clsx('flex flex-col', className)}>
      {virtualized ? (
        <DataTableVirtualized
          tableStateManager={tableStateManager}
          height={height}
          loading={loading}
          noPagination
          onGlobalFilterChange={setGlobalFilter}
          rowsSkeleton={JobRowSkeleton}
        />
      ) : (
        <DataTable
          tableStateManager={tableStateManager}
          initTableAt={initTableAt}
          loading={loading}
          onGlobalFilterChange={setGlobalFilter}
          rowsSkeleton={JobRowSkeleton}
          {...rest}
        />
      )}
    </div>
  )
}

export default DataTableExample
