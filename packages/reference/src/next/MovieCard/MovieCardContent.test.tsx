import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import MovieCardContent from './MovieCardContent'

import '@testing-library/jest-dom'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}))

vi.mock('../../Icon', () => ({
  Icon: ({ name, ...props }: { name: string }) => (
    <span data-testid="icon" data-name={name} {...props} />
  ),
}))

const defaultProps = {
  id: 123,
  title: 'Test Movie',
  posterUrl: '/test-poster.jpg',
  voteAverage: 7.5,
  year: 2024,
  isInteractive: false,
}

describe('MovieCardContent (next)', () => {
  it('should render title', () => {
    render(<MovieCardContent {...defaultProps} />)
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
  })

  it('should render year', () => {
    render(<MovieCardContent {...defaultProps} />)
    expect(screen.getByText('2024')).toBeInTheDocument()
  })

  it('should render rating', () => {
    render(<MovieCardContent {...defaultProps} />)
    expect(screen.getByText('7.5')).toBeInTheDocument()
  })

  it('should construct TMDB URL with w342 size', () => {
    render(<MovieCardContent {...defaultProps} />)
    const img = screen.getByRole('img', { name: 'Test Movie' })
    expect(img).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w342/test-poster.jpg'
    )
  })

  it('should pass loading="lazy" by default', () => {
    render(<MovieCardContent {...defaultProps} />)
    const img = screen.getByRole('img', { name: 'Test Movie' })
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('should pass loading="eager" when imageLoading is eager', () => {
    render(<MovieCardContent {...defaultProps} imageLoading="eager" />)
    const img = screen.getByRole('img', { name: 'Test Movie' })
    expect(img).toHaveAttribute('loading', 'eager')
  })

  it('should have correct data-testid', () => {
    render(<MovieCardContent {...defaultProps} />)
    expect(screen.getByTestId('movie-card-123')).toBeInTheDocument()
  })

  it('should not render year when not provided', () => {
    render(<MovieCardContent {...defaultProps} year={undefined} />)
    expect(screen.queryByText('2024')).not.toBeInTheDocument()
  })

  it('should pass width and height to NextImage', () => {
    render(<MovieCardContent {...defaultProps} />)
    const img = screen.getByRole('img', { name: 'Test Movie' })
    expect(img).toHaveAttribute('width', '150')
    expect(img).toHaveAttribute('height', '225')
  })
})
