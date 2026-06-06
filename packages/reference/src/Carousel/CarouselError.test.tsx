import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import CarouselError from './CarouselError'

describe('CarouselError', () => {
  it('renders static heading "Failed to fetch data"', () => {
    render(<CarouselError />)
    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument()
  })

  it('renders default message when no prop provided', () => {
    render(<CarouselError />)
    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
  })

  it('renders custom message when provided', () => {
    render(<CarouselError message="Custom error message" />)
    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Failed to load data')).not.toBeInTheDocument()
  })

  it('renders ExclamationTriangle icon', () => {
    const { container } = render(<CarouselError />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
