import { describe, expect, it } from 'vitest'

import { areaKeyChange, trackKeyChange } from './keyboard.js'

import type { HsvaColor } from './color/types.js'

const COLOR: HsvaColor = { h: 210.4, s: 45.6, v: 60.2, a: 0.503 }
const key = (name: string, shiftKey = false) => ({ key: name, shiftKey })

describe('areaKeyChange', () => {
  describe('happy path', () => {
    it('moves saturation with the horizontal arrows, snapped to whole percents', () => {
      expect(areaKeyChange(key('ArrowRight'), COLOR, 'ltr')).toEqual({ s: 47 })
      expect(areaKeyChange(key('ArrowLeft'), COLOR, 'ltr')).toEqual({ s: 45 })
    })
  })

  describe('variants', () => {
    it.each([
      ['ArrowUp', { v: 61 }],
      ['ArrowDown', { v: 59 }],
      ['PageUp', { v: 70 }],
      ['PageDown', { v: 50 }],
      ['Home', { s: 0 }],
      ['End', { s: 100 }],
    ])('%s → %o', (name, patch) => {
      expect(areaKeyChange(key(name), COLOR, 'ltr')).toEqual(patch)
    })

    it('multiplies arrow steps by 10 with Shift', () => {
      expect(areaKeyChange(key('ArrowUp', true), COLOR, 'ltr')).toEqual({
        v: 70,
      })
    })

    it('mirrors the horizontal arrows in rtl, not the vertical ones', () => {
      expect(areaKeyChange(key('ArrowRight'), COLOR, 'rtl')).toEqual({ s: 45 })
      expect(areaKeyChange(key('ArrowUp'), COLOR, 'rtl')).toEqual({ v: 61 })
    })
  })

  describe('managed errors', () => {
    it.each(['Enter', 'x', 'Tab'])(
      'returns null for an unhandled key (%s)',
      (name) => {
        expect(areaKeyChange(key(name), COLOR, 'ltr')).toBeNull()
      }
    )
  })

  describe('unmanaged errors', () => {
    it.each(['toString', 'constructor', 'hasOwnProperty', '__proto__'])(
      'returns null for an inherited property name (%s)',
      (name) => {
        expect(areaKeyChange(key(name), COLOR, 'ltr')).toBeNull()
      }
    )
  })

  describe('edge cases', () => {
    it('steps past the range — clamping is the service’s job', () => {
      expect(
        areaKeyChange(key('ArrowUp'), { ...COLOR, v: 100 }, 'ltr')
      ).toEqual({ v: 101 })
    })
  })
})

describe('trackKeyChange', () => {
  describe('happy path', () => {
    it('steps the hue by one degree from the snapped value', () => {
      expect(trackKeyChange('hue', key('ArrowRight'), COLOR, 'ltr')).toEqual({
        h: 211,
      })
    })
  })

  describe('variants', () => {
    it.each([
      ['ArrowUp', 211],
      ['ArrowLeft', 209],
      ['ArrowDown', 209],
      ['PageUp', 220],
      ['PageDown', 200],
      ['Home', 0],
      ['End', 360],
    ])('hue: %s → %d', (name, h) => {
      expect(trackKeyChange('hue', key(name), COLOR, 'ltr')).toEqual({ h })
    })

    it('steps alpha by 0.01 from the snapped value, and ends at 1', () => {
      expect(
        trackKeyChange('alpha', key('ArrowRight'), COLOR, 'ltr')?.a
      ).toBeCloseTo(0.51)
      expect(trackKeyChange('alpha', key('End'), COLOR, 'ltr')).toEqual({
        a: 1,
      })
      expect(
        trackKeyChange('alpha', key('PageUp'), COLOR, 'ltr')?.a
      ).toBeCloseTo(0.6)
    })

    it('mirrors Left / Right in rtl', () => {
      expect(trackKeyChange('hue', key('ArrowRight'), COLOR, 'rtl')).toEqual({
        h: 209,
      })
      expect(trackKeyChange('hue', key('ArrowUp'), COLOR, 'rtl')).toEqual({
        h: 211,
      })
    })

    it('multiplies a step by 10 with Shift', () => {
      expect(
        trackKeyChange('hue', key('ArrowRight', true), COLOR, 'ltr')
      ).toEqual({ h: 220 })
    })
  })

  describe('managed errors', () => {
    it('returns null for an unhandled key', () => {
      expect(trackKeyChange('hue', key('Enter'), COLOR, 'ltr')).toBeNull()
    })
  })

  describe('unmanaged errors', () => {
    it.each(['toString', 'valueOf', '__proto__'])(
      'returns null for an inherited property name (%s)',
      (name) => {
        expect(trackKeyChange('hue', key(name), COLOR, 'ltr')).toBeNull()
      }
    )
  })

  describe('edge cases', () => {
    it('lets the hue reach 360 (the end of the track) and step below 0 — clamped by the service', () => {
      expect(
        trackKeyChange('hue', key('ArrowLeft'), { ...COLOR, h: 0 }, 'ltr')
      ).toEqual({ h: -1 })
    })
  })
})
