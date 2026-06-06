import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Carousel from './Carousel'
import CarouselCounter from './CarouselCounter'
import CarouselItem from './CarouselItem'

import type { Mock } from 'vitest'

class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

// Stored in a variable to avoid @typescript-eslint/unbound-method on prototype access in expect().
let scrollToMock: Mock

beforeEach(() => {
  scrollToMock = vi.fn()
  Element.prototype.scrollTo = scrollToMock
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
})

describe('Carousel', () => {
  const renderCarousel = (props = {}) =>
    render(
      <Carousel {...props}>
        <CarouselItem>Item 1</CarouselItem>
        <CarouselItem>Item 2</CarouselItem>
        <CarouselItem>Item 3</CarouselItem>
      </Carousel>
    )

  it('renders children', () => {
    renderCarousel()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('renders pagination dots for hero variant', () => {
    const { container } = render(
      <Carousel variant="hero">
        <CarouselItem isHero>Item 1</CarouselItem>
        <CarouselItem isHero>Item 2</CarouselItem>
        <CarouselItem isHero>Item 3</CarouselItem>
      </Carousel>
    )
    const dots = container.querySelectorAll(
      '[aria-hidden="true"].ui\\:w-2, [aria-hidden="true"].ui\\:w-6'
    )
    expect(dots).toHaveLength(3)
  })

  it('hides pagination when showPagination is false', () => {
    const { container } = renderCarousel({ showPagination: false })
    const paginationDiv = container.querySelector(
      '.ui\\:flex.ui\\:items-center.ui\\:gap-2'
    )
    expect(paginationDiv?.children.length ?? 0).toBe(0)
  })

  it('renders navigation arrows for hero variant', () => {
    render(
      <Carousel variant="hero">
        <CarouselItem isHero>Item 1</CarouselItem>
        <CarouselItem isHero>Item 2</CarouselItem>
      </Carousel>
    )
    expect(screen.getByLabelText('Previous')).toBeInTheDocument()
    expect(screen.getByLabelText('Next')).toBeInTheDocument()
  })

  it('hides arrows when showArrows is false', () => {
    renderCarousel({ showArrows: false })
    expect(screen.queryByLabelText('Previous')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Next')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = renderCarousel({ className: 'custom-class' })
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders with hero variant', () => {
    render(
      <Carousel variant="hero" arrowPosition="bottom-right">
        <CarouselItem isHero>Hero Item 1</CarouselItem>
        <CarouselItem isHero>Hero Item 2</CarouselItem>
      </Carousel>
    )
    expect(screen.getByText('Hero Item 1')).toBeInTheDocument()
    expect(screen.getByText('Hero Item 2')).toBeInTheDocument()
  })

  it('renders hero variant with pagination dots and navigation', () => {
    const { container } = render(
      <Carousel variant="hero">
        <CarouselItem isHero>Item 1</CarouselItem>
        <CarouselItem isHero>Item 2</CarouselItem>
        <CarouselItem isHero>Item 3</CarouselItem>
      </Carousel>
    )
    const dots = container.querySelectorAll(
      '[aria-hidden="true"].ui\\:w-2, [aria-hidden="true"].ui\\:w-6'
    )
    expect(dots).toHaveLength(3)
    expect(screen.getByLabelText('Previous')).toBeInTheDocument()
    expect(screen.getByLabelText('Next')).toBeInTheDocument()
  })

  it('displays error message when errorMessage prop is provided', () => {
    render(
      <Carousel errorMessage="Failed to load data">
        <CarouselItem>Item 1</CarouselItem>
        <CarouselItem>Item 2</CarouselItem>
      </Carousel>
    )
    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument()
    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Item 2')).not.toBeInTheDocument()
  })

  it('does not display carousel content when error message is shown', () => {
    const { container } = render(
      <Carousel errorMessage="API Error" showPagination showArrows>
        <CarouselItem>Item 1</CarouselItem>
      </Carousel>
    )
    expect(screen.queryByLabelText('Previous')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Next')).not.toBeInTheDocument()
    const dots = container.querySelectorAll(
      '[aria-hidden="true"].ui\\:w-2, [aria-hidden="true"].ui\\:w-6'
    )
    expect(dots).toHaveLength(0)
  })
})

describe('Carousel lightbox variant', () => {
  it('renders CarouselCounter with item count', () => {
    render(
      <Carousel variant="lightbox" gap={0}>
        <CarouselItem isLightbox>Item 1</CarouselItem>
        <CarouselItem isLightbox>Item 2</CarouselItem>
        <CarouselItem isLightbox>Item 3</CarouselItem>
      </Carousel>
    )
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('renders navigation arrows', () => {
    render(
      <Carousel variant="lightbox" gap={0}>
        <CarouselItem isLightbox>Item 1</CarouselItem>
        <CarouselItem isLightbox>Item 2</CarouselItem>
      </Carousel>
    )
    expect(screen.getByLabelText('Previous')).toBeInTheDocument()
    expect(screen.getByLabelText('Next')).toBeInTheDocument()
  })

  it('calls external onNext callback instead of internal scroll', () => {
    const onNext = vi.fn()
    render(
      <Carousel variant="lightbox" gap={0} onNext={onNext}>
        <CarouselItem isLightbox>Item 1</CarouselItem>
        <CarouselItem isLightbox>Item 2</CarouselItem>
      </Carousel>
    )
    fireEvent.click(screen.getByLabelText('Next'))
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(scrollToMock).not.toHaveBeenCalled()
  })

  it('calls external onPrev callback when provided', () => {
    const onPrev = vi.fn()
    render(
      <Carousel variant="lightbox" gap={0} onPrev={onPrev}>
        <CarouselItem isLightbox>Item 1</CarouselItem>
        <CarouselItem isLightbox>Item 2</CarouselItem>
      </Carousel>
    )
    // Prev is disabled at index 0 — clicking a disabled button does nothing
    const prevBtn = screen.getByLabelText('Previous')
    expect(prevBtn).toBeDisabled()
    expect(onPrev).not.toHaveBeenCalled()
  })

  it('calls onPrev on ArrowLeft keydown', () => {
    const onPrev = vi.fn()
    render(
      <Carousel variant="lightbox" gap={0} initialIndex={1} onPrev={onPrev}>
        <CarouselItem isLightbox>Item 1</CarouselItem>
        <CarouselItem isLightbox>Item 2</CarouselItem>
      </Carousel>
    )
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(onPrev).toHaveBeenCalledTimes(1)
  })

  it('calls onNext on ArrowRight keydown', () => {
    const onNext = vi.fn()
    render(
      <Carousel variant="lightbox" gap={0} onNext={onNext}>
        <CarouselItem isLightbox>Item 1</CarouselItem>
        <CarouselItem isLightbox>Item 2</CarouselItem>
      </Carousel>
    )
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('mounts without error when initialIndex is provided', () => {
    expect(() => {
      render(
        <Carousel variant="lightbox" gap={0} initialIndex={2}>
          <CarouselItem isLightbox>Item 1</CarouselItem>
          <CarouselItem isLightbox>Item 2</CarouselItem>
          <CarouselItem isLightbox>Item 3</CarouselItem>
        </Carousel>
      )
    }).not.toThrow()
  })
})

describe('CarouselCounter', () => {
  it('displays 1-indexed current over total', () => {
    render(<CarouselCounter current={0} total={5} />)
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
  })

  it('increments current by 1 for display', () => {
    render(<CarouselCounter current={2} total={10} />)
    expect(screen.getByText('3 / 10')).toBeInTheDocument()
  })

  it('applies additional className', () => {
    const { container } = render(
      <CarouselCounter current={0} total={3} className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('CarouselItem', () => {
  it('renders children', () => {
    render(<CarouselItem>Test Content</CarouselItem>)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies hero styles when isHero is true', () => {
    const { container } = render(<CarouselItem isHero>Hero</CarouselItem>)
    expect(container.firstChild).toHaveClass('ui:w-full')
    expect(container.firstChild).toHaveClass('ui:snap-center')
  })

  it('applies full-width snap styles when isLightbox is true', () => {
    const { container } = render(
      <CarouselItem isLightbox>Lightbox</CarouselItem>
    )
    expect(container.firstChild).toHaveClass('ui:w-full')
    expect(container.firstChild).toHaveClass('ui:snap-center')
  })

  it('applies custom className', () => {
    const { container } = render(
      <CarouselItem className="custom-item">Item</CarouselItem>
    )
    expect(container.firstChild).toHaveClass('custom-item')
  })
})
