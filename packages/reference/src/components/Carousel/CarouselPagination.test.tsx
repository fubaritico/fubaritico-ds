import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import CarouselPagination from './CarouselPagination'

describe('CarouselPagination', () => {
  describe('dots count', () => {
    it('renders nothing when total is 0', () => {
      const { container } = render(<CarouselPagination total={0} current={0} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders correct number of dots', () => {
      const { container } = render(<CarouselPagination total={5} current={0} />)
      const dots = container.querySelectorAll('div[class*="rounded"]')
      expect(dots.length).toBe(5)
    })

    it('renders single dot when total=1', () => {
      const { container } = render(<CarouselPagination total={1} current={0} />)
      const dots = container.querySelectorAll('div[class*="rounded"]')
      expect(dots.length).toBe(1)
    })
  })

  describe('active dot styling', () => {
    it('active dot has w-6 class (wider)', () => {
      const { container } = render(<CarouselPagination total={3} current={0} />)
      const dots = container.querySelectorAll('div[class*="rounded"]')
      expect(dots[0]).toHaveClass('ui:w-6')
    })

    it('inactive dots have w-2 class (narrower)', () => {
      const { container } = render(<CarouselPagination total={3} current={0} />)
      const dots = container.querySelectorAll('div[class*="rounded"]')
      expect(dots[1]).toHaveClass('ui:w-2')
    })

    it('active dot changes when index changes', () => {
      const { container, rerender } = render(
        <CarouselPagination total={3} current={0} />
      )
      let dots = container.querySelectorAll('div[class*="rounded"]')
      expect(dots[0]).toHaveClass('ui:w-6')

      rerender(<CarouselPagination total={3} current={1} />)
      dots = container.querySelectorAll('div[class*="rounded"]')
      expect(dots[1]).toHaveClass('ui:w-6')
      expect(dots[0]).toHaveClass('ui:w-2')
    })
  })

  describe('light variant', () => {
    it('applies white colors when light=true', () => {
      const { container } = render(
        <CarouselPagination total={2} current={0} light />
      )
      const dots = container.querySelectorAll('div[class*="rounded"]')
      expect(dots[0]).toHaveClass('ui:bg-white')
    })

    it('applies default colors when light=false', () => {
      const { container } = render(
        <CarouselPagination total={2} current={0} light={false} />
      )
      const dots = container.querySelectorAll('div[class*="rounded"]')
      expect(dots[0]).not.toHaveClass('ui:bg-white')
    })
  })

  describe('additional props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <CarouselPagination total={2} current={0} className="ui:custom" />
      )
      expect(container.firstChild).toHaveClass('ui:custom')
    })
  })
})
