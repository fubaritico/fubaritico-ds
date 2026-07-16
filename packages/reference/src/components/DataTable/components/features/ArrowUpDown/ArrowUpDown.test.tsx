import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ArrowUpDown } from './ArrowUpDown'

afterEach(cleanup)

/** Counts the dimmed chevrons within the rendered control. */
const dimmedCount = (container: HTMLElement) =>
  container.querySelectorAll('.ui-sort-arrows__icon--dimmed').length

describe('ArrowUpDown', () => {
  describe('happy path', () => {
    it('renders a labelled sort button with two chevrons', () => {
      const { container } = render(
        <ArrowUpDown colName="Status" sorting={false} onClick={vi.fn()} />
      )
      expect(
        screen.getByRole('button', { name: 'Sort Status' })
      ).toBeInTheDocument()
      expect(container.querySelectorAll('.ui-sort-arrows__icon')).toHaveLength(
        2
      )
    })

    it('fires onClick when pressed', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      render(<ArrowUpDown colName="Status" sorting={false} onClick={onClick} />)
      await user.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('variants', () => {
    it('dims one chevron when sorted ascending and announces the direction', () => {
      const { container } = render(
        <ArrowUpDown colName="Status" sorting="asc" onClick={vi.fn()} />
      )
      expect(dimmedCount(container)).toBe(1)
      expect(
        screen.getByRole('button', { name: 'Sort Status (ascending)' })
      ).toBeInTheDocument()
    })

    it('dims one chevron when sorted descending and announces the direction', () => {
      const { container } = render(
        <ArrowUpDown colName="Status" sorting="desc" onClick={vi.fn()} />
      )
      expect(dimmedCount(container)).toBe(1)
      expect(
        screen.getByRole('button', { name: 'Sort Status (descending)' })
      ).toBeInTheDocument()
    })

    it('dims neither chevron when unsorted', () => {
      const { container } = render(
        <ArrowUpDown colName="Status" sorting={false} onClick={vi.fn()} />
      )
      expect(dimmedCount(container)).toBe(0)
    })
  })

  // L3: managed errors — N/A (presentational control, no error path)
  // L4: unmanaged errors — N/A (no async / external data)

  describe('edge cases', () => {
    it('falls back to a generic label when no colName is given', () => {
      render(<ArrowUpDown sorting={false} onClick={vi.fn()} />)
      expect(screen.getByRole('button', { name: 'Sort' })).toBeInTheDocument()
    })
  })
})
