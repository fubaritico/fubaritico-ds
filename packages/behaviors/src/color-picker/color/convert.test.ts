import { describe, expect, it } from 'vitest'

import {
  hexToRgba,
  hslaToHsva,
  hsvaToHex,
  hsvaToHsla,
  hsvaToRgba,
  normalizeHue,
  rgbaToHex,
  rgbaToHsva,
} from './convert.js'

import type { HsvaColor } from './types.js'

/** Rounds every numeric field, so float noise doesn't fail an exact comparison. */
function round<T extends object>(color: T): T {
  return Object.fromEntries(
    Object.entries(color).map(([k, v]) => [
      k,
      typeof v === 'number' ? Math.round(v * 100) / 100 : v,
    ])
  ) as T
}

describe('color conversions', () => {
  describe('happy path', () => {
    it('converts pure red across every model', () => {
      const red: HsvaColor = { h: 0, s: 100, v: 100, a: 1 }
      expect(hsvaToRgba(red)).toEqual({ r: 255, g: 0, b: 0, a: 1 })
      expect(hsvaToHex(red)).toBe('#ff0000')
      expect(round(hsvaToHsla(red))).toEqual({ h: 0, s: 100, l: 50, a: 1 })
    })

    it('parses a hex colour back to RGBA', () => {
      expect(hexToRgba('#1976d2')).toEqual({ r: 25, g: 118, b: 210, a: 1 })
    })
  })

  describe('variants', () => {
    it.each([
      [{ h: 120, s: 100, v: 100, a: 1 }, '#00ff00'],
      [{ h: 240, s: 100, v: 100, a: 1 }, '#0000ff'],
      [{ h: 60, s: 100, v: 100, a: 1 }, '#ffff00'],
      [{ h: 0, s: 0, v: 100, a: 1 }, '#ffffff'],
      [{ h: 0, s: 0, v: 0, a: 1 }, '#000000'],
      [{ h: 210, s: 50, v: 50, a: 1 }, '#406080'],
    ])('formats %o as %s', (hsva, hex) => {
      expect(hsvaToHex(hsva)).toBe(hex)
    })

    it('round-trips chromatic colours through RGBA', () => {
      const color: HsvaColor = { h: 210, s: 88, v: 82, a: 0.5 }
      expect(round(rgbaToHsva(hsvaToRgba(color)))).toEqual(color)
    })

    it('round-trips through HSLA', () => {
      const color: HsvaColor = { h: 300, s: 40, v: 70, a: 1 }
      expect(round(hslaToHsva(hsvaToHsla(color)))).toEqual(color)
    })

    it('emits an 8-digit hex only when translucent', () => {
      expect(rgbaToHex({ r: 255, g: 0, b: 0, a: 1 })).toBe('#ff0000')
      expect(rgbaToHex({ r: 255, g: 0, b: 0, a: 0.5 })).toBe('#ff000080')
    })

    it.each([
      ['#f00', { r: 255, g: 0, b: 0, a: 1 }],
      ['f00', { r: 255, g: 0, b: 0, a: 1 }],
      ['#F008', { r: 255, g: 0, b: 0, a: 136 / 255 }],
      ['#FF000080', { r: 255, g: 0, b: 0, a: 128 / 255 }],
      ['  #00ff00  ', { r: 0, g: 255, b: 0, a: 1 }],
    ])('parses %s', (hex, rgba) => {
      expect(hexToRgba(hex)).toEqual(rgba)
    })
  })

  describe('managed errors', () => {
    it.each([
      '',
      '#',
      '#12',
      '#12345',
      '#1234567',
      '#gggggg',
      'red',
      'rgb(0,0,0)',
    ])('rejects %j with null', (input) => {
      expect(hexToRgba(input)).toBeNull()
    })
  })

  describe('unmanaged errors', () => {
    it('clamps out-of-range channels when formatting hex', () => {
      expect(rgbaToHex({ r: 300, g: -20, b: 127.6, a: 1 })).toBe('#ff0080')
    })

    it('clamps out-of-range alpha', () => {
      expect(rgbaToHex({ r: 255, g: 0, b: 0, a: 1.2 })).toBe('#ff0000')
      expect(rgbaToHex({ r: 255, g: 0, b: 0, a: -0.5 })).toBe('#ff000000')
    })

    it('clamps out-of-range saturation and value at the hex edge', () => {
      expect(hsvaToHex({ h: 0, s: 150, v: 120, a: 1 })).toBe('#ff0000')
    })

    it.each([Number.NaN, Infinity, -Infinity])(
      'throws on a non-finite channel (%s)',
      (bad) => {
        expect(() => rgbaToHex({ r: bad, g: 0, b: 0, a: 1 })).toThrow(
          RangeError
        )
        expect(() => rgbaToHex({ r: 0, g: 0, b: 0, a: bad })).toThrow(
          RangeError
        )
        expect(() => hsvaToHex({ h: 0, s: 100, v: bad, a: 1 })).toThrow(
          RangeError
        )
      }
    )
  })

  describe('edge cases', () => {
    it('loses the hue of an achromatic colour — why HSVA must stay the source of truth', () => {
      expect(rgbaToHsva({ r: 0, g: 0, b: 0, a: 1 })).toEqual({
        h: 0,
        s: 0,
        v: 0,
        a: 1,
      })
      expect(rgbaToHsva({ r: 128, g: 128, b: 128, a: 1 }).h).toBe(0)
    })

    it('treats hue 360 like hue 0', () => {
      expect(hsvaToHex({ h: 360, s: 100, v: 100, a: 1 })).toBe('#ff0000')
    })

    it('normalises the hue in the HSL converters too', () => {
      expect(hsvaToHsla({ h: 360, s: 100, v: 100, a: 1 }).h).toBe(0)
      expect(hslaToHsva({ h: -30, s: 100, l: 50, a: 1 }).h).toBe(330)
    })

    it('emits the 6-digit form when alpha rounds to opaque', () => {
      expect(rgbaToHex({ r: 255, g: 0, b: 0, a: 0.999 })).toBe('#ff0000')
    })

    it('normalises negative and overflowing hues', () => {
      expect(normalizeHue(-30)).toBe(330)
      expect(normalizeHue(720)).toBe(0)
      expect(normalizeHue(45)).toBe(45)
    })

    it('gives white and black an HSL saturation of 0', () => {
      expect(hsvaToHsla({ h: 120, s: 0, v: 100, a: 1 }).s).toBe(0)
      expect(hsvaToHsla({ h: 120, s: 100, v: 0, a: 1 }).s).toBe(0)
      expect(hslaToHsva({ h: 120, s: 50, l: 0, a: 1 }).s).toBe(0)
    })
  })
})
