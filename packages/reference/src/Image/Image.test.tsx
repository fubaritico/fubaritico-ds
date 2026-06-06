import { fireEvent, render, screen } from '@testing-library/react'
import { getBlurDataUrl } from '@fubaritico-ds/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Image from './Image'

vi.mock('@fubaritico-ds/shared', () => ({
  getBlurDataUrl: vi
    .fn()
    .mockResolvedValue('data:image/jpeg;base64,mockAutoBlur'),
}))

describe('Image', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test image',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with correct src and alt', () => {
    render(<Image {...defaultProps} />)
    const img = screen.getByRole('img', { name: 'Test image' })
    expect(img).toHaveAttribute('src', defaultProps.src)
    expect(img).toHaveAttribute('alt', defaultProps.alt)
  })

  it('applies default aspect ratio 2/3', () => {
    render(<Image {...defaultProps} />)
    const container = screen.getByRole('img').parentElement
    expect(container).toHaveStyle({ aspectRatio: '2/3' })
  })

  it('applies custom aspect ratio', () => {
    render(<Image {...defaultProps} aspectRatio="16/9" />)
    const container = screen.getByRole('img').parentElement
    expect(container).toHaveStyle({ aspectRatio: '16/9' })
  })

  it('starts in loading state', () => {
    render(<Image {...defaultProps} />)
    const container = screen.getByRole('img').parentElement
    expect(container).toHaveAttribute('data-state', 'loading')
  })

  it('transitions to loaded state on image load', () => {
    render(<Image {...defaultProps} />)
    const img = screen.getByRole('img', { name: 'Test image' })
    fireEvent.load(img)
    const container = img.parentElement
    expect(container).toHaveAttribute('data-state', 'loaded')
  })

  it('transitions to error state on image error', () => {
    const { container } = render(<Image {...defaultProps} />)
    const img = screen.getByRole('img', { name: 'Test image' })
    fireEvent.error(img)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveAttribute('data-state', 'error')
  })

  it('shows default fallback on error', () => {
    render(<Image {...defaultProps} />)
    const img = screen.getByRole('img', { name: 'Test image' })
    fireEvent.error(img)
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('shows custom fallback on error', () => {
    render(<Image {...defaultProps} fallback={<span>Custom fallback</span>} />)
    const img = screen.getByRole('img', { name: 'Test image' })
    fireEvent.error(img)
    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
  })

  it('calls onLoad callback when image loads', () => {
    const onLoad = vi.fn()
    render(<Image {...defaultProps} onLoad={onLoad} />)
    const img = screen.getByRole('img', { name: 'Test image' })
    fireEvent.load(img)
    expect(onLoad).toHaveBeenCalledTimes(1)
  })

  it('calls onError callback when image fails', () => {
    const onError = vi.fn()
    render(<Image {...defaultProps} onError={onError} />)
    const img = screen.getByRole('img', { name: 'Test image' })
    fireEvent.error(img)
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('renders blur placeholder when blurDataUrl is provided', () => {
    const { container } = render(
      <Image
        {...defaultProps}
        blurDataUrl="data:image/jpeg;base64,/9j/4AAQSkZJRg=="
      />
    )
    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute(
      'src',
      'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
    )
  })

  it('hides blur placeholder after image loads', () => {
    const { container } = render(
      <Image
        {...defaultProps}
        blurDataUrl="data:image/jpeg;base64,/9j/4AAQSkZJRg=="
      />
    )
    const mainImg = screen.getByRole('img', { name: 'Test image' })
    fireEvent.load(mainImg)
    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(1)
  })

  it('applies custom className', () => {
    render(<Image {...defaultProps} className="custom-class" />)
    const container = screen.getByRole('img').parentElement
    expect(container).toHaveClass('custom-class')
  })

  it('passes additional props to img element', () => {
    render(<Image {...defaultProps} data-testid="custom-image" />)
    expect(screen.getByTestId('custom-image')).toBeInTheDocument()
  })

  it('calls getBlurDataUrl when autoBlur is true', async () => {
    render(
      <Image
        {...defaultProps}
        autoBlur={true}
        blurSize={32}
        blurQuality={0.5}
      />
    )

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(getBlurDataUrl).toHaveBeenCalledWith(defaultProps.src, 32, 0.5)
  })

  it('renders auto-generated blur placeholder', async () => {
    const { container } = render(<Image {...defaultProps} autoBlur={true} />)

    await new Promise((resolve) => setTimeout(resolve, 0))

    const images = container.querySelectorAll('img')
    expect(images.length).toBeGreaterThan(1)
  })

  it('does not call getBlurDataUrl when blurDataUrl is already provided', () => {
    render(
      <Image
        {...defaultProps}
        autoBlur={true}
        blurDataUrl="data:image/jpeg;base64,already-provided"
      />
    )

    expect(getBlurDataUrl).not.toHaveBeenCalled()
  })

  it('handles getBlurDataUrl rejection gracefully', async () => {
    vi.mocked(getBlurDataUrl).mockRejectedValueOnce(
      new Error('Blur generation failed')
    )

    const { container } = render(<Image {...defaultProps} autoBlur={true} />)

    await new Promise((resolve) => setTimeout(resolve, 0))

    // Component should still render without error
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies lazy loading strategy', () => {
    const observeMock = vi.fn()
    const unobserveMock = vi.fn()
    const disconnectMock = vi.fn()

    window.IntersectionObserver = vi.fn(() => ({
      observe: observeMock,
      unobserve: unobserveMock,
      disconnect: disconnectMock,
    })) as never

    render(<Image {...defaultProps} loading="lazy" />)

    expect(window.IntersectionObserver).toHaveBeenCalled()
    expect(observeMock).toHaveBeenCalled()
  })

  it('does not use IntersectionObserver when loading is eager', () => {
    const observeMock = vi.fn()

    window.IntersectionObserver = vi.fn(() => ({
      observe: observeMock,
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })) as never

    render(<Image {...defaultProps} loading="eager" />)

    expect(observeMock).not.toHaveBeenCalled()
  })

  it('resets state to loading when src changes', () => {
    const { rerender } = render(<Image {...defaultProps} />)

    const img = screen.getByRole('img', { name: 'Test image' })
    fireEvent.load(img)

    const container = img.parentElement
    expect(container).toHaveAttribute('data-state', 'loaded')

    // Change src — should reset to loading
    rerender(
      <Image {...defaultProps} src="https://example.com/new-image.jpg" />
    )

    // After src change, state should be back to loading
    const newImg = screen.getByRole('img', { name: 'Test image' })
    expect(newImg.parentElement).toHaveAttribute('data-state', 'loading')
  })
})
