import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'

import Card from './Card'

describe('Card', () => {
  describe('happy path', () => {
    it('renders its children', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('applies the base skin class and the default variant (no modifier)', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('ui-card')
      // `default` is the base — it emits no modifier class.
      expect(card.className).not.toMatch(/ui-card--/)
    })

    it('composes the surface with its padded slots', () => {
      render(
        <Card data-testid="card">
          <Card.Header data-testid="header">Title</Card.Header>
          <Card.Body data-testid="body">Body</Card.Body>
          <Card.Footer data-testid="footer">Footer</Card.Footer>
        </Card>
      )
      expect(screen.getByTestId('header')).toHaveClass('ui-card__header')
      expect(screen.getByTestId('body')).toHaveClass('ui-card__body')
      expect(screen.getByTestId('footer')).toHaveClass('ui-card__footer')
    })
  })

  describe('variants', () => {
    it.each([
      ['default', null],
      ['outline', 'ui-card--outline'],
      ['elevated', 'ui-card--elevated'],
      ['ghost', 'ui-card--ghost'],
    ] as const)(
      'variant "%s" emits the right modifier',
      (variant, modifier) => {
        render(
          <Card variant={variant} data-testid="card">
            Content
          </Card>
        )
        const card = screen.getByTestId('card')
        expect(card).toHaveClass('ui-card')
        if (modifier) {
          expect(card).toHaveClass(modifier)
        } else {
          expect(card.className).not.toMatch(/ui-card--/)
        }
      }
    )

    it('renders a media child edge-to-edge alongside a padded body', () => {
      render(
        <Card data-testid="card">
          <img src="cover.jpg" alt="Cover" />
          <Card.Body data-testid="body">Caption</Card.Body>
        </Card>
      )
      // The image is a direct child of the surface (clipped by the skin's overflow), the text is padded.
      const card = screen.getByTestId('card')
      expect(card.querySelector('img')).toBeInTheDocument()
      expect(screen.getByTestId('body')).toHaveClass('ui-card__body')
    })
  })

  describe('managed errors', () => {
    // L3: N/A — Card is a pure presentational surface with no validation or user-facing error state.
    // The only enforced contract (slot used outside <Card>) surfaces as a thrown error → see L4.
    it('throws when Card.Body is used outside <Card>', () => {
      expect(() => render(<Card.Body>Orphan</Card.Body>)).toThrow(
        /Card\.Body must be used within <Card>/
      )
    })

    it('throws when Card.Header is used outside <Card>', () => {
      expect(() => render(<Card.Header>Orphan</Card.Header>)).toThrow(
        /Card\.Header must be used within <Card>/
      )
    })

    it('throws when Card.Footer is used outside <Card>', () => {
      expect(() => render(<Card.Footer>Orphan</Card.Footer>)).toThrow(
        /Card\.Footer must be used within <Card>/
      )
    })
  })

  describe('unmanaged errors', () => {
    it('falls back to the default variant when none is passed', () => {
      render(<Card data-testid="card">Content</Card>)
      // No `variant` prop → CVA default applies, base class only, no crash.
      expect(screen.getByTestId('card')).toHaveClass('ui-card')
    })

    it('renders an empty Card without crashing', () => {
      render(<Card data-testid="card" />)
      expect(screen.getByTestId('card')).toBeEmptyDOMElement()
    })
  })

  describe('edge cases', () => {
    it('appends a consumer className after the skin classes', () => {
      render(
        <Card className="custom-class" data-testid="card">
          Content
        </Card>
      )
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('ui-card')
      expect(card).toHaveClass('custom-class')
    })

    it('forwards arbitrary native attributes', () => {
      render(
        <Card id="promo" data-testid="card" aria-label="Promotion">
          Content
        </Card>
      )
      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('id', 'promo')
      expect(card).toHaveAttribute('aria-label', 'Promotion')
    })

    it('forwards a ref to the underlying div (React 19 ref-as-prop)', () => {
      const ref = createRef<HTMLDivElement>()
      render(
        <Card ref={ref} data-testid="card">
          Content
        </Card>
      )
      expect(ref.current).toBe(screen.getByTestId('card'))
    })

    it('forwards events on the surface and on the slots', async () => {
      const user = userEvent.setup()
      let surfaceClicks = 0
      let footerClicks = 0
      render(
        <Card data-testid="card" onClick={() => (surfaceClicks += 1)}>
          <Card.Footer data-testid="footer" onClick={() => (footerClicks += 1)}>
            Footer
          </Card.Footer>
        </Card>
      )
      await user.click(screen.getByTestId('footer'))
      // The footer click bubbles to the surface too (one direct + one bubbled).
      expect(footerClicks).toBe(1)
      expect(surfaceClicks).toBe(1)
    })

    it('renders nested slots in any order', () => {
      render(
        <Card data-testid="card">
          <Card.Body data-testid="body">Body first</Card.Body>
          <Card.Header data-testid="header">Header second</Card.Header>
        </Card>
      )
      expect(screen.getByTestId('body')).toBeInTheDocument()
      expect(screen.getByTestId('header')).toBeInTheDocument()
    })
  })
})
