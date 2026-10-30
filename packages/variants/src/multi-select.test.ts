import { describe, expect, it } from 'vitest'

import {
  MULTI_SELECT_ANCHOR_VAR,
  MULTI_SELECT_CHECK_CLASS,
  MULTI_SELECT_CONTROL_CLASS,
  MULTI_SELECT_EMPTY_CLASS,
  MULTI_SELECT_INPUT_CLASS,
  MULTI_SELECT_LIVE_CLASS,
  MULTI_SELECT_MARK_CLASS,
  MULTI_SELECT_MENU_CLASS,
  MULTI_SELECT_OPTION_CLASS,
  multiSelectVariants,
} from './multi-select.js'

describe('multiSelectVariants', () => {
  describe('happy path', () => {
    it('emits the base class for the defaults (light, md)', () => {
      expect(multiSelectVariants()).toBe('ui-multi-select')
    })
  })

  describe('variants', () => {
    it('emits the dark modifier', () => {
      expect(multiSelectVariants({ variant: 'dark' })).toBe(
        'ui-multi-select ui-multi-select--dark'
      )
    })

    it.each([
      ['sm', 'ui-multi-select ui-multi-select--sm'],
      ['md', 'ui-multi-select'],
      ['lg', 'ui-multi-select ui-multi-select--lg'],
    ] as const)('emits the size modifier for "%s"', (size, expected) => {
      expect(multiSelectVariants({ size })).toBe(expected)
    })

    it('emits the invalid and disabled modifiers', () => {
      expect(multiSelectVariants({ invalid: true })).toBe(
        'ui-multi-select ui-multi-select--invalid'
      )
      expect(multiSelectVariants({ disabled: true })).toBe(
        'ui-multi-select ui-multi-select--disabled'
      )
    })
  })

  // L3: managed errors — N/A (pure class-name resolver)

  describe('unmanaged errors', () => {
    it('falls back to defaults on an empty object', () => {
      expect(multiSelectVariants({})).toBe('ui-multi-select')
    })
  })

  describe('edge cases', () => {
    it('combines every axis', () => {
      expect(
        multiSelectVariants({
          variant: 'dark',
          size: 'lg',
          invalid: true,
          disabled: true,
        })
      ).toBe(
        'ui-multi-select ui-multi-select--dark ui-multi-select--lg ui-multi-select--invalid ui-multi-select--disabled'
      )
    })

    it('exposes stable element classes and the anchor property', () => {
      expect(MULTI_SELECT_CONTROL_CLASS).toBe('ui-multi-select__control')
      expect(MULTI_SELECT_INPUT_CLASS).toBe('ui-multi-select__input')
      expect(MULTI_SELECT_MENU_CLASS).toBe('ui-multi-select__menu')
      expect(MULTI_SELECT_OPTION_CLASS).toBe('ui-multi-select__option')
      expect(MULTI_SELECT_CHECK_CLASS).toBe('ui-multi-select__check')
      expect(MULTI_SELECT_EMPTY_CLASS).toBe('ui-multi-select__empty')
      expect(MULTI_SELECT_MARK_CLASS).toBe('ui-multi-select__mark')
      expect(MULTI_SELECT_LIVE_CLASS).toBe('ui-multi-select__live')
      expect(MULTI_SELECT_ANCHOR_VAR).toBe('--ui-multi-select-anchor')
    })
  })
})
