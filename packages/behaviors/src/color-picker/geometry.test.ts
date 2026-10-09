import { describe, expect, it } from 'vitest'

import { pointFromRect } from './geometry.js'

const RECT = { left: 100, top: 50, width: 200, height: 100 }

describe('pointFromRect', () => {
  describe('happy path', () => {
    it('turns a pointer position into fractions of the surface', () => {
      expect(pointFromRect(150, 75, RECT)).toEqual({ x: 0.25, y: 0.25 })
    })
  })

  describe('variants', () => {
    it.each([
      [100, 50, { x: 0, y: 0 }],
      [300, 150, { x: 1, y: 1 }],
      [200, 100, { x: 0.5, y: 0.5 }],
    ])('maps (%d, %d) to %o', (x, y, expected) => {
      expect(pointFromRect(x, y, RECT)).toEqual(expected)
    })

    it('measures x from the inline-start edge — the right edge in rtl', () => {
      expect(pointFromRect(150, 75, RECT, 'rtl')).toEqual({ x: 0.75, y: 0.25 })
      expect(pointFromRect(300, 75, RECT, 'rtl').x).toBe(0)
    })
  })

  describe('managed errors', () => {
    it.each([
      { ...RECT, width: 0 },
      { ...RECT, height: 0 },
      { ...RECT, width: -10 },
      { ...RECT, width: Number.NaN },
    ])('refuses a surface with no size (%o)', (rect) => {
      expect(() => pointFromRect(150, 75, rect)).toThrow(RangeError)
    })
  })

  describe('unmanaged errors', () => {
    it.each([
      [Number.NaN, 75],
      [150, Infinity],
    ])('refuses a non-finite pointer position (%s, %s)', (x, y) => {
      expect(() => pointFromRect(x, y, RECT)).toThrow(RangeError)
    })
  })

  describe('edge cases', () => {
    it('clamps a pointer dragged outside the surface onto its border', () => {
      expect(pointFromRect(-500, 9999, RECT)).toEqual({ x: 0, y: 1 })
      expect(pointFromRect(9999, -500, RECT)).toEqual({ x: 1, y: 0 })
    })

    it('clamps before mirroring in rtl', () => {
      expect(pointFromRect(-500, 75, RECT, 'rtl').x).toBe(1)
      expect(pointFromRect(9999, 75, RECT, 'rtl').x).toBe(0)
    })

    it('handles a one-pixel surface', () => {
      expect(
        pointFromRect(100.5, 50.5, { left: 100, top: 50, width: 1, height: 1 })
      ).toEqual({
        x: 0.5,
        y: 0.5,
      })
    })
  })
})
