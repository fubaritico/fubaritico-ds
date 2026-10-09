import { describe, expect, it } from 'vitest'

import { clamp } from './math.js'

describe('clamp', () => {
  describe('happy path', () => {
    it('returns a value already inside the interval', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })
  })

  describe('variants', () => {
    it('raises a value below the interval to the lower bound', () => {
      expect(clamp(-1, 0, 10)).toBe(0)
    })

    it('lowers a value above the interval to the upper bound', () => {
      expect(clamp(11, 0, 10)).toBe(10)
    })
  })

  // L3: N/A — no managed error path, every number has a clamped result.
  // L4: N/A — NaN propagates by design (Math.min/max); callers that format output guard it.

  describe('edge cases', () => {
    it('keeps the bounds themselves', () => {
      expect(clamp(0, 0, 10)).toBe(0)
      expect(clamp(10, 0, 10)).toBe(10)
    })
  })
})
