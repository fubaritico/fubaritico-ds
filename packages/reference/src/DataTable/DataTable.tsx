import { flexRender } from '@tanstack/react-table'
import clsx from 'clsx'
import { Fragment, useCallback, useEffect, useMemo } from 'react'

import { UI_TABLE_HEADER_STICKY_MODIFIER } from '@fubaritico-ds/variants'

import { Card } from '../Card'

import {
  ActionBar,
  NoResults,
  Table,
  TableBody,
  TableFooterContent,
  TableHeader,
  TableRow,
} from './components'
import { MIN_PAGE_SIZE } from './DataTable.constants'

import type { BaseDataTableProps } from './DataTable.types'
import type { Row, Table as TableType } from '@tanstack/react-table'

export type DataTableProps<TData> = BaseDataTableProps<TData> & {
  /** Fixed height (px) for the table (header and body); use together with `stickyHeader`. */
  maxHeight?: number
  /** When enabled, keeps the header row pinned on top while the body scrolls. */
  stickyHeader?: boolean
}

/**
 * Paginated DataTable driven by an injected TanStack table state manager: renders an optional action
 * bar, the header/body, and pagination controls below the table.
 *
 * @param props - {@link DataTableProps}.
 * @returns The paginated table element.
 */
export default function DataTable<TData>({
  actionBar,
  actionBarClassName,
  className,
  dataTestId,
  headerClassName,
  initTableAt,
  leftActions,
  loading,
  maxHeight,
  noActionBar,
  noPagination,
  onGlobalFilterChange,
  onRowClick,
  rowsSkeleton: RowSkeleton,
  stickyHeader,
  tableStateManager,
  tBodyClassName,
}: Readonly<DataTableProps<TData>>) {
  useEffect(() => {
    if (initTableAt) tableStateManager.setPageIndex(initTableAt)
  }, [initTableAt, tableStateManager])

  if (stickyHeader && !maxHeight) {
    throw new Error(
      '[DataTable] maxHeight is required when stickyHeader is enabled'
    )
  }

  if (!stickyHeader && maxHeight) {
    throw new Error(
      '[DataTable] stickyHeader is required when maxHeight is defined'
    )
  }

  const headerGroups = useMemo(
    () => tableStateManager.getHeaderGroups(),
    [tableStateManager]
  )

  const handleRowClick = useCallback(
    (row: Row<TData>) => {
      onRowClick?.(row)
    },
    [onRowClick]
  )

  return (
    <Card className={className} data-test={dataTestId ?? 'root'}>
      {/* Bare Card surface (no Card.Body/Header/Footer slots): the DataTable is flush to the edges —
          each region (action bar, table, pagination) owns its own spacing. */}
      {!noActionBar && !actionBar && (
        <ActionBar
          tableConfiguration={tableStateManager as TableType<unknown>}
          className={actionBarClassName}
          leftActions={leftActions}
          stickyHeader={stickyHeader}
          onGlobalFilterChange={onGlobalFilterChange}
        />
      )}
      {actionBar}
      <Table maxHeight={maxHeight} aria-busy={loading}>
        <TableHeader
          className={clsx(
            { [UI_TABLE_HEADER_STICKY_MODIFIER]: stickyHeader },
            headerClassName
          )}
        >
          {headerGroups.map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <Fragment key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </Fragment>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className={tBodyClassName}>
          <>
            {loading && RowSkeleton
              ? Array.from({ length: MIN_PAGE_SIZE }, (_, index) => (
                  <RowSkeleton key={`row-skeleton-${index}`} />
                ))
              : null}
            {!loading &&
              tableStateManager.getRowModel().rows?.length > 0 &&
              tableStateManager.getRowModel().rows.map((row) => {
                const isSelected = row.getIsSelected()

                return (
                  <TableRow
                    data-test={`row-${row.id}`}
                    data-state={isSelected ? 'selected' : null}
                    aria-selected={isSelected}
                    enableHover
                    key={`row-${row.id}`}
                    role={onRowClick ? 'button' : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onClick={
                      onRowClick
                        ? () => {
                            handleRowClick(row)
                          }
                        : undefined
                    }
                    onKeyDown={
                      onRowClick
                        ? (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              handleRowClick(row)
                            }
                          }
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Fragment key={`cell-${row.id}-${cell.id}`}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Fragment>
                    ))}
                  </TableRow>
                )
              })}
            {!loading && tableStateManager.getRowModel().rows?.length === 0 && (
              <NoResults
                columnLength={
                  tableStateManager
                    .getAllColumns()
                    .filter((column) => column.getIsVisible()).length
                }
              />
            )}
          </>
        </TableBody>
      </Table>

      {/* PAGINATION BLOCK */}
      {!loading &&
        tableStateManager.getRowCount() > MIN_PAGE_SIZE &&
        !noPagination && (
          <TableFooterContent tableStateManager={tableStateManager} />
        )}
    </Card>
  )
}
