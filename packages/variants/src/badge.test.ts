import { describe, expect, it } from 'vitest'

import { BADGE_ICON_CLASS, BADGE_LABEL_CLASS, badgeVariants } from './badge.js'

describe('badgeVariants', () => {
  describe('happy path', () => {
    it('returns the base class with default variant/size when called with no args', () => {
      expect(badgeVariants()).toBe('ui-badge')
    })

    it('returns the base class when called with an empty options object', () => {
      expect(badgeVariants({})).toBe('ui-badge')
    })
  })

  describe('variants', () => {
    it.each([
      ['secondary', 'ui-badge ui-badge--secondary'],
      ['outline', 'ui-badge ui-badge--outline'],
      ['destructive', 'ui-badge ui-badge--destructive'],
    ] as const)('emits the modifier for variant "%s"', (variant, expected) => {
      expect(badgeVariants({ variant })).toBe(expected)
    })

    it('emits no modifier for the default variant', () => {
      expect(badgeVariants({ variant: 'default' })).toBe('ui-badge')
    })

    it.each([
      ['sm', 'ui-badge ui-badge--sm'],
      ['lg', 'ui-badge ui-badge--lg'],
    ] as const)('emits the modifier for size "%s"', (size, expected) => {
      expect(badgeVariants({ size })).toBe(expected)
    })

    it('emits no modifier for the default md size', () => {
      expect(badgeVariants({ size: 'md' })).toBe('ui-badge')
    })

    it('combines variant and size modifiers', () => {
      expect(badgeVariants({ variant: 'outline', size: 'sm' })).toBe(
        'ui-badge ui-badge--outline ui-badge--sm'
      )
    })

    it('emits the truncate modifier when canTruncate is true', () => {
      expect(badgeVariants({ canTruncate: true })).toBe(
        'ui-badge ui-badge--truncate'
      )
    })

    it('emits no truncate modifier when canTruncate is false', () => {
      expect(badgeVariants({ canTruncate: false })).toBe('ui-badge')
    })
  })

  // L3 managed errors: N/A — a pure CVA resolver has no user-facing error path.

  describe('unmanaged errors', () => {
    it('falls back to defaults when variant/size/canTruncate are explicitly undefined', () => {
      expect(
        badgeVariants({
          variant: undefined,
          size: undefined,
          canTruncate: undefined,
        })
      ).toBe('ui-badge')
    })
  })

  describe('edge cases', () => {
    it('exposes the leading-icon element class', () => {
      expect(BADGE_ICON_CLASS).toBe('ui-badge__icon')
    })

    it('exposes the label element class', () => {
      expect(BADGE_LABEL_CLASS).toBe('ui-badge__label')
    })

    it('combines every axis (variant, size, truncate)', () => {
      expect(
        badgeVariants({
          variant: 'destructive',
          size: 'lg',
          canTruncate: true,
        })
      ).toBe('ui-badge ui-badge--destructive ui-badge--lg ui-badge--truncate')
    })

    it('never emits an empty-string token in the output', () => {
      const result = badgeVariants({ variant: 'default', size: 'md' })
      expect(result.split(' ')).not.toContain('')
    })
  })
})
