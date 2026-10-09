import { describe, expect, it } from 'vitest'

import {
  COLOR_FIELD_CLASS,
  COLOR_FIELD_CONTROL_CLASS,
  COLOR_FIELD_LABEL_CLASS,
  COLOR_FIELD_PANEL_CLASS,
  COLOR_FIELD_TRIGGER_CLASS,
} from './color-field.js'

describe('color field class names', () => {
  describe('happy path', () => {
    it('names the block', () => {
      expect(COLOR_FIELD_CLASS).toBe('ui-color-field')
    })
  })

  describe('variants', () => {
    it('keeps every element in the block namespace (skin parity)', () => {
      for (const name of [
        COLOR_FIELD_LABEL_CLASS,
        COLOR_FIELD_CONTROL_CLASS,
        COLOR_FIELD_TRIGGER_CLASS,
        COLOR_FIELD_PANEL_CLASS,
      ]) {
        expect(name).toMatch(/^ui-color-field__[a-z]+$/)
      }
    })
  })

  // L3 / L4: N/A — constants.

  describe('edge cases', () => {
    it('gives every element a distinct name', () => {
      const names = [
        COLOR_FIELD_LABEL_CLASS,
        COLOR_FIELD_CONTROL_CLASS,
        COLOR_FIELD_TRIGGER_CLASS,
        COLOR_FIELD_PANEL_CLASS,
      ]
      expect(new Set(names).size).toBe(names.length)
    })
  })
})
