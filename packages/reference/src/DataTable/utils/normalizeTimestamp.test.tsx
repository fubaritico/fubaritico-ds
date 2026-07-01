import { describe, expect, it } from 'vitest'

import { toEpochMs } from './normalizeTimestamp'

describe('toEpochMs', () => {
  describe('happy path', () => {
    it('passes a 13-digit millisecond timestamp through unchanged', () => {
      expect(toEpochMs(1719835358000)).toBe(1719835358000)
    })

    it('multiplies a 10-digit second timestamp by 1000', () => {
      expect(toEpochMs(1719835352)).toBe(1719835352000)
    })
  })

  describe('variants', () => {
    it('treats 11- and 12-digit values as milliseconds (already > 10 digits)', () => {
      expect(toEpochMs(99999999999)).toBe(99999999999) // 11 digits
      expect(toEpochMs(999999999999)).toBe(999999999999) // 12 digits
    })

    it('normalises mixed-unit values to a comparable scale', () => {
      // a seconds row and a ms row representing close instants become comparable
      const sec = toEpochMs(1719835352) // 1719835352000
      const ms = toEpochMs(1719835358000) // 1719835358000
      expect(ms).toBeGreaterThan(sec)
    })
  })

  // L3: managed errors — N/A (pure numeric function, no error path)

  describe('unmanaged errors', () => {
    it('handles a fractional seconds timestamp by truncating for the digit count', () => {
      // 1719835352.5 → truncated to 10 digits → seconds → ×1000
      expect(toEpochMs(1719835352.5)).toBe(1719835352500)
    })
  })

  describe('edge cases', () => {
    it('treats 0 as seconds (×1000 = 0)', () => {
      expect(toEpochMs(0)).toBe(0)
    })

    it('uses digit count of the absolute value for negative timestamps', () => {
      // |-1719835352| is 10 digits → seconds → ×1000
      expect(toEpochMs(-1719835352)).toBe(-1719835352000)
    })
  })
})
