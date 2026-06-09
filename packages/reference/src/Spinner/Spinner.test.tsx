import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Spinner from './Spinner'

describe('Spinner', () => {
  describe('happy path', () => {
    it('renders a status role with the default accessible name', () => {
      render(<Spinner />)
      expect(
        screen.getByRole('status', { name: 'Loading' })
      ).toBeInTheDocument()
    })

    it('applies the base BEM block and emits no modifier for the default size', () => {
      const { container } = render(<Spinner />)
      const spinner = container.firstChild
      expect(spinner).toHaveClass('ui-spinner')
      // default size (md) => base class only, no modifier
      expect(spinner).not.toHaveClass('ui-spinner--sm')
      expect(spinner).not.toHaveClass('ui-spinner--lg')
    })
  })

  describe('variants', () => {
    it('applies each size modifier', () => {
      const { container: sm } = render(<Spinner size="sm" />)
      expect(sm.firstChild).toHaveClass('ui-spinner--sm')

      // md is the default size => base class only, no `ui-spinner--md` modifier emitted
      const { container: md } = render(<Spinner size="md" />)
      expect(md.firstChild).toHaveClass('ui-spinner')
      expect(md.firstChild).not.toHaveClass('ui-spinner--sm')
      expect(md.firstChild).not.toHaveClass('ui-spinner--lg')

      const { container: lg } = render(<Spinner size="lg" />)
      expect(lg.firstChild).toHaveClass('ui-spinner--lg')
    })
  })

  // L3: N/A — a presentational loading indicator has no managed error/disabled state.
  // L4: N/A — no async operations, no external data to malform.

  describe('edge cases', () => {
    it('overrides the accessible name via aria-label', () => {
      render(<Spinner aria-label="Chargement" />)
      expect(
        screen.getByRole('status', { name: 'Chargement' })
      ).toBeInTheDocument()
      expect(screen.queryByRole('status', { name: 'Loading' })).toBeNull()
    })

    it('merges a consumer className with the resolved skin classes', () => {
      const { container } = render(<Spinner className="my-class" />)
      const spinner = container.firstChild
      expect(spinner).toHaveClass('ui-spinner')
      expect(spinner).toHaveClass('my-class')
    })

    it('forwards extra native attributes (id, data-*)', () => {
      render(<Spinner id="loader" data-testid="spin" />)
      const spinner = screen.getByTestId('spin')
      expect(spinner).toHaveAttribute('id', 'loader')
    })
  })
})
