import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import IconButton from './IconButton'

describe('IconButton', () => {
  it('renders with required props', () => {
    render(<IconButton icon="ChevronLeft" aria-label="Previous" />)
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument()
  })

  it('renders the correct icon', () => {
    render(<IconButton icon="ChevronRight" aria-label="Next" />)
    const button = screen.getByRole('button')
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('applies variant classes correctly', () => {
    const { rerender } = render(
      <IconButton icon="Play" aria-label="Play" variant="primary" />
    )
    expect(screen.getByRole('button')).toHaveClass('ui:bg-primary')

    rerender(<IconButton icon="Play" aria-label="Play" variant="secondary" />)
    expect(screen.getByRole('button')).toHaveClass('ui:bg-secondary')

    rerender(<IconButton icon="Play" aria-label="Play" variant="outline" />)
    expect(screen.getByRole('button')).toHaveClass('ui:border')

    rerender(<IconButton icon="Play" aria-label="Play" variant="ghost" />)
    expect(screen.getByRole('button')).toHaveClass('ui:hover:bg-accent')
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(
      <IconButton icon="Plus" aria-label="Add" size="sm" />
    )
    expect(screen.getByRole('button')).toHaveClass('ui:h-8', 'ui:w-8')

    rerender(<IconButton icon="Plus" aria-label="Add" size="md" />)
    expect(screen.getByRole('button')).toHaveClass('ui:h-10', 'ui:w-10')

    rerender(<IconButton icon="Plus" aria-label="Add" size="lg" />)
    expect(screen.getByRole('button')).toHaveClass('ui:h-12', 'ui:w-12')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<IconButton icon="Heart" aria-label="Like" onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<IconButton icon="XMark" aria-label="Close" disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies custom className', () => {
    render(
      <IconButton icon="Star" aria-label="Favorite" className="custom-class" />
    )
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('has rounded-full class for circular shape', () => {
    render(<IconButton icon="Play" aria-label="Play" />)
    expect(screen.getByRole('button')).toHaveClass('ui:rounded-full')
  })
})
