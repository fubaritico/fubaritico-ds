import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import HeroImage from './HeroImage'

import '@testing-library/jest-dom'

describe('HeroImage', () => {
  beforeEach(() => {
    // Prevent automatic image loading in jsdom
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {
      get() {
        return false
      },
      configurable: true,
    })
  })

  it('should render image with correct alt text', () => {
    render(<HeroImage backdropPath="/path/to/image.jpg" title="Test Movie" />)

    expect(screen.getByAltText('Test Movie')).toBeInTheDocument()
  })

  it('should render with unknown alt text when title is not provided', () => {
    render(<HeroImage backdropPath="/path/to/image.jpg" title={null} />)

    expect(screen.getByAltText('Unknown')).toBeInTheDocument()
  })

  it('should render with correct media queries for responsive sizes', () => {
    const { container } = render(
      <HeroImage backdropPath="/path/to/image.jpg" title="Test Movie" />
    )

    const sources = container.querySelectorAll('source')
    expect(sources).toHaveLength(4)
    expect(sources[0]).toHaveAttribute('media', '(max-width: 639px)')
    expect(sources[1]).toHaveAttribute('media', '(max-width: 1023px)')
    expect(sources[2]).toHaveAttribute('media', '(max-width: 1535px)')
    expect(sources[3]).toHaveAttribute('media', '(min-width: 1536px)')
  })

  it('should show skeleton in loading state', () => {
    render(<HeroImage backdropPath="/path/to/image.jpg" title="Test Movie" />)

    const skeleton = screen.getByTestId('hero-image-skeleton')
    expect(skeleton).toBeInTheDocument()
  })

  it('should hide skeleton after image loads', async () => {
    render(<HeroImage backdropPath="/path/to/image.jpg" title="Test Movie" />)

    const skeleton = screen.getByTestId('hero-image-skeleton')
    expect(skeleton).toBeInTheDocument()

    const image = screen.getByAltText('Test Movie')
    fireEvent.load(image)

    await waitFor(() => {
      expect(
        screen.queryByTestId('hero-image-skeleton')
      ).not.toBeInTheDocument()
    })
  })
})
