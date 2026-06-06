import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import HeroImage from './HeroImage'

import '@testing-library/jest-dom'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}))

describe('HeroImage (next)', () => {
  it('should render image with correct alt text', () => {
    render(<HeroImage backdropPath="/path/to/image.jpg" title="Test Movie" />)
    expect(screen.getByAltText('Test Movie')).toBeInTheDocument()
  })

  it('should render with unknown alt text when title is not provided', () => {
    render(<HeroImage backdropPath="/path/to/image.jpg" title={null} />)
    expect(screen.getByAltText('Unknown')).toBeInTheDocument()
  })

  it('should show skeleton when no backdrop path', () => {
    render(<HeroImage backdropPath={null} title="Test Movie" />)
    expect(screen.getByTestId('hero-image-skeleton')).toBeInTheDocument()
  })

  it('should render gradient overlay', () => {
    const { container } = render(
      <HeroImage backdropPath="/path/to/image.jpg" title="Test Movie" />
    )
    const overlay = container.querySelector('.ui\\:bg-gradient-to-t')
    expect(overlay).toBeInTheDocument()
  })

  it('should construct TMDB w1280 URL', () => {
    render(<HeroImage backdropPath="/abc123.jpg" title="Test" />)
    expect(screen.getByAltText('Test')).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w1280/abc123.jpg'
    )
  })

  it('should pass blurDataURL to NextImage', () => {
    render(
      <HeroImage
        backdropPath="/abc123.jpg"
        title="Test"
        blurDataURL="data:image/jpeg;base64,abc"
      />
    )
    expect(screen.getByAltText('Test')).toBeInTheDocument()
  })
})
