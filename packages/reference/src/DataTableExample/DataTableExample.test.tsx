import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import DataTableExample from './DataTableExample'
import { makeJobs } from './jobFactory'

/**
 * Deterministic 3-row fixture (fewer than the page size, so every row renders with no pagination).
 * `makeJobs` cycles the name pool: index 0 → "Deleted records…", 1 → "Full org backup", 2 → "Weekly…".
 */
const THREE_ROWS = makeJobs(3)

/** Accessible label of the ActionBar quick-filter input. */
const SEARCH_LABEL = 'Search'

describe('DataTableExample', () => {
  describe('happy path', () => {
    it('renders every row when no filter is applied', () => {
      render(<DataTableExample data={THREE_ROWS} locale="en_US" loading={false} />)

      expect(screen.getByText('Full org backup #1')).toBeInTheDocument()
      expect(
        screen.getByText('Deleted records daily incremental #0')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Weekly metadata snapshot #2')
      ).toBeInTheDocument()
    })
  })

  describe('variants', () => {
    // Regression: the ActionBar quick filter drives `globalFilter`, which only filters rows when the
    // table is configured with `getFilteredRowModel()` (previously missing → the input echoed the text
    // but nothing filtered).
    it('filters the rows to those matching the quick-filter query', async () => {
      const user = userEvent.setup()
      render(<DataTableExample data={THREE_ROWS} locale="en_US" loading={false} />)

      await user.type(screen.getByLabelText(SEARCH_LABEL), 'Full')

      expect(screen.getByText('Full org backup #1')).toBeInTheDocument()
      expect(
        screen.queryByText('Deleted records daily incremental #0')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('Weekly metadata snapshot #2')
      ).not.toBeInTheDocument()
    })
  })

  describe('managed errors', () => {
    it('drops every row when the query matches nothing', async () => {
      const user = userEvent.setup()
      render(<DataTableExample data={THREE_ROWS} locale="en_US" loading={false} />)

      await user.type(screen.getByLabelText(SEARCH_LABEL), 'no-such-job-xyz')

      expect(screen.queryByText('Full org backup #1')).not.toBeInTheDocument()
    })
  })

  // L4 (unmanaged errors): N/A — the container has no async/data-fetch path; filtering is synchronous.

  describe('edge cases', () => {
    it('restores every row when the query is cleared', async () => {
      const user = userEvent.setup()
      render(<DataTableExample data={THREE_ROWS} locale="en_US" loading={false} />)

      const search = screen.getByLabelText(SEARCH_LABEL)
      await user.type(search, 'Full')
      expect(
        screen.queryByText('Weekly metadata snapshot #2')
      ).not.toBeInTheDocument()

      await user.clear(search)
      expect(
        screen.getByText('Weekly metadata snapshot #2')
      ).toBeInTheDocument()
    })
  })
})
