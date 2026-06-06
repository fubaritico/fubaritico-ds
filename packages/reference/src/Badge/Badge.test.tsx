import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Badge from './Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Action</Badge>)
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('renders with default variant', () => {
    const { container } = render(<Badge>Default</Badge>)
    expect(container.firstChild).toHaveClass('ui:bg-primary')
  })

  it('renders with secondary variant', () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>)
    expect(container.firstChild).toHaveClass('ui:bg-secondary')
  })

  it('renders with outline variant', () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>)
    expect(container.firstChild).toHaveClass('ui:border')
    expect(container.firstChild).toHaveClass('ui:bg-transparent')
  })

  it('renders with destructive variant', () => {
    const { container } = render(<Badge variant="destructive">Error</Badge>)
    expect(container.firstChild).toHaveClass('ui:bg-destructive')
  })

  it('renders with icon', () => {
    const { container } = render(<Badge icon="Star">Featured</Badge>)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('applies size sm correctly', () => {
    const { container } = render(<Badge size="sm">Small</Badge>)
    expect(container.firstChild).toHaveClass('ui:text-xs')
  })

  it('applies size md correctly', () => {
    const { container } = render(<Badge size="md">Medium</Badge>)
    expect(container.firstChild).toHaveClass('ui:text-sm')
  })

  it('applies size lg correctly', () => {
    const { container } = render(<Badge size="lg">Large</Badge>)
    expect(container.firstChild).toHaveClass('ui:py-1')
  })

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-class">Custom</Badge>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
