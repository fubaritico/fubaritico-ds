import { describe, expect, it } from 'vitest'

import {
  TYPEAHEAD_ANCHOR_VAR,
  TYPEAHEAD_CLASS,
  TYPEAHEAD_MARK_CLASS,
  TYPEAHEAD_MENU_CLASS,
  typeaheadEmptyVariants,
} from './typeahead.js'

describe('typeaheadEmptyVariants', () => {
  describe('happy path', () => {
    it('emits the base class for the default (light) scheme', () => {
      expect(typeaheadEmptyVariants()).toBe('ui-typeahead__empty')
    })
  })

  describe('variants', () => {
    it('emits the dark modifier', () => {
      expect(typeaheadEmptyVariants({ variant: 'dark' })).toBe(
        'ui-typeahead__empty ui-typeahead__empty--dark'
      )
    })
  })

  // L3: managed errors — N/A (pure class-name resolver)

  describe('unmanaged errors', () => {
    it('falls back to defaults on an empty object', () => {
      expect(typeaheadEmptyVariants({})).toBe('ui-typeahead__empty')
    })
  })

  describe('edge cases', () => {
    it('exposes stable class and custom-property constants', () => {
      expect(TYPEAHEAD_CLASS).toBe('ui-typeahead')
      expect(TYPEAHEAD_MENU_CLASS).toBe('ui-typeahead__menu')
      expect(TYPEAHEAD_MARK_CLASS).toBe('ui-typeahead__mark')
      expect(TYPEAHEAD_ANCHOR_VAR).toBe('--ui-typeahead-anchor')
    })
  })
})
