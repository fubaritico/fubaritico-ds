import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ListboxItem from './ListboxItem'

describe('ListboxItem', () => {
  describe('happy path', () => {
    it('renders a <li role="option"> with the base skin class and its children', () => {
      render(<ListboxItem>Option A</ListboxItem>)
      const option = screen.getByRole('option')
      expect(option.tagName).toBe('LI')
      expect(option).toHaveClass('ui-listbox__item')
      expect(option).toHaveTextContent('Option A')
    })
  })

  describe('variants', () => {
    it('emits the active modifier when isActive', () => {
      render(<ListboxItem isActive>A</ListboxItem>)
      expect(screen.getByRole('option')).toHaveClass('ui-listbox__item--active')
    })

    it('emits the selected modifier when isSelected', () => {
      render(<ListboxItem isSelected>A</ListboxItem>)
      expect(screen.getByRole('option')).toHaveClass(
        'ui-listbox__item--selected'
      )
    })

    it('mirrors isSelected onto aria-selected (required on role="option")', () => {
      const { rerender } = render(<ListboxItem isSelected>A</ListboxItem>)
      expect(screen.getByRole('option')).toHaveAttribute(
        'aria-selected',
        'true'
      )

      rerender(<ListboxItem>A</ListboxItem>)
      expect(screen.getByRole('option')).toHaveAttribute(
        'aria-selected',
        'false'
      )
    })

    it('lets a consumer override aria-selected via props (Typeahead pattern)', () => {
      render(
        <ListboxItem isSelected aria-selected={false}>
          A
        </ListboxItem>
      )
      expect(screen.getByRole('option')).toHaveAttribute(
        'aria-selected',
        'false'
      )
    })

    it('gives isActive priority over isSelected', () => {
      render(
        <ListboxItem isActive isSelected>
          A
        </ListboxItem>
      )
      const option = screen.getByRole('option')
      expect(option).toHaveClass('ui-listbox__item--active')
      expect(option).not.toHaveClass('ui-listbox__item--selected')
    })

    it('emits the dark modifier for the dark variant', () => {
      render(<ListboxItem variant="dark">A</ListboxItem>)
      expect(screen.getByRole('option')).toHaveClass('ui-listbox__item--dark')
    })
  })

  describe('managed errors', () => {
    it('marks a disabled item and exposes aria-disabled', () => {
      render(<ListboxItem disabled>A</ListboxItem>)
      const option = screen.getByRole('option')
      expect(option).toHaveClass('ui-listbox__item--disabled')
      expect(option).toHaveAttribute('aria-disabled', 'true')
    })

    it('omits aria-disabled when interactive', () => {
      render(<ListboxItem>A</ListboxItem>)
      expect(screen.getByRole('option')).not.toHaveAttribute('aria-disabled')
    })
  })

  // L4 (unmanaged errors): N/A — presentational atom, no async/data path.

  describe('edge cases', () => {
    it('suppresses active/selected styling while disabled (only the dimming shows)', () => {
      render(
        <ListboxItem disabled isActive isSelected>
          A
        </ListboxItem>
      )
      const option = screen.getByRole('option')
      expect(option).toHaveClass('ui-listbox__item--disabled')
      expect(option).not.toHaveClass('ui-listbox__item--active')
      expect(option).not.toHaveClass('ui-listbox__item--selected')
    })

    it('merges a consumer className after the skin classes', () => {
      render(<ListboxItem className="custom">A</ListboxItem>)
      const option = screen.getByRole('option')
      expect(option).toHaveClass('ui-listbox__item')
      expect(option).toHaveClass('custom')
    })
  })
})
