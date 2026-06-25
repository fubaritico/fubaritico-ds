import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Pagination } from './Pagination'

import type { PaginationProps } from './Pagination'

/** Builds props with sensible defaults + spies; override per test. */
function makeProps(overrides: Partial<PaginationProps> = {}): PaginationProps {
  return {
    canNextPage: true,
    canPreviousPage: true,
    countPages: 10,
    currentPage: 0,
    gotoFirst: vi.fn(),
    gotoLast: vi.fn(),
    gotoNext: vi.fn(),
    gotoPrevious: vi.fn(),
    handleChangePage: vi.fn(),
    ...overrides,
  }
}

afterEach(cleanup)

describe('Pagination', () => {
  describe('happy path', () => {
    it('renders the first window of page buttons', () => {
      render(<Pagination {...makeProps()} />)
      expect(
        screen.getByRole('button', { name: 'page 1 selected' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'go to page 5' })
      ).toBeInTheDocument()
    })

    it('marks the current page with aria-current', () => {
      render(<Pagination {...makeProps({ currentPage: 2 })} />)
      expect(
        screen.getByRole('button', { name: 'page 3 selected' })
      ).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('variants', () => {
    it('caps the window at five page buttons for large counts', () => {
      render(<Pagination {...makeProps({ countPages: 100 })} />)
      // 5 page buttons + 4 arrows = 9 buttons total
      expect(screen.getAllByRole('button')).toHaveLength(9)
    })

    it('renders fewer buttons than the window when countPages is small', () => {
      render(<Pagination {...makeProps({ countPages: 3 })} />)
      expect(screen.queryByRole('button', { name: /go to page 4/ })).toBeNull()
      expect(
        screen.getByRole('button', { name: 'go to page 3' })
      ).toBeInTheDocument()
    })

    it('slides the window to keep the current page visible', () => {
      render(<Pagination {...makeProps({ currentPage: 7, countPages: 10 })} />)
      // offset → pages 6..10; current (index 7) shows as "page 8 selected"
      expect(
        screen.getByRole('button', { name: 'page 8 selected' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'go to page 6' })
      ).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'go to page 5' })).toBeNull()
    })
  })

  describe('managed errors', () => {
    it('disables the previous/first arrows when there is no previous page', () => {
      render(<Pagination {...makeProps({ canPreviousPage: false })} />)
      expect(
        screen.getByRole('button', { name: 'go to first page' })
      ).toBeDisabled()
      expect(
        screen.getByRole('button', { name: 'go to previous page' })
      ).toBeDisabled()
    })

    it('disables the next/last arrows when there is no next page', () => {
      render(<Pagination {...makeProps({ canNextPage: false })} />)
      expect(
        screen.getByRole('button', { name: 'go to next page' })
      ).toBeDisabled()
      expect(
        screen.getByRole('button', { name: 'go to last page' })
      ).toBeDisabled()
    })

    it('keeps the active page focusable (not disabled) but inert, with aria-current', async () => {
      const user = userEvent.setup()
      const handleChangePage = vi.fn()
      render(
        <Pagination {...makeProps({ currentPage: 0, handleChangePage })} />
      )
      const active = screen.getByRole('button', { name: 'page 1 selected' })
      // a11y: the current page stays in the tab order (not disabled) and is marked aria-current
      expect(active).not.toBeDisabled()
      expect(active).toHaveAttribute('aria-current', 'page')
      await user.click(active)
      expect(handleChangePage).not.toHaveBeenCalled()
    })
  })

  describe('unmanaged errors', () => {
    it('renders without crashing for a single page', () => {
      render(
        <Pagination {...makeProps({ countPages: 1, canNextPage: false })} />
      )
      expect(
        screen.getByRole('button', { name: 'page 1 selected' })
      ).toBeInTheDocument()
    })

    it('renders only the arrows when there are zero pages', () => {
      render(
        <Pagination
          {...makeProps({
            countPages: 0,
            canNextPage: false,
            canPreviousPage: false,
          })}
        />
      )
      // no page-number buttons, just the 4 arrows
      expect(screen.getAllByRole('button')).toHaveLength(4)
    })
  })

  describe('edge cases', () => {
    it('calls handleChangePage with the target index when a page is clicked', async () => {
      const user = userEvent.setup()
      const handleChangePage = vi.fn()
      render(
        <Pagination {...makeProps({ currentPage: 0, handleChangePage })} />
      )
      await user.click(screen.getByRole('button', { name: 'go to page 3' }))
      expect(handleChangePage).toHaveBeenCalledWith(2)
    })

    it('fires the arrow callbacks', async () => {
      const user = userEvent.setup()
      const props = makeProps({ currentPage: 3 })
      render(<Pagination {...props} />)
      await user.click(screen.getByRole('button', { name: 'go to first page' }))
      await user.click(
        screen.getByRole('button', { name: 'go to previous page' })
      )
      await user.click(screen.getByRole('button', { name: 'go to next page' }))
      await user.click(screen.getByRole('button', { name: 'go to last page' }))
      expect(props.gotoFirst).toHaveBeenCalledOnce()
      expect(props.gotoPrevious).toHaveBeenCalledOnce()
      expect(props.gotoNext).toHaveBeenCalledOnce()
      expect(props.gotoLast).toHaveBeenCalledOnce()
    })
  })
})
