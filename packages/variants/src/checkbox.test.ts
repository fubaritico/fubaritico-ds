import { describe, expect, it } from 'vitest'

import {
  CHECKBOX_BOX_CLASS,
  CHECKBOX_FIELD_CLASS,
  CHECKBOX_ICON_CLASS,
  CHECKBOX_INPUT_CLASS,
  CHECKBOX_LABEL_CLASS,
  CHECKBOX_MESSAGE_CLASS,
  CHECKBOX_MESSAGE_ERROR_CLASS,
  checkboxVariants,
} from './checkbox.js'

describe('checkboxVariants', () => {
  describe('happy path', () => {
    it('emits the base block class with default props', () => {
      // md (default) emits no size modifier; invalid defaults to false (no modifier)
      expect(checkboxVariants()).toBe('ui-checkbox')
    })
  })

  describe('variants', () => {
    it('emits the sm size modifier', () => {
      expect(checkboxVariants({ size: 'sm' })).toBe(
        'ui-checkbox ui-checkbox--sm'
      )
    })

    it('emits no modifier for the md (base) size', () => {
      expect(checkboxVariants({ size: 'md' })).toBe('ui-checkbox')
    })

    it('emits the invalid modifier when in error', () => {
      expect(checkboxVariants({ invalid: true })).toBe(
        'ui-checkbox ui-checkbox--invalid'
      )
    })

    it('emits no invalid modifier when valid', () => {
      expect(checkboxVariants({ invalid: false })).toBe('ui-checkbox')
    })

    it('combines size and invalid', () => {
      expect(checkboxVariants({ size: 'sm', invalid: true })).toBe(
        'ui-checkbox ui-checkbox--sm ui-checkbox--invalid'
      )
    })
  })

  // L3: managed errors — N/A (pure class-name resolver, no runtime error path)

  describe('unmanaged errors', () => {
    it('falls back to defaults when called with an empty object', () => {
      expect(checkboxVariants({})).toBe('ui-checkbox')
    })

    it('ignores undefined axis values (CVA defaults apply)', () => {
      expect(checkboxVariants({ size: undefined, invalid: undefined })).toBe(
        'ui-checkbox'
      )
    })
  })

  describe('edge cases', () => {
    it('exposes stable BEM element class constants', () => {
      expect(CHECKBOX_FIELD_CLASS).toBe('ui-checkbox-field')
      expect(CHECKBOX_INPUT_CLASS).toBe('ui-checkbox__input')
      expect(CHECKBOX_BOX_CLASS).toBe('ui-checkbox__box')
      expect(CHECKBOX_ICON_CLASS).toBe('ui-checkbox__icon')
      expect(CHECKBOX_LABEL_CLASS).toBe('ui-checkbox__label')
    })

    it('reuses the generic field message classes for the error', () => {
      expect(CHECKBOX_MESSAGE_CLASS).toBe('ui-field__message')
      expect(CHECKBOX_MESSAGE_ERROR_CLASS).toBe('ui-field__message--error')
    })
  })
})
