import { describe, expect, it } from 'vitest'

import { SORT_ARROWS_CLASS, sortArrowVariants } from './sort-arrows.js'

describe('sortArrowVariants', () => {
  describe('happy path', () => {
    it('emits the base icon class when not dimmed (default)', () => {
      expect(sortArrowVariants()).toBe('ui-sort-arrows__icon')
    })
  })

  describe('variants', () => {
    it('emits the dimmed modifier', () => {
      expect(sortArrowVariants({ dimmed: true })).toBe(
        'ui-sort-arrows__icon ui-sort-arrows__icon--dimmed'
      )
    })

    it('emits no modifier when not dimmed', () => {
      expect(sortArrowVariants({ dimmed: false })).toBe('ui-sort-arrows__icon')
    })
  })

  // L3: managed errors — N/A (pure class-name resolver)

  describe('unmanaged errors', () => {
    it('falls back to not-dimmed on an empty object', () => {
      expect(sortArrowVariants({})).toBe('ui-sort-arrows__icon')
    })
  })

  describe('edge cases', () => {
    it('exposes the stable button class constant', () => {
      expect(SORT_ARROWS_CLASS).toBe('ui-sort-arrows')
    })
  })
})
