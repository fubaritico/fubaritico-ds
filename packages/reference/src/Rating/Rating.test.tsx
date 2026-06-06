import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Rating from './Rating'

describe('Rating', () => {
  describe('Circle variant', () => {
    it('renders circle rating by default', () => {
      const { container } = render(<Rating value={7.5} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('displays the value when showValue is true', () => {
      render(<Rating value={7.5} showValue />)
      expect(screen.getByText('7.5')).toBeInTheDocument()
    })

    it('displays percentage when max is 100', () => {
      render(<Rating value={75} max={100} showValue />)
      expect(screen.getByText('75')).toBeInTheDocument()
    })

    it('clamps value to max', () => {
      render(<Rating value={15} max={10} showValue />)
      expect(screen.getByText('10.0')).toBeInTheDocument()
    })

    it('clamps value to 0', () => {
      render(<Rating value={-5} max={10} showValue />)
      expect(screen.getByText('0.0')).toBeInTheDocument()
    })

    it('applies size classes correctly', () => {
      const { container, rerender } = render(<Rating value={7} size="sm" />)
      expect(container.querySelector('svg')).toHaveAttribute('width', '32')

      rerender(<Rating value={7} size="md" />)
      expect(container.querySelector('svg')).toHaveAttribute('width', '48')

      rerender(<Rating value={7} size="lg" />)
      expect(container.querySelector('svg')).toHaveAttribute('width', '64')
    })
  })

  describe('Stars variant', () => {
    it('renders stars rating', () => {
      const { container } = render(<Rating value={7.5} variant="stars" />)
      const stars = container.querySelectorAll('svg')
      expect(stars.length).toBe(10) // 5 empty + 5 filled
    })

    it('displays the value when showValue is true', () => {
      render(<Rating value={7.5} variant="stars" showValue />)
      expect(screen.getByText('7.5')).toBeInTheDocument()
    })

    it('converts max=100 value to /10 display', () => {
      render(<Rating value={75} max={100} variant="stars" showValue />)
      expect(screen.getByText('7.5')).toBeInTheDocument()
    })

    it('applies correct clip-path for partial fill', () => {
      const { container } = render(
        <Rating value={5} max={10} variant="stars" />
      )
      const filledContainer = container.querySelector('[style]')
      expect(filledContainer).toBeInTheDocument()
      expect(filledContainer).toHaveAttribute(
        'style',
        'clip-path: inset(0 50% 0 0);'
      )
    })

    it('applies size classes correctly', () => {
      const { container, rerender } = render(
        <Rating value={7} variant="stars" size="sm" />
      )
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('width', '16')

      rerender(<Rating value={7} variant="stars" size="md" />)
      expect(container.querySelector('svg')).toHaveAttribute('width', '20')

      rerender(<Rating value={7} variant="stars" size="lg" />)
      expect(container.querySelector('svg')).toHaveAttribute('width', '24')
    })
  })

  describe('Common behavior', () => {
    it('hides value when showValue is false', () => {
      render(<Rating value={7.5} showValue={false} />)
      expect(screen.queryByText('7.5')).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <Rating value={7} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
