import { describe, expect, it } from 'vitest'

import { listboxItemVariants, listboxVariants } from './listbox.js'

describe('listboxVariants', () => {
  describe('happy path', () => {
    it('returns the base class with defaults when called with no args', () => {
      expect(listboxVariants()).toBe('ui-listbox')
    })

    it('returns the base class for an empty options object', () => {
      expect(listboxVariants({})).toBe('ui-listbox')
    })
  })

  describe('variants', () => {
    it('emits no modifier for the default light variant', () => {
      expect(listboxVariants({ variant: 'light' })).toBe('ui-listbox')
    })

    it('emits the dark modifier', () => {
      expect(listboxVariants({ variant: 'dark' })).toBe(
        'ui-listbox ui-listbox--dark'
      )
    })
  })

  // L3 managed errors: N/A — a pure CVA resolver has no user-facing error path.

  describe('unmanaged errors', () => {
    it('falls back to the default when variant is explicitly undefined', () => {
      expect(listboxVariants({ variant: undefined })).toBe('ui-listbox')
    })
  })

  describe('edge cases', () => {
    it('never emits an empty-string token', () => {
      expect(listboxVariants({ variant: 'light' }).split(' ')).not.toContain('')
    })
  })
})

describe('listboxItemVariants', () => {
  describe('happy path', () => {
    it('returns the base class with defaults when called with no args', () => {
      expect(listboxItemVariants()).toBe('ui-listbox__item')
    })
  })

  describe('variants', () => {
    it.each([
      ['active', 'ui-listbox__item ui-listbox__item--active'],
      ['selected', 'ui-listbox__item ui-listbox__item--selected'],
    ] as const)('emits the modifier for state "%s"', (state, expected) => {
      expect(listboxItemVariants({ state })).toBe(expected)
    })

    it('emits no modifier for the default state', () => {
      expect(listboxItemVariants({ state: 'default' })).toBe('ui-listbox__item')
    })

    it('emits the disabled modifier', () => {
      expect(listboxItemVariants({ disabled: true })).toBe(
        'ui-listbox__item ui-listbox__item--disabled'
      )
    })

    it('emits the dark modifier', () => {
      expect(listboxItemVariants({ variant: 'dark' })).toBe(
        'ui-listbox__item ui-listbox__item--dark'
      )
    })

    it('combines every axis (dark + active + disabled)', () => {
      expect(
        listboxItemVariants({
          variant: 'dark',
          state: 'active',
          disabled: true,
        })
      ).toBe(
        'ui-listbox__item ui-listbox__item--dark ui-listbox__item--active ui-listbox__item--disabled'
      )
    })
  })

  // L3 managed errors: N/A — pure CVA resolver, no error path.

  describe('unmanaged errors', () => {
    it('falls back to defaults when every axis is explicitly undefined', () => {
      expect(
        listboxItemVariants({
          variant: undefined,
          state: undefined,
          disabled: undefined,
        })
      ).toBe('ui-listbox__item')
    })
  })

  describe('edge cases', () => {
    it('never emits an empty-string token for the default combination', () => {
      expect(
        listboxItemVariants({
          variant: 'light',
          state: 'default',
          disabled: false,
        }).split(' ')
      ).not.toContain('')
    })
  })
})
