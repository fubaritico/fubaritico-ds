import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Skeleton from './Skeleton'

describe('Skeleton', () => {
  describe('happy path', () => {
    it('applies the base BEM block and emits no modifier for the defaults', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild
      expect(skeleton).toHaveClass('ui-skeleton')
      // default variant (rectangle) + rounded => base class only, no modifier
      expect(skeleton).not.toHaveClass('ui-skeleton--circle')
      expect(skeleton).not.toHaveClass('ui-skeleton--line')
      expect(skeleton).not.toHaveClass('ui-skeleton--square')
    })
  })

  describe('variants', () => {
    it('renders the circle variant modifier', () => {
      const { container } = render(<Skeleton variant="circle" />)
      expect(container.firstChild).toHaveClass('ui-skeleton--circle')
    })

    it('renders the line variant modifier', () => {
      const { container } = render(<Skeleton variant="line" />)
      expect(container.firstChild).toHaveClass('ui-skeleton--line')
    })

    it('squares a rectangle when rounded is false', () => {
      const { container } = render(
        <Skeleton variant="rectangle" rounded={false} />
      )
      expect(container.firstChild).toHaveClass('ui-skeleton--square')
    })

    it('squares a line when rounded is false (keeping the line modifier)', () => {
      const { container } = render(<Skeleton variant="line" rounded={false} />)
      const skeleton = container.firstChild
      expect(skeleton).toHaveClass('ui-skeleton--line')
      expect(skeleton).toHaveClass('ui-skeleton--square')
    })

    it('never squares a circle, even with rounded false', () => {
      const { container } = render(
        <Skeleton variant="circle" rounded={false} />
      )
      const skeleton = container.firstChild
      expect(skeleton).toHaveClass('ui-skeleton--circle')
      expect(skeleton).not.toHaveClass('ui-skeleton--square')
    })

    it('applies width and height as logical inline styles', () => {
      const { container } = render(<Skeleton width="200px" height="100px" />)
      expect(container.firstChild).toHaveStyle({
        inlineSize: '200px',
        blockSize: '100px',
      })
    })

    it('applies aspectRatio as an inline style', () => {
      const { container } = render(<Skeleton aspectRatio="16 / 9" />)
      expect(container.firstChild).toHaveStyle({ aspectRatio: '16 / 9' })
    })
  })

  // L3 (managed errors): N/A — presentational atom with no validation/disabled/error states.
  // L4 (unmanaged errors): N/A — no async/data path; nothing to throw or swallow.

  describe('edge cases', () => {
    it('merges a custom className after the skin classes', () => {
      const { container } = render(<Skeleton className="custom-class" />)
      expect(container.firstChild).toHaveClass('ui-skeleton')
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('merges a consumer-provided style with the dimension styles', () => {
      const { container } = render(
        <Skeleton width="50px" style={{ opacity: 0.5 }} />
      )
      expect(container.firstChild).toHaveStyle({
        inlineSize: '50px',
        opacity: '0.5',
      })
    })

    it('forwards arbitrary div attributes (id, aria-hidden)', () => {
      const { container } = render(<Skeleton id="loader" aria-hidden="true" />)
      const skeleton = container.firstChild
      expect(skeleton).toHaveAttribute('id', 'loader')
      expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    })

    it('omits width/height styles when none are provided', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton.style.inlineSize).toBe('')
      expect(skeleton.style.blockSize).toBe('')
    })
  })
})
