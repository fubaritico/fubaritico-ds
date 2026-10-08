import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SortableHeaderCellView } from './SortableHeaderCellView'

import type { Column } from '@tanstack/react-table'
import type { ReactNode } from 'react'

type Sorted = 'asc' | 'desc' | false

const makeColumn = (sorted: Sorted, toggleSorting = vi.fn()) =>
  ({
    getIsSorted: () => sorted,
    toggleSorting,
  }) as unknown as Column<unknown>

// A bare <th> outside a table trips React's DOM-nesting validation — keep the real table shape.
const inTable = (node: ReactNode) =>
  render(
    <table>
      <thead>
        <tr>{node}</tr>
      </thead>
    </table>
  )

describe('SortableHeaderCellView', () => {
  describe('happy path', () => {
    it('renders the label and the sort toggle', () => {
      inTable(
        <SortableHeaderCellView
          headerLabel="Status"
          colName="Status"
          column={makeColumn(false)}
        />
      )

      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Sort Status' })
      ).toBeInTheDocument()
    })

    it('exposes aria-sort="none" when the column is unsorted', () => {
      inTable(
        <SortableHeaderCellView
          headerLabel="Status"
          colName="Status"
          column={makeColumn(false)}
        />
      )

      expect(screen.getByRole('columnheader')).toHaveAttribute(
        'aria-sort',
        'none'
      )
    })
  })

  describe('variants', () => {
    it.each([
      ['asc', 'ascending', 'Sort Status (ascending)'],
      ['desc', 'descending', 'Sort Status (descending)'],
    ] as const)(
      'maps sort direction %s to aria-sort="%s" and the matching toggle label',
      (sorted, ariaSort, buttonName) => {
        inTable(
          <SortableHeaderCellView
            headerLabel="Status"
            colName="Status"
            column={makeColumn(sorted)}
          />
        )

        expect(screen.getByRole('columnheader')).toHaveAttribute(
          'aria-sort',
          ariaSort
        )
        expect(
          screen.getByRole('button', { name: buttonName })
        ).toBeInTheDocument()
      }
    )

    it('renders the trailing separator only when asked', () => {
      const { container, unmount } = inTable(
        <SortableHeaderCellView
          headerLabel="Status"
          colName="Status"
          column={makeColumn(false)}
          withSeparator
        />
      )
      expect(
        container.querySelector('.ui-data-table__separator')
      ).toBeInTheDocument()
      unmount()

      const { container: bare } = inTable(
        <SortableHeaderCellView
          headerLabel="Status"
          colName="Status"
          column={makeColumn(false)}
        />
      )
      expect(
        bare.querySelector('.ui-data-table__separator')
      ).not.toBeInTheDocument()
    })

    it('forwards the data-type attribute used by the column sizing CSS', () => {
      inTable(
        <SortableHeaderCellView
          headerLabel="Amount"
          colName="Amount"
          dataType="number"
          column={makeColumn(false)}
        />
      )

      expect(screen.getByRole('columnheader')).toHaveAttribute(
        'data-type',
        'number'
      )
    })
  })

  describe('managed errors', () => {
    it('toggles sorting away from ascending when already ascending', async () => {
      const toggleSorting = vi.fn()
      const user = userEvent.setup()
      inTable(
        <SortableHeaderCellView
          headerLabel="Status"
          colName="Status"
          column={makeColumn('asc', toggleSorting)}
        />
      )

      await user.click(
        screen.getByRole('button', { name: 'Sort Status (ascending)' })
      )

      expect(toggleSorting).toHaveBeenCalledWith(true)
    })

    it('toggles sorting to ascending from any other state', async () => {
      const toggleSorting = vi.fn()
      const user = userEvent.setup()
      inTable(
        <SortableHeaderCellView
          headerLabel="Status"
          colName="Status"
          column={makeColumn(false, toggleSorting)}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Sort Status' }))

      expect(toggleSorting).toHaveBeenCalledWith(false)
    })
  })

  // L4: N/A — the view takes an already-built column instance; there is no async path to fail.

  describe('edge cases', () => {
    it('renders an empty label without crashing and keeps the toggle reachable', () => {
      inTable(
        <SortableHeaderCellView
          headerLabel=""
          colName="Status"
          column={makeColumn(false)}
        />
      )

      expect(
        screen.getByRole('button', { name: 'Sort Status' })
      ).toBeInTheDocument()
    })

    it('leaves title undefined when the label is not truncated (jsdom reports zero widths)', () => {
      inTable(
        <SortableHeaderCellView
          headerLabel="A very long header label that would overflow a narrow column"
          colName="Status"
          column={makeColumn(false)}
        />
      )

      expect(
        screen.getByText(
          'A very long header label that would overflow a narrow column'
        )
      ).not.toHaveAttribute('title')
    })
  })
})
