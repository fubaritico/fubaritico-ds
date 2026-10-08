import { describe, expect, it } from 'vitest'

import { toSortableNumber } from './toSortableNumber'

describe('toSortableNumber', () => {
  describe('happy path', () => {
    it('passes a plain number through unchanged', () => {
      expect(toSortableNumber(42)).toBe(42)
    })

    it('coerces a numeric string', () => {
      expect(toSortableNumber('1234')).toBe(1234)
    })
  })

  describe('variants', () => {
    it('strips thousands separators from a formatted string', () => {
      expect(toSortableNumber('1,234')).toBe(1234)
    })

    it('strips spaces used as separators', () => {
      expect(toSortableNumber('1 234 567')).toBe(1234567)
    })

    it('strips dots, so decimals are flattened (documented behaviour)', () => {
      expect(toSortableNumber('1,234.00')).toBe(123400)
    })

    it('keeps negative numbers', () => {
      expect(toSortableNumber(-7)).toBe(-7)
    })
  })

  describe('managed errors', () => {
    it('returns 0 for a non-numeric string rather than NaN', () => {
      expect(toSortableNumber('not a number')).toBe(0)
    })

    it('returns 0 for a value that survives stripping but stays unparseable', () => {
      expect(toSortableNumber('...')).toBe(0)
    })
  })

  describe('unmanaged errors', () => {
    it('returns 0 for an object, never NaN', () => {
      expect(toSortableNumber({ a: 1 })).toBe(0)
    })

    it('returns 0 for an array that cannot be read as a number', () => {
      expect(toSortableNumber(['a', 'b'])).toBe(0)
    })
  })

  describe('edge cases', () => {
    it.each([
      ['undefined', undefined],
      ['null', null],
      ['empty string', ''],
      ['zero', 0],
      ['false', false],
    ])('returns 0 for %s', (_label, value) => {
      expect(toSortableNumber(value)).toBe(0)
    })

    it('never returns NaN, whatever the input', () => {
      const inputs: unknown[] = [NaN, Symbol.iterator.toString(), [], {}, 'x']
      for (const input of inputs) {
        expect(Number.isNaN(toSortableNumber(input))).toBe(false)
      }
    })
  })
})
