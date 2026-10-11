import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Card } from './Card'

import type { CSSProperties } from 'react'

// Real Chromium with the real skin: the per-corner radius API is cascade and logical properties,
// none of which jsdom computes. Card stands for every block: they all share the same mechanism
// (`--ui-<block>-radius` + four optional logical corners falling back to it).

/** Inline custom properties for a test card. */
type Vars = CSSProperties & Record<`--${string}`, string>

/**
 * The four physical corners of an element, as computed.
 *
 * @param element - The element.
 * @returns Its corner radii, top-left first, clockwise.
 */
function corners(element: HTMLElement) {
  const style = getComputedStyle(element)
  return [
    style.borderTopLeftRadius,
    style.borderTopRightRadius,
    style.borderBottomRightRadius,
    style.borderBottomLeftRadius,
  ]
}

describe('Card radius API (browser)', () => {
  describe('happy path', () => {
    it('rounds all four corners from the single block variable', () => {
      render(
        <Card data-testid="card" style={{ '--ui-card-radius': '10px' } as Vars}>
          Body
        </Card>
      )
      expect(corners(screen.getByTestId('card'))).toEqual([
        '10px',
        '10px',
        '10px',
        '10px',
      ])
    })
  })

  describe('variants', () => {
    it('overrides one corner alone; the others keep following the block variable', () => {
      render(
        <Card
          data-testid="card"
          style={
            {
              '--ui-card-radius': '0px',
              '--ui-card-radius-start-start': '16px',
            } as Vars
          }
        >
          Body
        </Card>
      )
      expect(corners(screen.getByTestId('card'))).toEqual([
        '16px',
        '0px',
        '0px',
        '0px',
      ])
    })

    it('rounds two corners — the top edge — and leaves the bottom square', () => {
      render(
        <Card
          data-testid="card"
          style={
            {
              '--ui-card-radius': '0px',
              '--ui-card-radius-start-start': '12px',
              '--ui-card-radius-start-end': '12px',
            } as Vars
          }
        >
          Body
        </Card>
      )
      expect(corners(screen.getByTestId('card'))).toEqual([
        '12px',
        '12px',
        '0px',
        '0px',
      ])
    })
  })

  // L3/L4: N/A — a custom property cannot fail; an unset corner simply falls back (covered above).

  describe('edge cases', () => {
    it('keeps the corners logical: start-start is the top-RIGHT corner under dir="rtl"', () => {
      render(
        <div dir="rtl">
          <Card
            data-testid="card"
            style={
              {
                '--ui-card-radius': '0px',
                '--ui-card-radius-start-start': '16px',
              } as Vars
            }
          >
            Body
          </Card>
        </div>
      )
      expect(corners(screen.getByTestId('card'))).toEqual([
        '0px',
        '16px',
        '0px',
        '0px',
      ])
    })
  })
})
