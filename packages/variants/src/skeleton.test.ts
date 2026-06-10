import { describe, expect, it } from 'vitest'

import { skeletonVariants } from './skeleton.js'

describe('skeletonVariants', () => {
  describe('happy path', () => {
    it('returns the base class with default variant/rounded when called with no args', () => {
      expect(skeletonVariants()).toBe('ui-skeleton')
    })

    it('returns the base class when called with an empty options object', () => {
      expect(skeletonVariants({})).toBe('ui-skeleton')
    })
  })

  describe('variants', () => {
    it.each([
      ['circle', 'ui-skeleton ui-skeleton--circle'],
      ['line', 'ui-skeleton ui-skeleton--line'],
    ] as const)('emits the modifier for variant "%s"', (variant, expected) => {
      expect(skeletonVariants({ variant })).toBe(expected)
    })

    it('emits no shape modifier for the default rectangle variant', () => {
      expect(skeletonVariants({ variant: 'rectangle' })).toBe('ui-skeleton')
    })

    it('emits no extra class for the default rounded=true', () => {
      expect(skeletonVariants({ rounded: true })).toBe('ui-skeleton')
    })

    it('squares the corners of a rectangle when rounded=false', () => {
      expect(skeletonVariants({ variant: 'rectangle', rounded: false })).toBe(
        'ui-skeleton ui-skeleton--square'
      )
    })

    it('squares the corners of a line when rounded=false', () => {
      expect(skeletonVariants({ variant: 'line', rounded: false })).toBe(
        'ui-skeleton ui-skeleton--line ui-skeleton--square'
      )
    })

    it('never squares a circle, even when rounded=false', () => {
      expect(skeletonVariants({ variant: 'circle', rounded: false })).toBe(
        'ui-skeleton ui-skeleton--circle'
      )
    })
  })

  // L3 managed errors: N/A — a pure CVA resolver has no user-facing error path.

  describe('unmanaged errors', () => {
    it('falls back to defaults when variant/rounded are explicitly undefined', () => {
      expect(skeletonVariants({ variant: undefined, rounded: undefined })).toBe(
        'ui-skeleton'
      )
    })
  })

  describe('edge cases', () => {
    it('never emits an empty-string token in the output', () => {
      const result = skeletonVariants({ variant: 'rectangle', rounded: true })
      expect(result.split(' ')).not.toContain('')
    })
  })
})
