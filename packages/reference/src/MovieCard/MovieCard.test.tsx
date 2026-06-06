import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MovieCard } from '../react-router/MovieCard'

describe('MovieCard', () => {
  const defaultProps = {
    id: 123,
    title: 'Test Media',
    posterUrl: 'https://image.tmdb.org/t/p/w342/test-poster.jpg',
    voteAverage: 7.5,
    year: 2024,
    imageLoading: 'eager' as const,
  }

  it('renders movie title', () => {
    render(<MovieCard {...defaultProps} />)
    expect(screen.getByText('Test Media')).toBeInTheDocument()
  })

  it('renders release year', () => {
    render(<MovieCard {...defaultProps} />)
    expect(screen.getByText('2024')).toBeInTheDocument()
  })

  it('renders without year when year is not provided', () => {
    render(<MovieCard {...defaultProps} year={undefined} />)
    expect(screen.queryByText('2024')).not.toBeInTheDocument()
  })

  it('renders rating component', () => {
    render(<MovieCard {...defaultProps} />)
    expect(screen.getByText('7.5')).toBeInTheDocument()
  })

  it('renders poster image', () => {
    render(<MovieCard {...defaultProps} />)
    const img = screen.getByRole('img', { name: 'Test Media' })
    expect(img).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<MovieCard {...defaultProps} as="button" onClick={handleClick} />)

    const card = screen.getByTestId('movie-card-123')
    fireEvent.click(card)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    render(<MovieCard {...defaultProps} className="custom-class" />)
    const card = screen.getByTestId('movie-card-123')
    expect(card).toHaveClass('custom-class')
  })

  it('has correct data-testid', () => {
    render(<MovieCard {...defaultProps} />)
    expect(screen.getByTestId('movie-card-123')).toBeInTheDocument()
  })
})
