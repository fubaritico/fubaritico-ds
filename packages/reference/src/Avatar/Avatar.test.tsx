import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Avatar from './Avatar'

describe('Avatar', () => {
  it('renders with image when src is provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="John Doe" />)
    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    expect(img).toHaveAttribute('alt', 'John Doe')
  })

  it('renders initials when no src is provided', () => {
    render(<Avatar alt="John Doe" initials="JD" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('truncates initials to 2 characters', () => {
    render(<Avatar alt="John Doe Smith" initials="JDS" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders fallback icon when no src or initials', () => {
    render(<Avatar alt="Unknown user" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.queryByText(/./)).not.toBeInTheDocument()
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('shows fallback on image error', () => {
    render(<Avatar src="https://invalid.url/broken.jpg" alt="Broken" />)
    const img = screen.getByRole('img')
    fireEvent.error(img)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows initials on image error when initials provided', () => {
    render(
      <Avatar src="https://invalid.url/broken.jpg" alt="John" initials="JD" />
    )
    const img = screen.getByRole('img')
    fireEvent.error(img)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('applies size classes correctly', () => {
    const { container, rerender } = render(<Avatar alt="Test" size="xs" />)
    expect(container.firstChild).toHaveClass('ui:h-6', 'ui:w-6')

    rerender(<Avatar alt="Test" size="sm" />)
    expect(container.firstChild).toHaveClass('ui:h-8', 'ui:w-8')

    rerender(<Avatar alt="Test" size="md" />)
    expect(container.firstChild).toHaveClass('ui:h-10', 'ui:w-10')

    rerender(<Avatar alt="Test" size="lg" />)
    expect(container.firstChild).toHaveClass('ui:h-12', 'ui:w-12')

    rerender(<Avatar alt="Test" size="xl" />)
    expect(container.firstChild).toHaveClass('ui:h-16', 'ui:w-16')

    rerender(<Avatar alt="Test" size="2xl" />)
    expect(container.firstChild).toHaveClass('ui:h-24', 'ui:w-24')

    rerender(<Avatar alt="Test" size="3xl" />)
    expect(container.firstChild).toHaveClass('ui:h-32', 'ui:w-32')
  })

  it('has rounded-full class for circular shape', () => {
    const { container } = render(<Avatar alt="Test" />)
    expect(container.firstChild).toHaveClass('ui:rounded-full')
  })

  it('applies custom className', () => {
    const { container } = render(<Avatar alt="Test" className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('handles null src gracefully', () => {
    render(<Avatar src={null} alt="No image" initials="NI" />)
    expect(screen.getByText('NI')).toBeInTheDocument()
  })
})
