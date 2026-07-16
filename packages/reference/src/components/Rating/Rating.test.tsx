import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Rating from './Rating'

describe('Rating', () => {
  describe('happy path', () => {
    it('renders the circle ring by default', () => {
      const { container } = render(<Rating value={7.5} />)
      // Circle is the base look — the SVG ring (not a star row) proves the default.
      expect(container.querySelector('.ui-rating__circle')).toBeInTheDocument()
      expect(container.querySelector('svg')).toBeInTheDocument()
      expect(container.firstChild).toHaveClass('ui-rating')
    })

    it('displays the value when showValue is true', () => {
      render(<Rating value={7.5} showValue />)
      expect(screen.getByText('7.5')).toBeInTheDocument()
    })

    it('exposes an accessible name via role="img" + a computed aria-label', () => {
      render(<Rating value={7.5} />)
      expect(
        screen.getByRole('img', { name: 'Rating: 7.5 out of 10' })
      ).toBeInTheDocument()
    })

    it('marks the visual (svg) decorative', () => {
      const { container } = render(<Rating value={7} />)
      expect(container.querySelector('svg')).toHaveAttribute(
        'aria-hidden',
        'true'
      )
    })
  })

  describe('variants', () => {
    it('renders the stars look with 10 svgs (5 empty + 5 filled)', () => {
      const { container } = render(<Rating value={7.5} variant="stars" />)
      expect(container.querySelectorAll('svg')).toHaveLength(10)
      expect(container.firstChild).toHaveClass('ui-rating--stars')
    })

    it('displays the circle percentage when max is 100', () => {
      render(<Rating value={75} max={100} showValue />)
      expect(screen.getByText('75')).toBeInTheDocument()
    })

    it('converts a max=100 value to a /10 display for stars', () => {
      render(<Rating value={75} max={100} variant="stars" showValue />)
      expect(screen.getByText('7.5')).toBeInTheDocument()
    })

    it('exposes the score fraction as the --ui-rating-fill custom property', () => {
      const { container } = render(
        <Rating value={5} max={10} variant="stars" />
      )
      // The skin clips from this fraction (direction handled in CSS, incl. RTL).
      expect(container.querySelector('.ui-rating__stars-fill')).toHaveStyle({
        '--ui-rating-fill': '50%',
      })
    })

    it.each([
      ['sm', '32'],
      ['md', '48'],
      ['lg', '64'],
    ] as const)('sizes the circle svg for "%s"', (size, width) => {
      const { container } = render(<Rating value={7} size={size} />)
      expect(container.querySelector('svg')).toHaveAttribute('width', width)
    })

    it.each([
      ['sm', '16'],
      ['md', '20'],
      ['lg', '24'],
    ] as const)('sizes the star svg for "%s"', (size, width) => {
      const { container } = render(
        <Rating value={7} variant="stars" size={size} />
      )
      expect(container.querySelector('svg')).toHaveAttribute('width', width)
    })

    it('lets the consumer override the aria-label', () => {
      render(<Rating value={7.5} aria-label="Note : 7,5 sur 10" />)
      expect(
        screen.getByRole('img', { name: 'Note : 7,5 sur 10' })
      ).toBeInTheDocument()
    })
  })

  describe('managed errors', () => {
    it('keeps the accessible name when the visible value is hidden', () => {
      render(<Rating value={7.5} showValue={false} />)
      expect(screen.queryByText('7.5')).not.toBeInTheDocument()
      expect(
        screen.getByRole('img', { name: 'Rating: 7.5 out of 10' })
      ).toBeInTheDocument()
    })
  })

  describe('unmanaged errors', () => {
    it('clamps a value above max', () => {
      render(<Rating value={15} max={10} showValue />)
      expect(screen.getByText('10.0')).toBeInTheDocument()
    })

    it('clamps a value below 0', () => {
      render(<Rating value={-5} max={10} showValue />)
      expect(screen.getByText('0.0')).toBeInTheDocument()
    })

    it('does not throw or divide-by-zero when max is 0', () => {
      const { container } = render(<Rating value={5} max={0} showValue />)
      expect(container.querySelector('svg')).toBeInTheDocument()
      expect(screen.getByText('0.0')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('renders a zero value', () => {
      render(<Rating value={0} showValue />)
      expect(screen.getByText('0.0')).toBeInTheDocument()
    })

    it('renders a full value (value === max)', () => {
      render(<Rating value={10} max={10} showValue />)
      expect(screen.getByText('10.0')).toBeInTheDocument()
    })

    it('merges a custom className onto the root', () => {
      const { container } = render(
        <Rating value={7} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
