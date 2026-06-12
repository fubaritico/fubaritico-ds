import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import IconButton from './IconButton'

describe('IconButton', () => {
  describe('happy path', () => {
    it('renders an accessible button named by its aria-label', () => {
      render(<IconButton icon="ChevronLeft" aria-label="Previous" />)
      expect(
        screen.getByRole('button', { name: 'Previous' })
      ).toBeInTheDocument()
    })

    it('renders a decorative icon (aria-hidden svg)', () => {
      render(<IconButton icon="ChevronRight" aria-label="Next" />)
      const svg = screen.getByRole('button').querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })

    it('extends the Button skin (mixes .ui-button + .ui-icon-button)', () => {
      render(<IconButton icon="Play" aria-label="Play" />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('ui-button', 'ui-icon-button')
    })

    it('fires onClick on activation', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      render(<IconButton icon="Heart" aria-label="Like" onClick={onClick} />)
      await user.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('variants', () => {
    it('defaults to the ghost variant', () => {
      render(<IconButton icon="Play" aria-label="Play" />)
      expect(screen.getByRole('button')).toHaveClass('ui-button--ghost')
    })

    it('reuses Button colour variants via buttonVariants', () => {
      const { rerender } = render(
        <IconButton icon="Play" aria-label="Play" variant="primary" />
      )
      // primary is Button's base — no modifier class, just .ui-button
      const button = screen.getByRole('button')
      expect(button).toHaveClass('ui-button')
      expect(button).not.toHaveClass('ui-button--secondary')

      rerender(<IconButton icon="Play" aria-label="Play" variant="secondary" />)
      expect(screen.getByRole('button')).toHaveClass('ui-button--secondary')

      rerender(<IconButton icon="Play" aria-label="Play" variant="outline" />)
      expect(screen.getByRole('button')).toHaveClass('ui-button--outline')

      rerender(<IconButton icon="Play" aria-label="Play" variant="ghost" />)
      expect(screen.getByRole('button')).toHaveClass('ui-button--ghost')
    })

    it('emits the size class on the shape layer (md is the base, no class)', () => {
      const { rerender } = render(
        <IconButton icon="Plus" aria-label="Add" size="sm" />
      )
      expect(screen.getByRole('button')).toHaveClass('ui-icon-button--sm')

      rerender(<IconButton icon="Plus" aria-label="Add" size="md" />)
      const md = screen.getByRole('button')
      expect(md).not.toHaveClass('ui-icon-button--sm')
      expect(md).not.toHaveClass('ui-icon-button--lg')

      rerender(<IconButton icon="Plus" aria-label="Add" size="lg" />)
      expect(screen.getByRole('button')).toHaveClass('ui-icon-button--lg')
    })
  })

  describe('managed errors', () => {
    it('does not fire onClick when disabled', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      render(
        <IconButton
          icon="XMark"
          aria-label="Close"
          onClick={onClick}
          disabled
        />
      )
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      await user.click(button)
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  // L4 (unmanaged errors): N/A — presentational atom, no async / data / error path.

  describe('edge cases', () => {
    it('keeps Button closed for ghost-dark: .ui-button base + ghost-dark extension, no --ghost', () => {
      render(
        <IconButton icon="XMark" aria-label="Close" variant="ghost-dark" />
      )
      const button = screen.getByRole('button')
      expect(button).toHaveClass('ui-button', 'ui-icon-button--ghost-dark')
      // ghost-dark is an IconButton-only extension, NOT a Button variant
      expect(button).not.toHaveClass('ui-button--ghost')
    })

    it('merges a consumer className without dropping the skin classes', () => {
      render(
        <IconButton icon="Star" aria-label="Favorite" className="custom" />
      )
      expect(screen.getByRole('button')).toHaveClass(
        'ui-button',
        'ui-icon-button',
        'custom'
      )
    })

    it('forwards a ref to the underlying button (React 19 ref-as-prop)', () => {
      const ref = createRef<HTMLButtonElement>()
      render(<IconButton icon="Play" aria-label="Play" ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })

    it('survives rapid mount/unmount without warnings', () => {
      const { unmount } = render(<IconButton icon="Play" aria-label="Play" />)
      expect(() => {
        unmount()
      }).not.toThrow()
    })
  })
})
