import { describe, expect, it } from 'vitest'

import { describeColor, hueName } from './describe.js'

import type { HsvaColor } from './color/types.js'

/** An opaque HSVA colour. */
const hsv = (h: number, s: number, v: number): HsvaColor => ({ h, s, v, a: 1 })

describe('describeColor', () => {
  describe('happy path', () => {
    it('names a vivid primary', () => {
      expect(describeColor(hsv(0, 100, 100))).toBe('vivid red')
      expect(describeColor(hsv(240, 100, 100))).toBe('vivid blue')
    })
  })

  describe('variants', () => {
    it.each([
      [hsv(0, 0, 0), 'black'],
      [hsv(0, 0, 100), 'white'],
      [hsv(0, 0, 50), 'gray'],
      [hsv(0, 0, 20), 'dark gray'],
      [hsv(0, 0, 85), 'light gray'],
      [hsv(0, 100, 50), 'dark red'],
      [hsv(0, 100, 25), 'very dark red'],
      [hsv(0, 30, 100), 'light red'],
      [hsv(0, 10, 100), 'very light red'],
      [hsv(210, 30, 60), 'grayish blue'],
      [hsv(30, 100, 100), 'vivid orange'],
      [hsv(60, 100, 100), 'vivid yellow'],
      [hsv(120, 100, 100), 'vivid green'],
      [hsv(180, 100, 100), 'vivid cyan'],
      [hsv(275, 100, 100), 'vivid purple'],
      [hsv(320, 100, 100), 'vivid pink'],
    ])('describes %o as "%s"', (color, words) => {
      expect(describeColor(color)).toBe(words)
    })

    it('appends the opacity of a translucent colour', () => {
      expect(describeColor({ h: 0, s: 100, v: 100, a: 0.5 })).toBe(
        'vivid red, 50% opacity'
      )
    })
  })

  // L3: N/A — every colour has a description.
  // L4: N/A — inputs are typed HSVA; out-of-range hues are covered as edge cases.

  describe('edge cases', () => {
    it('ignores the hue of a gray (a picker keeps one, the words must not show it)', () => {
      expect(describeColor(hsv(210, 0, 50))).toBe('gray')
    })

    it('treats a fully transparent colour as 0% opacity', () => {
      expect(describeColor({ h: 0, s: 0, v: 0, a: 0 })).toBe(
        'black, 0% opacity'
      )
    })
  })
})

describe('hueName', () => {
  describe('happy path', () => {
    it('names a hue', () => {
      expect(hueName(120)).toBe('green')
    })
  })

  describe('variants', () => {
    it.each([
      [0, 'red'],
      [14, 'red'],
      [15, 'orange'],
      [344, 'pink'],
      [345, 'red'],
      [359, 'red'],
    ])('names %d° "%s" (band boundaries)', (hue, name) => {
      expect(hueName(hue)).toBe(name)
    })
  })

  // L3: N/A — every finite hue has a name.

  describe('unmanaged errors', () => {
    it.each([Number.NaN, Infinity, -Infinity])(
      'throws on a non-finite hue (%s)',
      (hue) => {
        expect(() => hueName(hue)).toThrow(RangeError)
      }
    )
  })

  describe('edge cases', () => {
    it('wraps hues outside [0, 360)', () => {
      expect(hueName(360)).toBe('red')
      expect(hueName(-120)).toBe('blue')
      expect(hueName(480)).toBe('green')
    })
  })
})
