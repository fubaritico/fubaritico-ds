import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import MovieCard from './MovieCard'

import '@testing-library/jest-dom'

vi.mock('next/link', () => ({
  default: ({
    children,
    ...props
  }: React.PropsWithChildren<{ href: string; className?: string }>) => (
    <a data-next-link {...props}>
      {children}
    </a>
  ),
}))

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
  imageLoading: 'eager' as const,
}

describe('MovieCard (next) — as="zone-link"', () => {
  it('renders a plain <a> tag with href', () => {
    render(<MovieCard as="zone-link" href="/movie/123" {...defaultProps} />)
    const link = screen.getByRole('link')
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/movie/123')
    expect(link).not.toHaveAttribute('data-next-link')
  })

  it('applies the same link classes as as="link"', () => {
    const { rerender } = render(
      <MovieCard as="link" href="/movie/1" {...defaultProps} />
    )
    const linkClasses = screen.getByRole('link').className

    rerender(<MovieCard as="zone-link" href="/movie/1" {...defaultProps} />)
    const zoneLinkClasses = screen.getByRole('link').className

    expect(zoneLinkClasses).toBe(linkClasses)
  })

  it('renders card content inside the anchor', () => {
    render(<MovieCard as="zone-link" href="/movie/123" {...defaultProps} />)
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
    expect(screen.getByText('7.5')).toBeInTheDocument()
  })
})

describe('MovieCard (next) — as="link" regression', () => {
  it('renders a next/link with data-next-link attribute', () => {
    render(<MovieCard as="link" href="/movie/123" {...defaultProps} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('data-next-link')
    expect(link).toHaveAttribute('href', '/movie/123')
  })
})

describe('MovieCard (next) — as="card" regression', () => {
  it('renders without a link wrapper', () => {
    render(<MovieCard {...defaultProps} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
  })
})
