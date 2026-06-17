import { describe, expect, it } from 'vitest'

import {
  RATING_CIRCLE_CLASS,
  RATING_INDICATOR_CLASS,
  RATING_STARS_CLASS,
  RATING_STARS_FILL_CLASS,
  RATING_STARS_TRACK_CLASS,
  RATING_SVG_CLASS,
  RATING_TRACK_CLASS,
  RATING_VALUE_CENTERED_CLASS,
  RATING_VALUE_CLASS,
  ratingVariants,
} from './rating.js'

describe('ratingVariants', () => {
  describe('happy path', () => {
    it('returns the bare base with no args (circle is the base look)', () => {
      expect(ratingVariants()).toBe('ui-rating')
    })

    it('returns the bare base for an empty options object', () => {
      expect(ratingVariants({})).toBe('ui-rating')
    })
  })

  describe('variants', () => {
    it('emits no look modifier for the default circle', () => {
      expect(ratingVariants({ variant: 'circle' })).toBe('ui-rating')
    })

    it('emits the look modifier for stars', () => {
      expect(ratingVariants({ variant: 'stars' })).toBe(
        'ui-rating ui-rating--stars'
      )
    })

    it.each([
      ['sm', 'ui-rating ui-rating--sm'],
      ['lg', 'ui-rating ui-rating--lg'],
    ] as const)('emits the size modifier for "%s"', (size, expected) => {
      expect(ratingVariants({ size })).toBe(expected)
    })

    it('emits no size modifier for the default md', () => {
      expect(ratingVariants({ size: 'md' })).toBe('ui-rating')
    })

    it.each([
      ['lg', 'ui-rating ui-rating--stars ui-rating--lg'],
      ['sm', 'ui-rating ui-rating--stars ui-rating--sm'],
    ] as const)('composes the stars look with size "%s"', (size, expected) => {
      expect(ratingVariants({ variant: 'stars', size })).toBe(expected)
    })
  })

  // L3 managed errors: N/A — a pure CVA resolver has no user-facing error path.

  describe('unmanaged errors', () => {
    it('falls back to the bare base when every option is explicitly undefined', () => {
      expect(ratingVariants({ variant: undefined, size: undefined })).toBe(
        'ui-rating'
      )
    })
  })

  describe('edge cases', () => {
    it('never emits an empty-string token for the default (no-args) call', () => {
      expect(ratingVariants().split(' ')).not.toContain('')
    })

    it('never emits an empty-string token for the explicit base (circle/md)', () => {
      expect(
        ratingVariants({ variant: 'circle', size: 'md' }).split(' ')
      ).not.toContain('')
    })
  })
})

describe('rating element class constants', () => {
  it('expose the static BEM element/modifier names', () => {
    expect(RATING_VALUE_CLASS).toBe('ui-rating__value')
    expect(RATING_VALUE_CENTERED_CLASS).toBe('ui-rating__value--centered')
    expect(RATING_STARS_CLASS).toBe('ui-rating__stars')
    expect(RATING_STARS_TRACK_CLASS).toBe('ui-rating__stars-track')
    expect(RATING_STARS_FILL_CLASS).toBe('ui-rating__stars-fill')
    expect(RATING_CIRCLE_CLASS).toBe('ui-rating__circle')
    expect(RATING_SVG_CLASS).toBe('ui-rating__svg')
    expect(RATING_TRACK_CLASS).toBe('ui-rating__track')
    expect(RATING_INDICATOR_CLASS).toBe('ui-rating__indicator')
  })
})
