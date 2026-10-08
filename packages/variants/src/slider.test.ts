import { describe, expect, it } from 'vitest'

import {
  SLIDER_INPUT_CLASS,
  SLIDER_PROGRESS_VAR,
  SLIDER_RANGE_CLASS,
  SLIDER_THUMB_CLASS,
  SLIDER_TRACK_CLASS,
  SLIDER_TRACK_IMAGE_VAR,
  sliderVariants,
} from './slider.js'

describe('sliderVariants', () => {
  describe('happy path', () => {
    it('returns the bare base with no args', () => {
      expect(sliderVariants()).toBe('ui-slider')
    })

    it('returns the bare base for an empty options object', () => {
      expect(sliderVariants({})).toBe('ui-slider')
    })
  })

  describe('variants', () => {
    it('emits no size modifier for the default md', () => {
      expect(sliderVariants({ size: 'md' })).toBe('ui-slider')
    })

    it.each([
      ['sm', 'ui-slider ui-slider--sm'],
      ['lg', 'ui-slider ui-slider--lg'],
    ] as const)('emits the %s size modifier', (size, expected) => {
      expect(sliderVariants({ size })).toBe(expected)
    })

    it('emits the imaged modifier, which is what hides the filled range', () => {
      expect(sliderVariants({ imaged: true })).toBe(
        'ui-slider ui-slider--imaged'
      )
    })

    it('emits the disabled modifier', () => {
      expect(sliderVariants({ disabled: true })).toBe(
        'ui-slider ui-slider--disabled'
      )
    })

    it('combines every axis', () => {
      expect(sliderVariants({ size: 'lg', imaged: true, disabled: true })).toBe(
        'ui-slider ui-slider--lg ui-slider--imaged ui-slider--disabled'
      )
    })
  })

  describe('managed errors', () => {
    it('falls back to the defaults when every axis is undefined', () => {
      expect(
        sliderVariants({
          size: undefined,
          imaged: undefined,
          disabled: undefined,
        })
      ).toBe('ui-slider')
    })
  })

  // L4: N/A — a pure string resolver has no async path and no external dependency to fail.

  describe('edge cases', () => {
    it('keeps every element class under the block namespace', () => {
      for (const className of [
        SLIDER_TRACK_CLASS,
        SLIDER_RANGE_CLASS,
        SLIDER_THUMB_CLASS,
        SLIDER_INPUT_CLASS,
      ]) {
        expect(className.startsWith('ui-slider__')).toBe(true)
      }
    })

    it('names both custom properties under the component namespace', () => {
      expect(SLIDER_PROGRESS_VAR).toBe('--ui-slider-progress')
      expect(SLIDER_TRACK_IMAGE_VAR).toBe('--ui-slider-track-image')
    })
  })
})
