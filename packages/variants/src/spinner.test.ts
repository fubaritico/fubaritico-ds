import { describe, expect, it } from 'vitest'

import { spinnerVariants } from './spinner.js'

describe('spinnerVariants', () => {
  describe('happy path', () => {
    it('returns the base class with the default size when called with no args', () => {
      expect(spinnerVariants()).toBe('ui-spinner')
    })

    it('returns the base class when called with an empty options object', () => {
      expect(spinnerVariants({})).toBe('ui-spinner')
    })
  })

  describe('variants', () => {
    it.each([
      ['sm', 'ui-spinner ui-spinner--sm'],
      ['lg', 'ui-spinner ui-spinner--lg'],
    ] as const)('emits the modifier for size "%s"', (size, expected) => {
      expect(spinnerVariants({ size })).toBe(expected)
    })

    it('emits no modifier for the default md size', () => {
      expect(spinnerVariants({ size: 'md' })).toBe('ui-spinner')
    })
  })

  // L3 managed errors: N/A — a pure CVA resolver has no user-facing error path.

  describe('unmanaged errors', () => {
    it('falls back to the default when size is explicitly undefined', () => {
      expect(spinnerVariants({ size: undefined })).toBe('ui-spinner')
    })
  })

  describe('edge cases', () => {
    it('never emits an empty-string token in the output', () => {
      const result = spinnerVariants({ size: 'md' })
      expect(result.split(' ')).not.toContain('')
    })
  })
})
