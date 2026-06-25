import { useVirtualizer } from '@tanstack/react-virtual'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { VirtualItem } from '@tanstack/react-virtual'
import type { RefObject } from 'react'

/** Default estimated row height (px) fed to the virtualizer. */
const DEFAULT_ROW_ESTIMATE_PX = 54

/** Default number of extra rows rendered above/below the viewport to smooth scrolling. */
const DEFAULT_OVERSCAN = 20

/** Default fraction of total height past which the scroll is considered "near the bottom". */
const DEFAULT_NEAR_BOTTOM_THRESHOLD = 0.95

/**
 * Options tuning the row virtualizer. All optional — sensible defaults are applied so the hook can be
 * called with only a row count.
 */
export interface UseVirtualizedTableOptions {
  /** Estimated row height (px) fed to the virtualizer. Defaults to `54`. */
  estimateRowHeight?: number
  /** Extra rows rendered above/below the viewport to smooth scrolling. Defaults to `20`. */
  overscan?: number
  /** Fraction of total height past which the scroll counts as "near the bottom". Defaults to `0.95`. */
  nearBottomThreshold?: number
}

/**
 * The wiring returned by {@link useVirtualizedTable}: the refs to attach plus the virtual rows to
 * render and the total scrollable height.
 */
export interface UseVirtualizedTableResult {
  /** Attach to the scrollable viewport element (the virtualizer's scroll container). */
  parentRef: RefObject<HTMLDivElement | null>
  /** Attach to the inner spacer element sized to {@link UseVirtualizedTableResult.totalSize}. */
  scrollableRef: RefObject<HTMLDivElement | null>
  /** Attach to the `<table>` element (its `::after` consumes the `--pseudo-height` custom property). */
  tableRef: RefObject<HTMLTableElement | null>
  /** The currently materialized virtual rows to render. */
  virtualItems: VirtualItem[]
  /** The total scrollable height (px) of all rows — set as the spacer element height. */
  totalSize: number
}

/**
 * Resizes a `::after` pseudo-element on the table so the table's own height matches the full virtual
 * height.
 *
 * This is the sticky-header + virtualization fix (TanStack/virtual#640): a virtualized `<tbody>` is
 * not tall enough to keep a `position: sticky` header's containing block scrollable, so the table is
 * extended with a pseudo-element whose height absorbs the difference. The `--pseudo-height` custom
 * property is scoped to the table element (its `::after` inherits it) rather than written on `<html>`,
 * so multiple instances don't clobber each other and SSR stays safe.
 *
 * @param tableRef - Ref to the `<table>` whose `::after` height is adjusted.
 * @param virtualHeight - The total virtual height (px) the table should span.
 * @returns The computed pseudo-element height (px), or `undefined` when the table is not mounted.
 */
const adjustTableHeight = (
  tableRef: RefObject<HTMLTableElement | null>,
  virtualHeight: number
): number | undefined => {
  if (!tableRef.current) return

  // Read the height already absorbed by the pseudo-element so the table's intrinsic height is not
  // double-counted on successive resizes.
  const existingPseudoElement = window.getComputedStyle(
    tableRef.current,
    '::after'
  )
  const existingPseudoHeight = parseFloat(existingPseudoElement.height) || 0
  const tableHeight = tableRef.current.clientHeight - existingPseudoHeight
  const pseudoHeight = Math.max(virtualHeight - tableHeight, 0)

  tableRef.current.style.setProperty(
    '--pseudo-height',
    `${String(pseudoHeight)}px`
  )

  return pseudoHeight
}

/**
 * Headless row virtualization for a table: owns the virtualizer, the scroll / near-bottom tracking and
 * the sticky-header `--pseudo-height` adjustment, and returns the refs to attach plus the virtual rows
 * to render.
 *
 * Engine-agnostic by design — it takes only the **row count**, never the table instance — so it can be
 * reused across framework adapters and survives swapping the table engine (e.g. `react-table` →
 * `table-core`). The caller keeps its own row list to index into via `virtualItem.index`.
 *
 * @param rowCount - The total number of rows to virtualize (e.g. `table.getRowModel().rows.length`).
 * @param options - Optional {@link UseVirtualizedTableOptions} tuning the virtualizer.
 * @returns The {@link UseVirtualizedTableResult} refs, virtual rows and total height.
 */
export function useVirtualizedTable(
  rowCount: number,
  options?: UseVirtualizedTableOptions
): UseVirtualizedTableResult {
  const {
    estimateRowHeight = DEFAULT_ROW_ESTIMATE_PX,
    overscan = DEFAULT_OVERSCAN,
    nearBottomThreshold = DEFAULT_NEAR_BOTTOM_THRESHOLD,
  } = options ?? {}

  const parentRef = useRef<HTMLDivElement>(null)
  const scrollableRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)

  const [isScrollNearBottom, setIsScrollNearBottom] = useState(false)

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight,
    overscan,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  // Resize the pseudo-element whenever the total virtual height changes.
  const handlePseudoResize = useCallback(() => {
    adjustTableHeight(tableRef, totalSize)
  }, [totalSize])

  // Track whether the scroll position is near the bottom so we can re-resize the pseudo-element as new
  // rows are materialized at the tail (otherwise we scroll too far or too short).
  const handleScroll = useCallback(() => {
    if (parentRef.current) {
      const scrollPosition = parentRef.current.scrollTop
      const visibleHeight = parentRef.current.clientHeight
      setIsScrollNearBottom(
        scrollPosition > totalSize * nearBottomThreshold - visibleHeight
      )
    }
  }, [totalSize, nearBottomThreshold])

  // Listen on the scrollable parent and resize the pseudo-element whenever the table renders new data.
  useEffect(() => {
    const scrollable = parentRef.current
    if (scrollable) scrollable.addEventListener('scroll', handleScroll)
    handlePseudoResize()

    return () => {
      if (scrollable) scrollable.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll, handlePseudoResize])

  // Near the bottom, re-resize each time the number of materialized rows changes.
  useEffect(() => {
    if (isScrollNearBottom) handlePseudoResize()
  }, [isScrollNearBottom, virtualItems.length, handlePseudoResize])

  return { parentRef, scrollableRef, tableRef, virtualItems, totalSize }
}

export default useVirtualizedTable
