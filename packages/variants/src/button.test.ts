import { describe, expect, it } from 'vitest'

import { buttonVariants } from './button.js'

describe('buttonVariants', () => {
  describe('happy path', () => {
    it('returns the base class with defaults when called with no args', () => {
      expect(buttonVariants()).toBe('ui-button')
    })

    it('returns the base class for an empty options object', () => {
      expect(buttonVariants({})).toBe('ui-button')
    })
  })

  describe('variants', () => {
    it('emits no modifier for the default primary variant', () => {
      expect(buttonVariants({ variant: 'primary' })).toBe('ui-button')
    })

    it.each([
      ['secondary', 'ui-button ui-button--secondary'],
      ['destructive', 'ui-button ui-button--destructive'],
      ['outline', 'ui-button ui-button--outline'],
      ['ghost', 'ui-button ui-button--ghost'],
    ] as const)('emits the modifier for variant "%s"', (variant, expected) => {
      expect(buttonVariants({ variant })).toBe(expected)
    })

    it.each([
      ['sm', 'ui-button ui-button--sm'],
      ['lg', 'ui-button ui-button--lg'],
    ] as const)('emits the modifier for size "%s"', (size, expected) => {
      expect(buttonVariants({ size })).toBe(expected)
    })

    it('emits no modifier for the default md size', () => {
      expect(buttonVariants({ size: 'md' })).toBe('ui-button')
    })

    it('emits the icon-right modifier for iconPosition "right"', () => {
      expect(buttonVariants({ iconPosition: 'right' })).toBe(
        'ui-button ui-button--icon-right'
      )
    })

    it('emits no modifier for the default left iconPosition', () => {
      expect(buttonVariants({ iconPosition: 'left' })).toBe('ui-button')
    })

    it('combines variant, size and icon-position modifiers', () => {
      expect(
        buttonVariants({
          variant: 'outline',
          size: 'lg',
          iconPosition: 'right',
        })
      ).toBe('ui-button ui-button--outline ui-button--lg ui-button--icon-right')
    })
  })

  // L3 managed errors: N/A — a pure CVA resolver has no user-facing error path.

  describe('unmanaged errors', () => {
    it('falls back to defaults when all props are explicitly undefined', () => {
      expect(
        buttonVariants({
          variant: undefined,
          size: undefined,
          iconPosition: undefined,
        })
      ).toBe('ui-button')
    })
  })

  describe('edge cases', () => {
    it('never emits an empty-string token in the output', () => {
      const result = buttonVariants({
        variant: 'primary',
        size: 'md',
        iconPosition: 'left',
      })
      expect(result.split(' ')).not.toContain('')
    })
  })
})
