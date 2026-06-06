import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import CarouselLoading from './CarouselLoading'

describe('CarouselLoading', () => {
  describe('count', () => {
    it('renders default 6 skeleton cards', () => {
      const { container } = render(<CarouselLoading />)
      const cards = container.querySelectorAll('div[style*="min-width"]')
      expect(cards.length).toBe(6)
    })

    it('renders custom count of skeleton cards', () => {
      const { container } = render(<CarouselLoading count={3} />)
      const cards = container.querySelectorAll('div[style*="min-width"]')
      expect(cards.length).toBe(3)
    })

    it('renders 1 card when count=1', () => {
      const { container } = render(<CarouselLoading count={1} />)
      const cards = container.querySelectorAll('div[style*="min-width"]')
      expect(cards.length).toBe(1)
    })
  })

  describe('title and subtitle visibility', () => {
    it('renders title skeleton by default', () => {
      const { container } = render(<CarouselLoading />)
      const titleSkeleton = container.querySelector(
        'div[style*="height: 16px"]'
      )
      expect(titleSkeleton).toBeInTheDocument()
    })

    it('renders subtitle skeleton by default', () => {
      const { container } = render(<CarouselLoading />)
      const subtitleSkeleton = container.querySelector(
        'div[style*="height: 12px"]'
      )
      expect(subtitleSkeleton).toBeInTheDocument()
    })

    it('hides title skeleton when showTitle=false', () => {
      const { container } = render(<CarouselLoading showTitle={false} />)
      const titleSkeleton = container.querySelector(
        'div[style*="height: 16px"]'
      )
      expect(titleSkeleton).not.toBeInTheDocument()
    })

    it('hides subtitle skeleton when showSubtitle=false', () => {
      const { container } = render(<CarouselLoading showSubtitle={false} />)
      const subtitleSkeleton = container.querySelector(
        'div[style*="height: 12px"]'
      )
      expect(subtitleSkeleton).not.toBeInTheDocument()
    })
  })
})
