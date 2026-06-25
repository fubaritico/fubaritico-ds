import { describe, expect, it } from 'vitest'

import { tooltipArrowVariants, tooltipVariants } from './tooltip.js'

describe('tooltipVariants', () => {
  describe('happy path', () => {
    it('emits the base block class with default props', () => {
      // dark (default) emits no modifier
      expect(tooltipVariants()).toBe('ui-tooltip')
    })
  })

  describe('variants', () => {
    it('emits no modifier for the dark (base) variant', () => {
      expect(tooltipVariants({ variant: 'dark' })).toBe('ui-tooltip')
    })

    it('emits the light modifier', () => {
      expect(tooltipVariants({ variant: 'light' })).toBe(
        'ui-tooltip ui-tooltip--light'
      )
    })
  })

  // L3: managed errors — N/A (pure class-name resolver)

  describe('unmanaged errors', () => {
    it('falls back to the default variant on an empty object', () => {
      expect(tooltipVariants({})).toBe('ui-tooltip')
    })

    it('ignores an undefined variant', () => {
      expect(tooltipVariants({ variant: undefined })).toBe('ui-tooltip')
    })
  })

  describe('edge cases', () => {
    it('keeps the base class first (override-friendly ordering)', () => {
      expect(
        tooltipVariants({ variant: 'light' }).startsWith('ui-tooltip ')
      ).toBe(true)
    })
  })
})

describe('tooltipArrowVariants', () => {
  describe('happy path', () => {
    it('defaults to the bottom axis', () => {
      expect(tooltipArrowVariants()).toBe(
        'ui-tooltip__arrow ui-tooltip__arrow--bottom'
      )
    })
  })

  describe('variants', () => {
    it.each([
      ['top', 'ui-tooltip__arrow ui-tooltip__arrow--top'],
      ['bottom', 'ui-tooltip__arrow ui-tooltip__arrow--bottom'],
      ['left', 'ui-tooltip__arrow ui-tooltip__arrow--left'],
      ['right', 'ui-tooltip__arrow ui-tooltip__arrow--right'],
    ] as const)('emits the %s axis modifier', (axis, expected) => {
      expect(tooltipArrowVariants({ axis })).toBe(expected)
    })
  })

  // L3: managed errors — N/A (pure class-name resolver)

  describe('unmanaged errors', () => {
    it('falls back to the bottom axis on an empty object', () => {
      expect(tooltipArrowVariants({})).toBe(
        'ui-tooltip__arrow ui-tooltip__arrow--bottom'
      )
    })
  })

  describe('edge cases', () => {
    it('always prefixes the base arrow class', () => {
      expect(
        tooltipArrowVariants({ axis: 'left' }).startsWith('ui-tooltip__arrow ')
      ).toBe(true)
    })
  })
})
