import { describe, expect, it } from 'vitest'

import {
  CARD_BODY_CLASS,
  CARD_FOOTER_CLASS,
  CARD_HEADER_CLASS,
  cardVariants,
} from './card.js'

describe('cardVariants', () => {
  describe('happy path', () => {
    it('returns the base class with the default variant when called with no args', () => {
      expect(cardVariants()).toBe('ui-card')
    })

    it('returns the base class when called with an empty options object', () => {
      expect(cardVariants({})).toBe('ui-card')
    })
  })

  describe('variants', () => {
    it.each([
      ['outline', 'ui-card ui-card--outline'],
      ['elevated', 'ui-card ui-card--elevated'],
      ['ghost', 'ui-card ui-card--ghost'],
    ] as const)('emits the modifier for variant "%s"', (variant, expected) => {
      expect(cardVariants({ variant })).toBe(expected)
    })

    it('emits no modifier for the default variant', () => {
      expect(cardVariants({ variant: 'default' })).toBe('ui-card')
    })
  })

  // L3 managed errors: N/A — a pure CVA resolver has no user-facing error path.

  describe('unmanaged errors', () => {
    it('falls back to the default when variant is explicitly undefined', () => {
      expect(cardVariants({ variant: undefined })).toBe('ui-card')
    })
  })

  describe('edge cases', () => {
    it('exposes the slot element classes', () => {
      expect(CARD_BODY_CLASS).toBe('ui-card__body')
      expect(CARD_HEADER_CLASS).toBe('ui-card__header')
      expect(CARD_FOOTER_CLASS).toBe('ui-card__footer')
    })

    it('never emits an empty-string token in the output', () => {
      const result = cardVariants({ variant: 'default' })
      expect(result.split(' ')).not.toContain('')
    })
  })
})
