import { describe, expect, it } from 'vitest'

import {
  INPUT_ICON_CLASS,
  INPUT_LABEL_CLASS,
  INPUT_MESSAGE_CLASS,
  INPUT_MESSAGE_ERROR_CLASS,
  inputAffixVariants,
  inputFieldVariants,
  inputVariants,
} from './input.js'

describe('inputVariants', () => {
  describe('happy path', () => {
    it('returns the base class with defaults when called with no args', () => {
      expect(inputVariants()).toBe('ui-input')
    })

    it('returns the base class when called with an empty options object', () => {
      expect(inputVariants({})).toBe('ui-input')
    })
  })

  describe('variants', () => {
    it.each([
      ['sm', 'ui-input ui-input--sm'],
      ['lg', 'ui-input ui-input--lg'],
    ] as const)('emits the size modifier for "%s"', (size, expected) => {
      expect(inputVariants({ size })).toBe(expected)
    })

    it('emits no size modifier for the default md', () => {
      expect(inputVariants({ size: 'md' })).toBe('ui-input')
    })

    it('emits the invalid modifier when invalid=true', () => {
      expect(inputVariants({ invalid: true })).toBe(
        'ui-input ui-input--invalid'
      )
    })

    it('emits the has-icon modifier when hasIcon=true', () => {
      expect(inputVariants({ hasIcon: true })).toBe(
        'ui-input ui-input--has-icon'
      )
    })

    it('composes size + invalid + has-icon together', () => {
      expect(inputVariants({ size: 'lg', invalid: true, hasIcon: true })).toBe(
        'ui-input ui-input--lg ui-input--invalid ui-input--has-icon'
      )
    })
  })

  // L3 managed errors: N/A — a pure CVA resolver has no user-facing error path.

  describe('unmanaged errors', () => {
    it('falls back to defaults when every option is explicitly undefined', () => {
      expect(
        inputVariants({
          size: undefined,
          invalid: undefined,
          hasIcon: undefined,
        })
      ).toBe('ui-input')
    })
  })

  describe('edge cases', () => {
    it('emits no modifier when invalid/hasIcon are false', () => {
      expect(inputVariants({ invalid: false, hasIcon: false })).toBe('ui-input')
    })

    it('never emits an empty-string token in the output', () => {
      expect(inputVariants({ size: 'md' }).split(' ')).not.toContain('')
    })
  })
})

describe('inputAffixVariants', () => {
  describe('happy path', () => {
    it('returns the base class with defaults', () => {
      expect(inputAffixVariants()).toBe('ui-input-affix')
    })
  })

  describe('variants', () => {
    it.each([
      ['sm', 'ui-input-affix ui-input-affix--sm'],
      ['lg', 'ui-input-affix ui-input-affix--lg'],
    ] as const)('emits the size modifier for "%s"', (size, expected) => {
      expect(inputAffixVariants({ size })).toBe(expected)
    })

    it('emits no size modifier for the default md', () => {
      expect(inputAffixVariants({ size: 'md' })).toBe('ui-input-affix')
    })
  })

  describe('edge cases', () => {
    it('never emits an empty-string token in the output', () => {
      expect(inputAffixVariants({ size: 'md' }).split(' ')).not.toContain('')
    })
  })
})

describe('inputFieldVariants', () => {
  describe('happy path', () => {
    it('returns the base class with defaults', () => {
      expect(inputFieldVariants()).toBe('ui-field')
    })
  })

  describe('variants', () => {
    it.each([
      ['sm', 'ui-field ui-field--sm'],
      ['lg', 'ui-field ui-field--lg'],
    ] as const)('emits the size modifier for "%s"', (size, expected) => {
      expect(inputFieldVariants({ size })).toBe(expected)
    })

    it('emits no size modifier for the default md', () => {
      expect(inputFieldVariants({ size: 'md' })).toBe('ui-field')
    })
  })

  describe('edge cases', () => {
    it('never emits an empty-string token in the output', () => {
      expect(inputFieldVariants({ size: 'md' }).split(' ')).not.toContain('')
    })
  })
})

describe('input element class constants', () => {
  it('expose the static BEM element/modifier names', () => {
    expect(INPUT_ICON_CLASS).toBe('ui-input-affix__icon')
    expect(INPUT_LABEL_CLASS).toBe('ui-field__label')
    expect(INPUT_MESSAGE_CLASS).toBe('ui-field__message')
    expect(INPUT_MESSAGE_ERROR_CLASS).toBe('ui-field__message--error')
  })
})
