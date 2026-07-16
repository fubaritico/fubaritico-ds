import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import JobRowSkeleton from './JobRowSkeleton'

/** Renders the row inside a table so the `<tr>`/`<td>` markup is valid. */
const renderRow = () =>
  render(
    <table>
      <tbody>
        <JobRowSkeleton />
      </tbody>
    </table>
  )

afterEach(cleanup)

describe('JobRowSkeleton', () => {
  describe('happy path', () => {
    it('renders the 7 cells of the original placeholder', () => {
      renderRow()
      expect(screen.getAllByRole('cell')).toHaveLength(7)
    })
  })

  describe('variants', () => {
    it('renders every skeleton bar (11 total across the 7 cells)', () => {
      const { container } = renderRow()
      expect(container.querySelectorAll('.ui-skeleton')).toHaveLength(11)
    })

    it('stacks two bars in the title/date cells', () => {
      renderRow()
      const cells = screen.getAllByRole('cell')
      // first cell = title + subtitle (2 bars)
      expect(cells[0].querySelectorAll('.ui-skeleton')).toHaveLength(2)
      // second cell = single bar
      expect(cells[1].querySelectorAll('.ui-skeleton')).toHaveLength(1)
    })
  })

  // L3: managed errors — N/A (pure presentational placeholder)
  // L4: unmanaged errors — N/A (no inputs)

  describe('edge cases', () => {
    it('renders all bars as line-shaped skeletons', () => {
      const { container } = renderRow()
      const bars = container.querySelectorAll('.ui-skeleton')
      bars.forEach((bar) => {
        expect(bar).toHaveClass('ui-skeleton--line')
      })
    })
  })
})
