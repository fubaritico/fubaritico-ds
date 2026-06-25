import { flexRender } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'

import { ActionBar, NoResults, TableFooter } from './components'
import { MIN_PAGE_SIZE } from './DataTable.constants'
import { TableBody, TableHeader, TableRow, TableVirtualized } from './ui/table'

import type { BaseDataTableProps } from './DataTable.types'
import type { Table as TableType } from '@tanstack/react-table'
import type { RefObject } from 'react'

/** Estimated row height (px) for the virtualizer. */
const ROW_ESTIMATE_PX = 54

/** Extra rows rendered above/below the viewport to smooth scrolling. */
const VIRTUALIZER_OVERSCAN = 20

/** Fraction of total height past which the scroll is considered "near the bottom". */
const NEAR_BOTTOM_THRESHOLD = 0.95

export type DataTableVirtualizedProps<TData> = BaseDataTableProps<TData> & {
  /* Use along with sticky header to get a fixed height for the table (header and body) */
  height: number
}

const adjustTableHeight = (
  tableRef: RefObject<HTMLTableElement | null>,
  virtualHeight: number
) => {
  if (!tableRef.current) return

  // calculate the height for the pseudo-element after the table
  const existingPseudoElement = window.getComputedStyle(
    tableRef.current,
    '::after'
  )

  const existingPseudoHeight = parseFloat(existingPseudoElement.height) || 0
  const tableHeight = tableRef.current.clientHeight - existingPseudoHeight
  const pseudoHeight = Math.max(virtualHeight - tableHeight, 0)

  // Scope the var to the table element (its `::after` inherits it) instead of writing it on
  // <html> — a global write would clobber other DataTableVirtualized instances and break SSR.
  tableRef.current.style.setProperty(
    '--pseudo-height',
    `${String(pseudoHeight)}px`
  )

  return pseudoHeight
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
 * @constructor
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
  const parentRef = useRef<HTMLDivElement>(null)
  const scrollableRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)

  const [isScrollNearBottom, setIsScrollNearBottom] = useState(false)

  const { rows } = tableStateManager.getRowModel()

  // Instantiating rows virtualizer
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_ESTIMATE_PX,
    overscan: VIRTUALIZER_OVERSCAN,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const virtualSize = virtualizer.getTotalSize()

  // Callback to adjust the height of the pseudo element
  const handlePseudoResize = useCallback(() => {
    adjustTableHeight(tableRef, virtualSize)
  }, [virtualSize])

  // Callback to handle scrolling, checking if we are near the bottom
  const handleScroll = useCallback(() => {
    if (parentRef.current) {
      const scrollPosition = parentRef.current.scrollTop
      const visibleHeight = parentRef.current.clientHeight
      setIsScrollNearBottom(
        scrollPosition > virtualSize * NEAR_BOTTOM_THRESHOLD - visibleHeight
      )
    }
  }, [virtualSize])

  // Add an event listener on the scrollable parent container and resize the
  // pseudo-element whenever the table renders with new data
  useEffect(() => {
    const scrollable = parentRef.current
    if (scrollable) scrollable.addEventListener('scroll', handleScroll)
    handlePseudoResize()

    return () => {
      if (scrollable) scrollable.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll, handlePseudoResize])

  // If we are near the bottom of the table, resize the pseudo element each time
  // the length of virtual items changes (which is effectively the number of table
  // rows rendered to the DOM). This ensures we don't scroll too far or too short.
  useEffect(() => {
    if (isScrollNearBottom) handlePseudoResize()
  }, [isScrollNearBottom, virtualItems.length, handlePseudoResize])

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
        <div
          ref={scrollableRef}
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
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
                {loading &&
                  RowSkeleton &&
                  Array.from({ length: MIN_PAGE_SIZE }, (_, index) => (
                    <RowSkeleton key={`row-skeleton-${index}`} />
                  ))}
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
                {!loading &&
                  tableStateManager.getRowModel().rows?.length === 0 && (
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
