import { render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Card } from '../../../../Card'
import { Modal } from '../../../../Modal'

import { DropdownFilter } from './DropdownFilter'

import type { ColumnFiltersState } from '@tanstack/react-table'

// Real Chromium: the top layer, a real `<dialog>` and its inertness — none of it exists under jsdom.

const ITEMS = [
  { value: 'All statuses', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Archived', label: 'Archived' },
]

/**
 * A Modal holding a clipping Card with a status filter, and the filters state printed below it.
 *
 * @returns The fixture.
 */
function InModal() {
  const [open, setOpen] = useState(true)
  const [filters, setFilters] = useState<ColumnFiltersState>([])
  return (
    <Modal
      isOpen={open}
      onClose={() => {
        setOpen(false)
      }}
      aria-label="Filters"
    >
      <Card style={{ inlineSize: '240px' }}>
        <Card.Body>
          <DropdownFilter
            buttonLabel="All statuses"
            items={ITEMS}
            filters={filters}
            filterId="status"
            onFiltersChange={setFilters}
          />
          <output>{JSON.stringify(filters)}</output>
        </Card.Body>
      </Card>
    </Modal>
  )
}

const trigger = () => screen.getByRole('button', { name: 'All statuses' })

/**
 * Whether a pointer at the centre of the element would reach it.
 *
 * @param element - The element to hit-test.
 * @returns `true` when the element (or a descendant) is the hit target.
 */
function reachable(element: HTMLElement) {
  const box = element.getBoundingClientRect()
  const hit = document.elementFromPoint(
    box.left + box.width / 2,
    box.top + box.height / 2
  )
  return hit !== null && element.contains(hit)
}

describe('DropdownFilter (browser)', () => {
  describe('happy path', () => {
    it('inside a Modal: the menu opens in place, every option is reachable and sets the filter', async () => {
      render(<InModal />)
      await userEvent.click(trigger())

      const menu = document.querySelector<HTMLElement>('.ui-dropdown__menu')
      expect(menu?.matches(':popover-open')).toBe(true)
      expect(menu?.closest('dialog')).not.toBeNull()

      const archived = screen.getByRole('option', { name: 'Archived' })
      expect(reachable(archived)).toBe(true)
      await userEvent.click(archived)
      expect(screen.getByRole('status')).toHaveTextContent(
        '[{"id":"status","value":"Archived"}]'
      )
    })
  })

  describe('managed errors', () => {
    it('inside a Modal: Escape closes the menu only', async () => {
      render(<InModal />)
      await userEvent.click(trigger())
      await userEvent.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(document.querySelector('dialog')?.open).toBe(true)
    })
  })

  // L2: N/A here — the filter-combining branches are pure data, exercised through the menu above.
  // L4: N/A — no async source; options are plain data.

  describe('edge cases', () => {
    it('re-selecting the default label clears the filter', async () => {
      render(<InModal />)
      await userEvent.click(trigger())
      await userEvent.click(screen.getByRole('option', { name: 'Active' }))
      await userEvent.click(
        screen.getByRole('button', { name: 'All statuses' })
      )
      await userEvent.click(
        screen.getByRole('option', { name: 'All statuses' })
      )
      expect(screen.getByRole('status')).toHaveTextContent('[]')
    })
  })
})
