import clsx from 'clsx'
import { useMemo } from 'react'

import {
  PAGINATION_CLASS,
  PAGINATION_DOUBLE_CHEVRON_CLASS,
  PAGINATION_NAV_CLASS,
  PAGINATION_PAGES_CLASS,
  paginationPageVariants,
} from '@fubaritico-ds/variants'

import { Icon } from '../Icon'

import type { ComponentProps } from 'react'

/** Props of the {@link Pagination} component — fully controlled (state lifted to the parent). */
export interface PaginationProps extends ComponentProps<'div'> {
  /** Whether a next page exists (enables the next/last arrows). */
  canNextPage: boolean
  /** Whether a previous page exists (enables the previous/first arrows). */
  canPreviousPage: boolean
  /** Total number of pages. */
  countPages: number
  /** Current page index (0-based). */
  currentPage: number
  /** Jump to the first page. */
  gotoFirst: () => void
  /** Jump to the last page. */
  gotoLast: () => void
  /** Go to the next page. */
  gotoNext: () => void
  /** Go to the previous page. */
  gotoPrevious: () => void
  /** Go to a specific page index (0-based). */
  handleChangePage: (value: number) => void
}

/** Number of page-number buttons shown in the sliding window. */
const PAGINATION_LENGTH = 5

/** Page position (1-based) past which the window starts sliding. */
const OFFSET_THRESHOLD = 3

/** Pixel size of the arrow chevron glyphs. */
const CHEVRON_SIZE = 20

/**
 * Page-navigation control — a presentational, fully-controlled primitive: first / previous arrows, a
 * sliding window of up to five page buttons, then next / last arrows. All state (current page, page
 * count, can-go-next/previous) is lifted to the parent, so it wires straight onto a table's pagination
 * API. The skin owns the look (`.ui-pagination`); double-chevron jumps overlap two single chevrons.
 *
 * @param props - {@link PaginationProps}.
 * @returns The rendered pagination row.
 */
export function Pagination({
  canNextPage,
  canPreviousPage,
  countPages,
  currentPage,
  gotoFirst,
  gotoLast,
  gotoNext,
  gotoPrevious,
  handleChangePage,
  className,
  ...rest
}: Readonly<PaginationProps>) {
  const offset = useMemo(() => {
    if (countPages < PAGINATION_LENGTH) return 0

    const maxOffsetValue = countPages - PAGINATION_LENGTH
    const allowedValue =
      currentPage + 1 - OFFSET_THRESHOLD >= maxOffsetValue
        ? maxOffsetValue
        : currentPage + 1 - OFFSET_THRESHOLD

    return currentPage + 1 > OFFSET_THRESHOLD ? allowedValue : 0
  }, [countPages, currentPage])

  const pageCount =
    countPages > PAGINATION_LENGTH ? PAGINATION_LENGTH : countPages

  return (
    <div
      className={clsx(PAGINATION_CLASS, className)}
      data-test="pagination"
      {...rest}
    >
      <button
        type="button"
        aria-label="go to first page"
        className={PAGINATION_NAV_CLASS}
        onClick={gotoFirst}
        disabled={!canPreviousPage}
      >
        <span className={PAGINATION_DOUBLE_CHEVRON_CLASS} aria-hidden="true">
          <Icon name="ChevronLeft" size={CHEVRON_SIZE} />
          <Icon name="ChevronLeft" size={CHEVRON_SIZE} />
        </span>
      </button>
      <button
        type="button"
        aria-label="go to previous page"
        className={PAGINATION_NAV_CLASS}
        onClick={gotoPrevious}
        disabled={!canPreviousPage}
      >
        <Icon name="ChevronLeft" size={CHEVRON_SIZE} aria-hidden="true" />
      </button>

      <div className={PAGINATION_PAGES_CLASS}>
        {Array.from({ length: pageCount }).map((_, index) => {
          const page = index + offset
          const isActive = currentPage === page
          const humanPage = String(page + 1)
          return (
            <button
              type="button"
              aria-label={
                isActive
                  ? `page ${humanPage} selected`
                  : `go to page ${humanPage}`
              }
              aria-current={isActive ? 'page' : undefined}
              className={paginationPageVariants({ active: isActive })}
              key={`page-${String(page)}`}
              onClick={
                isActive
                  ? undefined
                  : () => {
                      handleChangePage(page)
                    }
              }
            >
              {page + 1}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        aria-label="go to next page"
        className={PAGINATION_NAV_CLASS}
        onClick={gotoNext}
        disabled={!canNextPage}
      >
        <Icon name="ChevronRight" size={CHEVRON_SIZE} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="go to last page"
        className={PAGINATION_NAV_CLASS}
        onClick={gotoLast}
        disabled={!canNextPage}
      >
        <span className={PAGINATION_DOUBLE_CHEVRON_CLASS} aria-hidden="true">
          <Icon name="ChevronRight" size={CHEVRON_SIZE} />
          <Icon name="ChevronRight" size={CHEVRON_SIZE} />
        </span>
      </button>
    </div>
  )
}

export default Pagination
