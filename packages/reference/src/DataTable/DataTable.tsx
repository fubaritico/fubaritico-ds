import { flexRender } from '@tanstack/react-table'
import clsx from 'clsx'
import { Fragment, useEffect } from 'react'

import { ActionBar, NoResults, TableFooter } from './components'
import { MIN_PAGE_SIZE } from './DataTable.constants'
import { Table, TableBody, TableHeader, TableRow } from './ui/table'

import type { BaseDataTableProps } from './DataTable.types'
import type { Table as TableType } from '@tanstack/react-table'

export type DataTableProps<TData> = BaseDataTableProps<TData> & {
  /* Use along with sticky header to get a fixed height for the table (header and body) */
  maxHeight?: number
  /* When enabled, will keep the table cell header on top of the table when scrolling body */
  stickyHeader?: boolean
}

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
  noShadow,
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
    throw Error(
      '[DataTable] maxHeight is required when stickyHeader is enabled'
    )
  }

  if (!stickyHeader && maxHeight) {
    throw Error(
      '[DataTable] stickyHeader is required when maxHeight is defined'
    )
  }

  return (
    <div
      className={clsx(
        'tw-bg-white tw-rounded-bl-lg tw-rounded-lg tw-overflow-clip',
        { 'tw-shadow-elevation-1': !noShadow },
        className
      )}
      data-test={dataTestId ?? 'root'}
    >
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
      <Table maxHeight={maxHeight}>
        <TableHeader
          className={clsx(
            { 'tw-sticky tw-top-0 tw-z-30': stickyHeader },
            headerClassName
          )}
        >
          {tableStateManager.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="[&_th]:tw-bg-gray-100">
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
            {loading &&
              RowSkeleton &&
              Array.from({ length: MIN_PAGE_SIZE }, (_, index) => (
                <RowSkeleton key={`row-skeleton-${index}`} />
              ))}
            {!loading &&
              tableStateManager.getRowModel().rows?.length > 0 &&
              tableStateManager.getRowModel().rows.map((row) => {
                const isSelected = row.getIsSelected()

                return (
                  <TableRow
                    className={clsx('tw-h-[54px]', {
                      'tw-cursor-pointer': !!onRowClick,
                    })}
                    data-test={`row-${row.id}`}
                    data-state={isSelected && 'selected'}
                    enableHover
                    key={`row-${row.id}`}
                    onClick={() => onRowClick?.(row)}
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
        !noPagination && <TableFooter tableStateManager={tableStateManager} />}
    </div>
  )
}
