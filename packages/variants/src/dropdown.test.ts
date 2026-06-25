import { describe, expect, it } from 'vitest'

import {
  DROPDOWN_CLASS,
  DROPDOWN_CONTROL_CLASS,
  DROPDOWN_DIVIDER_CLASS,
  DROPDOWN_DOT_CLASS,
  DROPDOWN_ITEM_CLASS,
  DROPDOWN_ITEM_DESTRUCTIVE_CLASS,
  DROPDOWN_TRIGGER_CONTENT_CLASS,
  dropdownCaretVariants,
  dropdownMenuVariants,
} from './dropdown.js'

describe('dropdownMenuVariants', () => {
  describe('happy path', () => {
    it('emits the base menu class with default placement', () => {
      expect(dropdownMenuVariants()).toBe('ui-dropdown__menu')
    })
  })

  describe('variants', () => {
    it('emits the flipped modifier', () => {
      expect(dropdownMenuVariants({ flipped: true })).toBe(
        'ui-dropdown__menu ui-dropdown__menu--flipped'
      )
    })

    it('emits the right-align modifier', () => {
      expect(dropdownMenuVariants({ align: 'right' })).toBe(
        'ui-dropdown__menu ui-dropdown__menu--right'
      )
    })

    it('combines flipped and right-align', () => {
      expect(dropdownMenuVariants({ flipped: true, align: 'right' })).toBe(
        'ui-dropdown__menu ui-dropdown__menu--flipped ui-dropdown__menu--right'
      )
    })

    it('emits no modifier for the left (base) alignment', () => {
      expect(dropdownMenuVariants({ align: 'left' })).toBe('ui-dropdown__menu')
    })
  })

  // L3: managed errors — N/A (pure class-name resolver)

  describe('unmanaged errors', () => {
    it('falls back to defaults on an empty object', () => {
      expect(dropdownMenuVariants({})).toBe('ui-dropdown__menu')
    })
  })

  describe('edge cases', () => {
    it('always prefixes the base menu class', () => {
      expect(
        dropdownMenuVariants({ flipped: true }).startsWith('ui-dropdown__menu ')
      ).toBe(true)
    })
  })
})

describe('dropdownCaretVariants', () => {
  describe('happy path', () => {
    it('emits the base caret class when closed (default)', () => {
      expect(dropdownCaretVariants()).toBe('ui-dropdown__caret')
    })
  })

  describe('variants', () => {
    it('emits the open modifier (rotation)', () => {
      expect(dropdownCaretVariants({ open: true })).toBe(
        'ui-dropdown__caret ui-dropdown__caret--open'
      )
    })
  })

  // L3: managed errors — N/A

  describe('unmanaged errors', () => {
    it('falls back to closed on an empty object', () => {
      expect(dropdownCaretVariants({})).toBe('ui-dropdown__caret')
    })
  })

  describe('edge cases', () => {
    it('exposes stable BEM element class constants', () => {
      expect(DROPDOWN_CLASS).toBe('ui-dropdown')
      expect(DROPDOWN_CONTROL_CLASS).toBe('ui-dropdown__control')
      expect(DROPDOWN_TRIGGER_CONTENT_CLASS).toBe(
        'ui-dropdown__trigger-content'
      )
      expect(DROPDOWN_ITEM_CLASS).toBe('ui-dropdown__item')
      expect(DROPDOWN_DOT_CLASS).toBe('ui-dropdown__dot')
      expect(DROPDOWN_DIVIDER_CLASS).toBe('ui-dropdown__divider')
      expect(DROPDOWN_ITEM_DESTRUCTIVE_CLASS).toBe(
        'ui-dropdown__item--destructive'
      )
    })
  })
})
