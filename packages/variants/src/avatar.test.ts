import { describe, expect, it } from 'vitest'

import {
  AVATAR_ICON_CLASS,
  AVATAR_IMAGE_CLASS,
  AVATAR_INITIALS_CLASS,
  avatarVariants,
} from './avatar.js'

describe('avatarVariants', () => {
  describe('happy path', () => {
    it('returns the base class with the default size when called with no args', () => {
      expect(avatarVariants()).toBe('ui-avatar')
    })

    it('returns the base class when called with an empty options object', () => {
      expect(avatarVariants({})).toBe('ui-avatar')
    })
  })

  describe('variants', () => {
    it.each([
      ['xs', 'ui-avatar ui-avatar--xs'],
      ['sm', 'ui-avatar ui-avatar--sm'],
      ['lg', 'ui-avatar ui-avatar--lg'],
      ['xl', 'ui-avatar ui-avatar--xl'],
      ['2xl', 'ui-avatar ui-avatar--2xl'],
      ['3xl', 'ui-avatar ui-avatar--3xl'],
    ] as const)('emits the modifier for size "%s"', (size, expected) => {
      expect(avatarVariants({ size })).toBe(expected)
    })

    it('emits no modifier for the default md size', () => {
      expect(avatarVariants({ size: 'md' })).toBe('ui-avatar')
    })
  })

  // L3 managed errors: N/A — a pure CVA resolver has no user-facing error path.

  describe('unmanaged errors', () => {
    it('falls back to the default when size is explicitly undefined', () => {
      expect(avatarVariants({ size: undefined })).toBe('ui-avatar')
    })
  })

  describe('edge cases', () => {
    it('never emits an empty-string token in the output', () => {
      const result = avatarVariants({ size: 'md' })
      expect(result.split(' ')).not.toContain('')
    })

    it('exposes stable BEM element class names', () => {
      expect(AVATAR_IMAGE_CLASS).toBe('ui-avatar__image')
      expect(AVATAR_INITIALS_CLASS).toBe('ui-avatar__initials')
      expect(AVATAR_ICON_CLASS).toBe('ui-avatar__icon')
    })
  })
})
