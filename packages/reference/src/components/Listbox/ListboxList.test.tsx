import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ListboxList from './ListboxList'

describe('ListboxList', () => {
  describe('happy path', () => {
    it('renders a <ul> with the base skin class and its children', () => {
      render(
        <ListboxList>
          <li>Item</li>
        </ListboxList>
      )
      const list = screen.getByRole('list')
      expect(list.tagName).toBe('UL')
      expect(list).toHaveClass('ui-listbox')
      expect(screen.getByText('Item')).toBeInTheDocument()
    })
  })

  describe('variants', () => {
    it('emits no modifier for the default light variant', () => {
      render(<ListboxList />)
      const list = screen.getByRole('list')
      expect(list).toHaveClass('ui-listbox')
      expect(list).not.toHaveClass('ui-listbox--dark')
    })

    it('emits the dark modifier for the dark variant', () => {
      render(<ListboxList variant="dark" />)
      expect(screen.getByRole('list')).toHaveClass('ui-listbox--dark')
    })
  })

  // L3 (managed errors): N/A — presentational atom, no validation/error path.
  // L4 (unmanaged errors): N/A — no async/data path.

  describe('edge cases', () => {
    it('merges a consumer className after the skin classes', () => {
      render(<ListboxList className="custom" />)
      const list = screen.getByRole('list')
      expect(list).toHaveClass('ui-listbox')
      expect(list).toHaveClass('custom')
    })

    it('forwards native <ul> attributes (id, aria, ref)', () => {
      render(<ListboxList id="menu-list" aria-label="Options" />)
      const list = screen.getByRole('list')
      expect(list).toHaveAttribute('id', 'menu-list')
      expect(list).toHaveAccessibleName('Options')
    })
  })
})
