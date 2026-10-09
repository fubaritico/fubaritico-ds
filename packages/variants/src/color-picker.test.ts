import { describe, expect, it } from 'vitest'

import {
  COLOR_PICKER_AREA_CLASS,
  COLOR_PICKER_AREA_INPUT_CLASS,
  COLOR_PICKER_AREA_THUMB_CLASS,
  COLOR_PICKER_CHECKERBOARD_VAR,
  COLOR_PICKER_COLOR_VAR,
  COLOR_PICKER_HEX_CLASS,
  COLOR_PICKER_HEX_ERROR_CLASS,
  COLOR_PICKER_HEX_FIELD_CLASS,
  COLOR_PICKER_HUE_VAR,
  COLOR_PICKER_ROW_CLASS,
  COLOR_PICKER_STATUS_CLASS,
  COLOR_PICKER_TRACK_CLASS,
  COLOR_PICKER_TRACK_IMAGE_VAR,
  COLOR_PICKER_X_VAR,
  COLOR_PICKER_Y_VAR,
  colorPickerSwatchVariants,
  colorPickerTrackVariants,
  colorPickerVariants,
} from './color-picker.js'

describe('colorPickerVariants', () => {
  describe('happy path', () => {
    it('returns the bare base with no args', () => {
      expect(colorPickerVariants()).toBe('ui-color-picker')
    })
  })

  describe('variants', () => {
    it('adds the disabled modifier', () => {
      expect(colorPickerVariants({ disabled: true })).toBe(
        'ui-color-picker ui-color-picker--disabled'
      )
      expect(colorPickerVariants({ disabled: false })).toBe('ui-color-picker')
    })

    it('adds the compact modifier, and nothing for the default density', () => {
      expect(colorPickerVariants({ density: 'compact' })).toBe(
        'ui-color-picker ui-color-picker--compact'
      )
      expect(colorPickerVariants({ density: 'default' })).toBe(
        'ui-color-picker'
      )
      expect(colorPickerVariants({ density: 'compact', disabled: true })).toBe(
        'ui-color-picker ui-color-picker--compact ui-color-picker--disabled'
      )
    })
  })

  // L3: N/A — a pure string resolver has no error path.

  describe('unmanaged errors', () => {
    it('falls back to the default for an undefined axis', () => {
      expect(colorPickerVariants({ disabled: undefined })).toBe(
        'ui-color-picker'
      )
    })
  })

  describe('edge cases', () => {
    it('keeps the element classes and vars in the block namespace (skin parity)', () => {
      for (const name of [
        COLOR_PICKER_AREA_CLASS,
        COLOR_PICKER_AREA_THUMB_CLASS,
        COLOR_PICKER_AREA_INPUT_CLASS,
        COLOR_PICKER_TRACK_CLASS,
        COLOR_PICKER_ROW_CLASS,
        COLOR_PICKER_HEX_CLASS,
        COLOR_PICKER_HEX_FIELD_CLASS,
        COLOR_PICKER_HEX_ERROR_CLASS,
        COLOR_PICKER_STATUS_CLASS,
      ]) {
        expect(name).toMatch(/^ui-color-picker__[a-z-]+$/)
      }
      for (const name of [
        COLOR_PICKER_HUE_VAR,
        COLOR_PICKER_COLOR_VAR,
        COLOR_PICKER_X_VAR,
        COLOR_PICKER_Y_VAR,
        COLOR_PICKER_CHECKERBOARD_VAR,
        COLOR_PICKER_TRACK_IMAGE_VAR,
      ]) {
        expect(name).toMatch(/^--ui-color-picker-[a-z-]+$/)
      }
    })
  })
})

describe('colorPickerSwatchVariants', () => {
  describe('happy path', () => {
    it('returns the swatch element class', () => {
      expect(colorPickerSwatchVariants()).toBe('ui-color-picker__swatch')
    })
  })

  describe('variants', () => {
    it('adds the automatic modifier', () => {
      expect(colorPickerSwatchVariants({ auto: true })).toBe(
        'ui-color-picker__swatch ui-color-picker__swatch--auto'
      )
    })
  })

  // L3 / L4: N/A — pure string resolver.

  describe('edge cases', () => {
    it('emits no modifier for auto: false', () => {
      expect(colorPickerSwatchVariants({ auto: false })).toBe(
        'ui-color-picker__swatch'
      )
    })
  })
})

describe('colorPickerTrackVariants', () => {
  describe('happy path', () => {
    it('defaults to the hue track', () => {
      expect(colorPickerTrackVariants()).toBe(
        'ui-color-picker__track ui-color-picker__track--hue'
      )
    })
  })

  describe('variants', () => {
    it('emits the alpha modifier', () => {
      expect(colorPickerTrackVariants({ channel: 'alpha' })).toBe(
        'ui-color-picker__track ui-color-picker__track--alpha'
      )
    })
  })

  // L3 / L4: N/A — pure string resolver.

  describe('edge cases', () => {
    it('falls back to hue for an undefined channel', () => {
      expect(colorPickerTrackVariants({ channel: undefined })).toContain(
        '--hue'
      )
    })
  })
})
