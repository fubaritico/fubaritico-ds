import { flexRender } from '@tanstack/react-table'
import clsx from 'clsx'
import { Fragment } from 'react'

import { ActionBar, NoResults, TableFooter } from './components'
import { MIN_PAGE_SIZE } from './DataTable.constants'
import { useVirtualizedTable } from './hooks/useVirtualizedTable'
import { TableBody, TableHeader, TableRow, TableVirtualized } from './ui/table'

import type { BaseDataTableProps } from './DataTable.types'
import type { Table as TableType } from '@tanstack/react-table'

export type DataTableVirtualizedProps<TData> = BaseDataTableProps<TData> & {
  /** Viewport height (px) of the scrollable table region (header + virtualized body). */
  height: number
}

/**
 * DataTableVirtualized
 *
 * Virtualized example:
 * https://tanstack.com/virtual/v3/docs/framework/react/examples/table
 *
 * Sticky header issue:
 * https://github.com/TanStack/virtual/issues/640
 * The solution
 * https://codesandbox.io/p/devbox/elegant-flower-trk8tt
 *
 * IMPORTANT: The table state manager instance has been lifted up to the parent component to allow
 * a much better ability to configure, create filters, etc.
 *
 * @param props - {@link DataTableVirtualizedProps}.
 * @returns The virtualized DataTable.
 */
export default function DataTableVirtualized<TData>({
  actionBar,
  actionBarClassName,
  className,
  dataTestId,
  headerClassName,
  leftActions,
  loading,
  height,
  noActionBar,
  noShadow,
  noPagination,
  onGlobalFilterChange,
  rowsSkeleton: RowSkeleton,
  tableStateManager,
  tBodyClassName,
}: Readonly<DataTableVirtualizedProps<TData>>) {
  const { rows } = tableStateManager.getRowModel()

  const { parentRef, scrollableRef, tableRef, virtualItems, totalSize } =
    useVirtualizedTable(rows.length)

  return (
    <div
      className={clsx(
        'tw-bg-white tw-rounded-bl-lg tw-rounded-lg tw-overflow-clip',
        {
          'tw-shadow-elevation-1': !noShadow,
        },
        className
      )}
      data-test={dataTestId ?? 'root'}
    >
      {!noActionBar && !actionBar && (
        <ActionBar
          tableConfiguration={tableStateManager as TableType<unknown>}
          className={actionBarClassName}
          leftActions={leftActions}
          stickyHeader
          onGlobalFilterChange={onGlobalFilterChange}
        />
      )}
      {actionBar}
      <div ref={parentRef} style={{ height: `${height}px`, overflow: 'auto' }}>
        <div ref={scrollableRef} style={{ height: `${totalSize}px` }}>
          <TableVirtualized
            ref={tableRef}
            className="after:tw-block after:tw-h-[--pseudo-height] after:content-['']"
          >
            <TableHeader
              className={clsx('tw-sticky tw-top-0 tw-z-30', headerClassName)}
            >
              {tableStateManager.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="[&_th]:tw-bg-gray-100"
                >
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
                  virtualItems.length > 0 &&
                  virtualItems.map((virtualRow, index) => {
                    const row = rows[virtualRow.index]

                    return (
                      <TableRow
                        data-test={`row-${row.id}`}
                        data-state={row.getIsSelected() && 'selected'}
                        enableHover
                        key={`row-${row.id}`}
                        style={{
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${
                            virtualRow.start - index * virtualRow.size
                          }px)`,
                        }}
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
                {!loading && rows.length === 0 && (
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
          </TableVirtualized>
        </div>
      </div>

      {/* TABLE FOOTER BLOCK */}
      {!loading &&
        tableStateManager.getRowCount() > MIN_PAGE_SIZE &&
        !noPagination && <TableFooter tableStateManager={tableStateManager} />}
    </div>
  )
}
