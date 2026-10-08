import { describe, expect, it } from 'vitest'

import {
  PROGRESS_BAR_INDICATOR_CLASS,
  PROGRESS_BAR_META_CLASS,
  PROGRESS_BAR_META_END_CLASS,
  PROGRESS_BAR_META_START_CLASS,
  PROGRESS_BAR_TRACK_CLASS,
  PROGRESS_BAR_VALUE_VAR,
  progressBarVariants,
} from './progress-bar.js'

describe('progressBarVariants', () => {
  describe('happy path', () => {
    it('returns the bare base with no args', () => {
      expect(progressBarVariants()).toBe('ui-progress-bar')
    })

    it('returns the bare base for an empty options object', () => {
      expect(progressBarVariants({})).toBe('ui-progress-bar')
    })
  })

  describe('variants', () => {
    it('emits no colour modifier for the default variant', () => {
      expect(progressBarVariants({ variant: 'default' })).toBe(
        'ui-progress-bar'
      )
    })

    it.each([
      ['success', 'ui-progress-bar ui-progress-bar--success'],
      ['destructive', 'ui-progress-bar ui-progress-bar--destructive'],
    ] as const)('emits the %s colour modifier', (variant, expected) => {
      expect(progressBarVariants({ variant })).toBe(expected)
    })

    it('emits no size modifier for md (the base size)', () => {
      expect(progressBarVariants({ size: 'md' })).toBe('ui-progress-bar')
    })

    it.each([
      ['sm', 'ui-progress-bar ui-progress-bar--sm'],
      ['lg', 'ui-progress-bar ui-progress-bar--lg'],
    ] as const)('emits the %s size modifier', (size, expected) => {
      expect(progressBarVariants({ size })).toBe(expected)
    })

    it('combines a colour and a size modifier', () => {
      expect(progressBarVariants({ variant: 'destructive', size: 'lg' })).toBe(
        'ui-progress-bar ui-progress-bar--destructive ui-progress-bar--lg'
      )
    })
  })

  describe('managed errors', () => {
    it('falls back to the defaults when both axes are undefined', () => {
      expect(progressBarVariants({ variant: undefined, size: undefined })).toBe(
        'ui-progress-bar'
      )
    })
  })

  // L4: N/A — a pure string resolver has no async path and no external dependency to fail.

  describe('edge cases', () => {
    it('never emits a modifier for the base-on-both-axes combination', () => {
      expect(progressBarVariants({ variant: 'default', size: 'md' })).toBe(
        'ui-progress-bar'
      )
    })

    it('exposes element classes that stay under the block namespace', () => {
      for (const className of [
        PROGRESS_BAR_TRACK_CLASS,
        PROGRESS_BAR_INDICATOR_CLASS,
        PROGRESS_BAR_META_CLASS,
        PROGRESS_BAR_META_START_CLASS,
        PROGRESS_BAR_META_END_CLASS,
      ]) {
        expect(className.startsWith('ui-progress-bar__')).toBe(true)
      }
    })

    it('names the fill custom property under the component namespace', () => {
      expect(PROGRESS_BAR_VALUE_VAR).toBe('--ui-progress-bar-value')
    })
  })
})
