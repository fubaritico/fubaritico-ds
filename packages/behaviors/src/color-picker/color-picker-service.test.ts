import { describe, expect, it, vi } from 'vitest'

import { createColorPickerService } from './color-picker-service.js'

import type { HsvaColor } from './color/types.js'
import type { ColorPickerOptions, ColorValue } from './types.js'

/** An opaque HSVA colour. */
const hsv = (h: number, s: number, v: number): HsvaColor => ({ h, s, v, a: 1 })

// h 210°, s 80%, v 60% → V = 153, chroma 122.4, min 30.6; halfway from cyan to blue,
// g = 30.6 + 122.4 × 0.5 = 91.8 → rgb(31, 92, 153) = #1f5c99 (worked out by hand, not by the code).
const BLUE = hsv(210, 80, 60)
const BLUE_HEX = '#1f5c99'

/** A service with spies on every callback. */
function setup(options: Partial<ColorPickerOptions> = {}) {
  const onChange = vi.fn<(value: ColorValue) => void>()
  const onChangeComplete = vi.fn<(value: ColorValue) => void>()
  const onWarn = vi.fn<(message: string) => void>()
  const service = createColorPickerService({
    uid: 'cp',
    defaultValue: BLUE,
    onChange,
    onChangeComplete,
    onWarn,
    ...options,
  })
  return { service, onChange, onChangeComplete, onWarn }
}

/** A minimal keyboard event recording whether it was consumed. */
function key(
  name: string,
  modifiers: { shiftKey?: boolean; altKey?: boolean } = {}
) {
  return { key: name, preventDefault: vi.fn(), ...modifiers }
}

describe('ColorPickerService', () => {
  describe('happy path', () => {
    it('exposes the default value and its derived outputs', () => {
      const { service } = setup()
      expect(service.getState()).toMatchObject({
        value: BLUE,
        color: BLUE,
        isAuto: false,
        hex: BLUE_HEX,
        hueHex: '#0080ff',
        opaqueHex: BLUE_HEX,
        hexDraft: BLUE_HEX,
        dragging: null,
        hexInvalid: false,
      })
    })

    it('drags on the area: onChange while moving, onChangeComplete once on release', () => {
      const { service, onChange, onChangeComplete } = setup()
      service.startDrag('area', { x: 0.5, y: 0.5 })
      expect(service.getState().dragging).toBe('area')
      service.moveDrag({ x: 1, y: 0 })
      service.endDrag()

      expect(onChange).toHaveBeenNthCalledWith(1, hsv(210, 50, 50))
      expect(onChange).toHaveBeenNthCalledWith(2, hsv(210, 100, 100))
      expect(onChangeComplete).toHaveBeenCalledTimes(1)
      expect(onChangeComplete).toHaveBeenCalledWith(hsv(210, 100, 100))
      expect(service.getState()).toMatchObject({
        dragging: null,
        value: hsv(210, 100, 100),
      })
    })

    it('sets one channel as a settled change', () => {
      const { service, onChange, onChangeComplete } = setup()
      expect(service.setChannel('h', 0)).toBe(true)
      expect(service.getState().value).toEqual(hsv(0, 80, 60))
      expect(onChange).toHaveBeenCalledWith(hsv(0, 80, 60))
      expect(onChangeComplete).toHaveBeenCalledWith(hsv(0, 80, 60))
    })

    it('notifies subscribers with a NEW snapshot carrying the change', () => {
      const { service } = setup()
      const previous = service.getState()
      const listener = vi.fn()
      service.subscribe(listener)
      service.setChannel('s', 10)
      const next = service.getState()
      expect(next).not.toBe(previous)
      expect(next.color.s).toBe(10)
      expect(listener).toHaveBeenCalledWith(next)
    })

    it('announces settled changes only — never during a drag', () => {
      const { service } = setup()
      expect(service.getState().announcement).toBe('')
      service.startDrag('area', { x: 1, y: 0 })
      service.moveDrag({ x: 0.9, y: 0.1 })
      expect(service.getState().announcement).toBe('')
      service.endDrag()
      expect(service.getState().announcement).toBe(service.describe())
      service.handleKeydown('area', key('ArrowDown'))
      expect(service.getState().announcement).toBe(service.describe())
    })
  })

  describe('variants', () => {
    describe('pointer', () => {
      it('sets the hue from the hue track, keeping saturation and brightness', () => {
        const { service } = setup()
        service.startDrag('hue', { x: 0.5, y: 0.9 })
        service.endDrag()
        expect(service.getState().value).toEqual(hsv(180, 80, 60))
        expect(service.getState().hueHex).toBe('#00ffff')
      })

      it('sets alpha from the alpha track when the alpha channel is on', () => {
        const { service } = setup({ alpha: true })
        service.startDrag('alpha', { x: 0.25, y: 0 })
        service.endDrag()
        expect(service.getState().value).toEqual({ ...BLUE, a: 0.25 })
        expect(service.getState().hex).toBe(`${BLUE_HEX}40`)
        expect(service.getState().opaqueHex).toBe(BLUE_HEX)
      })

      it('places the thumbs from the working colour', () => {
        const { service } = setup({
          alpha: true,
          defaultValue: { h: 90, s: 25, v: 75, a: 0.4 },
        })
        expect(service.thumbPosition('area')).toEqual({ x: 0.25, y: 0.25 })
        expect(service.thumbPosition('hue')).toEqual({ x: 0.25, y: 0.5 })
        expect(service.thumbPosition('alpha')).toEqual({ x: 0.4, y: 0.5 })
      })
    })

    describe('slider runs (complete: false + settle)', () => {
      it('reports every step, then completes once on settle', () => {
        const { service, onChange, onChangeComplete } = setup()
        service.setChannel('h', 100, { complete: false })
        service.setChannel('h', 120, { complete: false })
        expect(onChange).toHaveBeenCalledTimes(2)
        expect(onChangeComplete).not.toHaveBeenCalled()
        expect(service.getState().announcement).toBe('')
        service.settle()
        expect(onChangeComplete).toHaveBeenCalledTimes(1)
        expect(onChangeComplete).toHaveBeenCalledWith({ ...BLUE, h: 120 })
        expect(service.getState().announcement).toBe(service.describe())
      })

      it('settles nothing when nothing is pending', () => {
        const { service, onChangeComplete } = setup()
        const listener = vi.fn()
        service.subscribe(listener)
        service.settle()
        expect(onChangeComplete).not.toHaveBeenCalled()
        expect(listener).not.toHaveBeenCalled()
      })

      it('completes nothing for a run that came back to its start', () => {
        const { service, onChangeComplete } = setup()
        service.setChannel('h', 100, { complete: false })
        service.setChannel('h', 210, { complete: false })
        service.settle()
        expect(onChangeComplete).not.toHaveBeenCalled()
      })

      it('lets a settled change end the run (no double completion)', () => {
        const { service, onChangeComplete } = setup()
        service.setChannel('h', 100, { complete: false })
        service.setChannel('h', 110)
        service.settle()
        expect(onChangeComplete).toHaveBeenCalledTimes(1)
      })
    })

    describe('keyboard', () => {
      it.each([
        ['ArrowRight', { s: 81 }],
        ['ArrowLeft', { s: 79 }],
        ['ArrowUp', { v: 61 }],
        ['ArrowDown', { v: 59 }],
        ['PageUp', { v: 70 }],
        ['PageDown', { v: 50 }],
        ['Home', { s: 0 }],
        ['End', { s: 100 }],
      ])('area: %s changes %o', (name, patch) => {
        const { service, onChangeComplete } = setup()
        const event = key(name)
        expect(service.handleKeydown('area', event)).toBe(true)
        expect(event.preventDefault).toHaveBeenCalled()
        expect(service.getState().value).toEqual({ ...BLUE, ...patch })
        expect(onChangeComplete).toHaveBeenCalledTimes(1)
      })

      it('multiplies a step by 10 with Shift', () => {
        const { service } = setup()
        service.handleKeydown('area', key('ArrowRight', { shiftKey: true }))
        expect(service.getState().value).toEqual({ ...BLUE, s: 90 })
      })

      it('mirrors the inline axis in rtl', () => {
        const { service } = setup({ dir: 'rtl' })
        service.handleKeydown('area', key('ArrowRight'))
        expect(service.getState().color.s).toBe(79)
        service.handleKeydown('hue', key('ArrowRight'))
        expect(service.getState().color.h).toBe(209)
      })

      it.each([
        ['ArrowRight', 211],
        ['ArrowUp', 211],
        ['ArrowLeft', 209],
        ['ArrowDown', 209],
        ['PageUp', 220],
        ['PageDown', 200],
        ['Home', 0],
        ['End', 360],
      ])('hue: %s → %d°', (name, hue) => {
        const { service } = setup()
        service.handleKeydown('hue', key(name))
        expect(service.getState().color.h).toBe(hue)
      })

      it('steps alpha by 1%', () => {
        const { service } = setup({
          alpha: true,
          defaultValue: { ...BLUE, a: 0.5 },
        })
        service.handleKeydown('alpha', key('ArrowRight'))
        expect(service.getState().color.a).toBeCloseTo(0.51)
        service.handleKeydown('alpha', key('End'))
        expect(service.getState().color.a).toBe(1)
      })

      it('snaps a dragged value to the step grid before stepping', () => {
        const { service } = setup()
        service.startDrag('area', { x: 0.4537, y: 0.4 })
        service.endDrag()
        service.handleKeydown('area', key('ArrowRight'))
        expect(service.getState().color.s).toBe(46)
        service.startDrag('hue', { x: 0.12345, y: 0 })
        service.endDrag()
        service.handleKeydown('hue', key('ArrowRight'))
        expect(service.getState().color.h).toBe(45)
      })
    })

    describe('controlled', () => {
      it('emits the intent but keeps the parent value until it changes', () => {
        const { service, onChange } = setup({ value: BLUE })
        service.setChannel('s', 10)
        expect(onChange).toHaveBeenCalledWith({ ...BLUE, s: 10 })
        expect(service.getState().value).toEqual(BLUE)
        service.setOptions({ value: { ...BLUE, s: 10 } })
        expect(service.getState().value).toEqual({ ...BLUE, s: 10 })
      })

      it('keeps the working hue when the parent echoes a gray back with h: 0 (hex round trip)', () => {
        const { service } = setup({ value: hsv(210, 0, 50) })
        expect(service.getState().color.h).toBe(210)
        service.setOptions({ value: hsv(0, 0, 50) })
        expect(service.getState().color.h).toBe(210)
        expect(service.thumbPosition('hue').x).toBeCloseTo(210 / 360)
      })

      it('adopts a genuinely different controlled colour', () => {
        const { service } = setup({ value: BLUE })
        service.setOptions({ value: hsv(0, 100, 100) })
        expect(service.getState().color).toEqual(hsv(0, 100, 100))
      })

      it('switches to uncontrolled when value is passed as undefined', () => {
        const { service } = setup({ value: BLUE })
        service.setOptions({ value: undefined })
        service.setChannel('h', 0)
        expect(service.getState().value).toEqual(hsv(0, 80, 60))
      })
    })

    describe('automatic (nullable)', () => {
      it('enters the automatic state and exposes it everywhere', () => {
        const { service, onChange, onChangeComplete } = setup({
          nullable: true,
        })
        expect(service.setAuto()).toBe(true)
        expect(service.getState()).toMatchObject({
          value: null,
          isAuto: true,
          hex: null,
          hexDraft: '',
          color: BLUE,
        })
        expect(service.describe()).toBe('Automatic, no color selected')
        expect(service.swatchAttrs()).toEqual({
          role: 'img',
          'aria-label': 'Automatic, no color selected',
        })
        expect(service.getState().announcement).toBe(
          'Automatic, no color selected'
        )
        expect(service.trackInputAttrs('hue')['aria-valuetext']).toBe(
          '210°, blue, Automatic, no color selected'
        )
        expect(service.autoToggleAttrs()['aria-pressed']).toBe('true')
        expect(service.getRgba()).toBeNull()
        expect(service.getHsla()).toBeNull()
        expect(onChange).toHaveBeenCalledWith(null)
        expect(onChangeComplete).toHaveBeenCalledWith(null)
      })

      it('starts in the automatic state from a null default', () => {
        const { service } = setup({ nullable: true, defaultValue: null })
        expect(service.getState()).toMatchObject({
          value: null,
          color: hsv(0, 100, 100),
        })
      })

      it('leaves "automatic" from the colour the user had', () => {
        const { service } = setup({ nullable: true })
        service.setAuto()
        service.setChannel('v', 90)
        expect(service.getState().value).toEqual({ ...BLUE, v: 90 })
      })

      it('accepts null through setColor', () => {
        const { service } = setup({ nullable: true })
        expect(service.setColor(null)).toBe(true)
        expect(service.getState().isAuto).toBe(true)
      })

      it('follows a controlled null', () => {
        const { service } = setup({ nullable: true, value: BLUE })
        service.setOptions({ value: null })
        expect(service.getState()).toMatchObject({
          value: null,
          isAuto: true,
          color: BLUE,
        })
      })
    })

    describe('hex field', () => {
      it('applies nothing while typing, then the colour on commit', () => {
        const { service, onChange, onChangeComplete } = setup()
        service.setHexDraft('#ff')
        expect(service.getState()).toMatchObject({
          hexDraft: '#ff',
          value: BLUE,
        })
        expect(onChange).not.toHaveBeenCalled()
        service.setHexDraft('#ff0000')
        expect(service.commitHexDraft()).toBe(true)
        expect(service.getState()).toMatchObject({
          value: hsv(0, 100, 100),
          hexDraft: '#ff0000',
        })
        expect(onChangeComplete).toHaveBeenCalledWith(hsv(0, 100, 100))
      })

      it('accepts the short form and no "#"', () => {
        const { service } = setup()
        service.setHexDraft('0f0')
        service.commitHexDraft()
        expect(service.getState().hex).toBe('#00ff00')
      })

      it('keeps the hue when a gray is typed, and hue + saturation for black', () => {
        const { service } = setup()
        service.setHexDraft('#808080')
        service.commitHexDraft()
        expect(service.getState().color.h).toBe(210)
        expect(service.getState().color.s).toBe(0)
        service.setHexDraft('#000000')
        service.commitHexDraft()
        expect(service.getState().color).toMatchObject({ h: 210, v: 0 })
      })

      it('drops a typed alpha when the alpha channel is off, keeps it when on', () => {
        const off = setup().service
        off.setHexDraft('#ff000080')
        off.commitHexDraft()
        expect(off.getState().value?.a).toBe(1)

        const on = setup({ alpha: true }).service
        on.setHexDraft('#ff000080')
        on.commitHexDraft()
        expect(on.getState().value?.a).toBeCloseTo(128 / 255)
      })

      it('mirrors the value again after a drag (the draft is not stuck)', () => {
        const { service } = setup()
        service.setHexDraft('#12')
        service.startDrag('area', { x: 0, y: 0 })
        service.endDrag()
        expect(service.getState().hexDraft).toBe(service.getState().hex)
      })

      it('leaves "automatic" when a valid hex is committed', () => {
        const { service } = setup({ nullable: true })
        service.setAuto()
        service.setHexDraft('#ffffff')
        service.commitHexDraft()
        expect(service.getState().isAuto).toBe(false)
      })
    })

    describe('attributes', () => {
      it('describes each area axis as a native range announced as a 2D slider', () => {
        const { service } = setup()
        expect(service.areaAttrs()).toEqual({
          role: 'group',
          'aria-label': 'Color',
          'aria-disabled': undefined,
          'data-dragging': undefined,
        })
        expect(service.areaInputAttrs('saturation')).toMatchObject({
          id: 'cp-area-saturation',
          type: 'range',
          min: 0,
          max: 100,
          step: 1,
          value: '80',
          'aria-label': 'Saturation',
          'aria-roledescription': '2D slider',
          'aria-orientation': 'horizontal',
          // Both coordinates on both inputs: ArrowUp changes brightness while focus stays here.
          'aria-valuetext': 'Saturation 80%, Brightness 60%, dark blue',
          tabindex: 0,
        })
        expect(service.areaInputAttrs('brightness')).toMatchObject({
          value: '60',
          'aria-orientation': 'vertical',
          'aria-valuetext': 'Saturation 80%, Brightness 60%, dark blue',
          tabindex: -1,
        })
      })

      it('describes the hue and alpha tracks', () => {
        const { service } = setup({
          alpha: true,
          defaultValue: { ...BLUE, a: 0.5 },
        })
        expect(service.trackInputAttrs('hue')).toMatchObject({
          id: 'cp-hue',
          max: 360,
          value: '210',
          'aria-label': 'Hue',
          'aria-valuetext': '210°, blue',
          disabled: undefined,
        })
        expect(service.trackInputAttrs('alpha')).toMatchObject({
          max: 100,
          value: '50',
          'aria-label': 'Opacity',
          'aria-valuetext': '50%',
        })
      })

      it('marks the area while it is dragged', () => {
        const { service } = setup()
        service.startDrag('area', { x: 0.5, y: 0.5 })
        expect(service.areaAttrs()['data-dragging']).toBe('')
      })

      it('describes the hex field, the swatch and the automatic toggle', () => {
        const { service } = setup()
        expect(service.hexInputAttrs()).toMatchObject({
          id: 'cp-hex',
          type: 'text',
          value: BLUE_HEX,
          'aria-label': 'Hex color',
          'aria-invalid': undefined,
          spellcheck: 'false',
          maxlength: 9,
        })
        expect(service.swatchAttrs()).toEqual({
          role: 'img',
          'aria-label': 'dark blue',
        })
        expect(service.autoToggleAttrs()).toEqual({
          type: 'button',
          'aria-label': 'Automatic',
          'aria-pressed': 'false',
          disabled: '',
        })
        expect(service.statusAttrs()).toEqual({
          role: 'status',
          'aria-live': 'polite',
          'aria-atomic': 'true',
        })
      })

      it('links an invalid hex to a text error message', () => {
        const { service } = setup()
        expect(service.hexInputAttrs()['aria-describedby']).toBeUndefined()
        service.setHexDraft('#zz')
        service.commitHexDraft()
        expect(service.hexInputAttrs()['aria-describedby']).toBe('cp-hex-error')
        expect(service.hexErrorAttrs()).toEqual({
          id: 'cp-hex-error',
          role: 'alert',
        })
        expect(service.hexErrorText()).toBe('Enter a hex color such as #1976d2')
      })

      it('uses injected labels and colour descriptions', () => {
        const { service } = setup({
          labels: {
            saturation: 'Saturation (fr)',
            automaticDescription: 'Auto',
            areaRoleDescription: 'curseur 2D',
          },
          describeColor: () => 'bleu',
          nullable: true,
        })
        expect(service.areaInputAttrs('saturation')['aria-valuetext']).toBe(
          'Saturation (fr) 80%, Brightness 60%, bleu'
        )
        expect(
          service.areaInputAttrs('saturation')['aria-roledescription']
        ).toBe('curseur 2D')
        expect(service.areaAttrs()['aria-label']).toBe('Color')
        service.setAuto()
        expect(service.describe()).toBe('Auto')
      })

      it('reads RGB and HSL of the value for display', () => {
        const { service } = setup({ defaultValue: hsv(0, 100, 100) })
        expect(service.getRgba()).toEqual({ r: 255, g: 0, b: 0, a: 1 })
        expect(service.getHsla()).toEqual({ h: 0, s: 100, l: 50, a: 1 })
      })
    })
  })

  describe('managed errors', () => {
    it('blocks every change when disabled, and says so in the attributes', () => {
      const { service, onChange } = setup({ disabled: true, nullable: true })
      expect(service.setChannel('h', 0)).toBe(false)
      expect(service.setAuto()).toBe(false)
      expect(service.startDrag('area', { x: 0, y: 0 })).toBe(false)
      expect(service.handleKeydown('area', key('ArrowRight'))).toBe(false)
      service.setHexDraft('#ff0000')
      expect(service.commitHexDraft()).toBe(false)
      expect(onChange).not.toHaveBeenCalled()
      expect(service.getState().value).toEqual(BLUE)
      expect(service.areaAttrs()['aria-disabled']).toBe('true')
      expect(service.areaInputAttrs('saturation').disabled).toBe('')
      expect(service.trackInputAttrs('hue').disabled).toBe('')
      expect(service.hexInputAttrs().disabled).toBe('')
    })

    it('refuses the automatic state on a picker that is not nullable', () => {
      const { service, onWarn, onChange } = setup()
      expect(service.setAuto()).toBe(false)
      expect(service.setColor(null)).toBe(false)
      expect(onWarn).toHaveBeenCalledWith(
        expect.stringContaining('not nullable')
      )
      expect(onChange).not.toHaveBeenCalled()
    })

    it('flags an invalid hex on Enter and keeps the draft for correction', () => {
      const { service, onChange } = setup()
      service.setHexDraft('#zzz')
      expect(service.commitHexDraft()).toBe(false)
      expect(service.getState()).toMatchObject({
        hexInvalid: true,
        hexDraft: '#zzz',
        value: BLUE,
      })
      expect(service.hexInputAttrs()['aria-invalid']).toBe('true')
      service.setHexDraft('#zz')
      expect(service.getState().hexInvalid).toBe(false)
      expect(onChange).not.toHaveBeenCalled()
    })

    it('discards an invalid hex on blur', () => {
      const { service } = setup()
      service.setHexDraft('nope')
      expect(service.commitHexDraft({ revertOnInvalid: true })).toBe(false)
      expect(service.getState()).toMatchObject({
        hexInvalid: false,
        hexDraft: BLUE_HEX,
      })
    })

    it('abandons the draft on cancel (Escape)', () => {
      const { service } = setup()
      service.setHexDraft('#zzz')
      service.commitHexDraft()
      service.cancelHexDraft()
      expect(service.getState()).toMatchObject({
        hexInvalid: false,
        hexDraft: BLUE_HEX,
      })
    })

    it('ignores the alpha track when the alpha channel is off', () => {
      const { service, onChange } = setup()
      expect(service.startDrag('alpha', { x: 0, y: 0 })).toBe(false)
      expect(service.handleKeydown('alpha', key('ArrowLeft'))).toBe(false)
      expect(service.trackInputAttrs('alpha').disabled).toBe('')
      expect(onChange).not.toHaveBeenCalled()
    })

    it('leaves unknown and modified keys to the browser', () => {
      const { service } = setup()
      for (const event of [
        key('x'),
        key('ArrowRight', { altKey: true }),
        key('Tab'),
      ]) {
        expect(service.handleKeydown('area', event)).toBe(false)
        expect(event.preventDefault).not.toHaveBeenCalled()
      }
      expect(service.getState().value).toEqual(BLUE)
    })
  })

  describe('unmanaged errors', () => {
    it('clamps out-of-range channels', () => {
      const { service } = setup({ alpha: true })
      service.setChannel('s', 150)
      service.setChannel('h', -10)
      service.setChannel('a', 2)
      expect(service.getState().value).toEqual({ h: 0, s: 100, v: 60, a: 1 })
    })

    it('rejects a non-finite channel with a warning', () => {
      const { service, onWarn, onChange } = setup()
      expect(service.setChannel('v', Number.NaN)).toBe(false)
      expect(service.setChannel('h', Infinity)).toBe(false)
      expect(onWarn).toHaveBeenCalledTimes(2)
      expect(onChange).not.toHaveBeenCalled()
    })

    it('ignores a key that is an inherited object property', () => {
      const { service } = setup()
      for (const name of ['toString', 'constructor', '__proto__']) {
        expect(service.handleKeydown('hue', key(name))).toBe(false)
        expect(service.handleKeydown('area', key(name))).toBe(false)
      }
      expect(service.getState().value).toEqual(BLUE)
    })

    it('ignores a non-finite pointer position with a warning', () => {
      const { service, onWarn, onChange } = setup()
      expect(service.startDrag('area', { x: Number.NaN, y: 0 })).toBe(false)
      service.startDrag('area', { x: 0, y: 0 })
      service.moveDrag({ x: 0.5, y: Infinity })
      expect(onWarn).toHaveBeenCalledTimes(2)
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(service.getState().color).toEqual({ ...BLUE, s: 0, v: 100 })
    })

    it('clamps a pointer outside the surface', () => {
      const { service } = setup()
      service.startDrag('area', { x: 2, y: -1 })
      expect(service.getState().color).toEqual({ ...BLUE, s: 100, v: 100 })
    })

    it('ignores drag moves, ends and cancels without a started drag', () => {
      const { service, onChange, onChangeComplete } = setup()
      service.moveDrag({ x: 0, y: 0 })
      service.endDrag()
      service.cancelDrag()
      expect(onChange).not.toHaveBeenCalled()
      expect(onChangeComplete).not.toHaveBeenCalled()
    })

    it('warns on a controlled null when the picker is not nullable', () => {
      const { onWarn } = setup({ value: null })
      expect(onWarn).toHaveBeenCalledWith(
        expect.stringContaining('not nullable')
      )
    })

    it('falls back to the placeholder for a null default on a non-nullable picker', () => {
      const { service } = setup({
        defaultValue: null,
        placeholder: hsv(120, 50, 50),
      })
      expect(service.getState()).toMatchObject({
        value: hsv(120, 50, 50),
        isAuto: false,
      })
    })

    it('clamps an out-of-range default and drops its alpha when the channel is off', () => {
      const { service } = setup({
        defaultValue: { h: 400, s: -5, v: 120, a: 0.3 },
      })
      expect(service.getState().value).toEqual({ h: 360, s: 0, v: 100, a: 1 })
    })
  })

  describe('edge cases', () => {
    it('keeps the hue through saturation 0 and back — the bug of every naive picker', () => {
      const { service } = setup()
      service.setChannel('s', 0)
      expect(service.getState().hex).toBe('#999999')
      service.setChannel('s', 80)
      expect(service.getState().value).toEqual(BLUE)
    })

    it('keeps hue and saturation through black and back', () => {
      const { service } = setup()
      service.setChannel('v', 0)
      expect(service.getState().hex).toBe('#000000')
      service.setChannel('v', 60)
      expect(service.getState().value).toEqual(BLUE)
    })

    it('keeps the colour through a round trip via "automatic"', () => {
      const { service } = setup({ nullable: true })
      service.setAuto()
      service.handleKeydown('area', key('ArrowUp'))
      expect(service.getState().value).toEqual({ ...BLUE, v: 61 })
    })

    it('restores value and thumbs on cancelDrag, without onChangeComplete', () => {
      const { service, onChange, onChangeComplete } = setup()
      service.startDrag('area', { x: 0, y: 1 })
      service.moveDrag({ x: 0.1, y: 0.9 })
      service.cancelDrag()
      expect(service.getState()).toMatchObject({
        value: BLUE,
        color: BLUE,
        dragging: null,
      })
      expect(onChange).toHaveBeenLastCalledWith(BLUE)
      expect(onChangeComplete).not.toHaveBeenCalled()
    })

    it('cancels a drag started from "automatic" back to null, thumbs included', () => {
      const { service } = setup({ nullable: true })
      service.setAuto()
      service.startDrag('hue', { x: 0, y: 0 })
      service.cancelDrag()
      expect(service.getState()).toMatchObject({ value: null, color: BLUE })
    })

    it('fires no onChangeComplete for a drag that changed nothing', () => {
      const { service, onChangeComplete } = setup({
        defaultValue: hsv(0, 50, 50),
      })
      service.startDrag('area', { x: 0.5, y: 0.5 })
      service.endDrag()
      expect(onChangeComplete).not.toHaveBeenCalled()
    })

    it('fires no onChangeComplete in controlled mode when the parent ignores the drag', () => {
      const { service, onChange, onChangeComplete } = setup({ value: BLUE })
      service.startDrag('area', { x: 0, y: 0 })
      service.endDrag()
      expect(onChange).toHaveBeenCalled()
      expect(onChangeComplete).not.toHaveBeenCalled()
    })

    it('reports no change for the same colour', () => {
      const { service, onChange } = setup()
      expect(service.setColor(BLUE)).toBe(false)
      expect(onChange).not.toHaveBeenCalled()
    })

    it('notifies once when a drag starts (batched)', () => {
      const { service } = setup()
      const listener = vi.fn()
      service.subscribe(listener)
      service.startDrag('area', { x: 0, y: 0 })
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('does not notify for a new labels object or callback with the same content', () => {
      const { service } = setup({ labels: { hue: 'Teinte' } })
      const listener = vi.fn()
      service.subscribe(listener)
      service.setOptions({
        labels: { hue: 'Teinte' },
        onChange: () => undefined,
      })
      expect(listener).not.toHaveBeenCalled()
      service.setOptions({ labels: { hue: 'Ton' } })
      expect(listener).toHaveBeenCalledTimes(1)
      expect(service.trackInputAttrs('hue')['aria-label']).toBe('Ton')
    })

    it('resets alpha to 1 when the alpha channel is switched off', () => {
      const { service } = setup({
        alpha: true,
        defaultValue: { ...BLUE, a: 0.2 },
      })
      service.setOptions({ alpha: false })
      expect(service.getState().value?.a).toBe(1)
    })

    it('allows hue 360 (the end of the track), drawn as red', () => {
      const { service } = setup()
      service.handleKeydown('hue', key('End'))
      expect(service.getState()).toMatchObject({ hueHex: '#ff0000' })
      expect(service.getState().color.h).toBe(360)
    })

    it('returns the same snapshot reference until something changes', () => {
      const { service } = setup()
      expect(service.getState()).toBe(service.getState())
    })

    it('uses presence semantics for boolean attributes (ARIA states keep their "false" token)', () => {
      const { service } = setup({ alpha: true, nullable: true })
      const maps = [
        service.areaAttrs(),
        service.areaInputAttrs('saturation'),
        service.areaInputAttrs('brightness'),
        service.trackInputAttrs('hue'),
        service.trackInputAttrs('alpha'),
        service.hexInputAttrs(),
        service.autoToggleAttrs(),
        service.swatchAttrs(),
      ]
      for (const attrs of maps) {
        // `disabled` / `data-*` are HTML booleans: present ('') or omitted, never "false".
        expect(attrs.disabled).toBeUndefined()
        expect(attrs['data-dragging']).toBeUndefined()
      }
      expect(service.autoToggleAttrs()['aria-pressed']).toBe('false')
    })

    it('notifies when uid or dir change, since ids and key mapping derive from them', () => {
      const { service } = setup()
      const listener = vi.fn()
      service.subscribe(listener)
      service.setOptions({ uid: 'other', dir: 'ltr' })
      expect(listener).toHaveBeenCalledTimes(1)
      expect(service.hexInputAttrs().id).toBe('other-hex')
      service.setOptions({ dir: 'rtl' })
      expect(listener).toHaveBeenCalledTimes(2)
    })

    it('in controlled mode, cancelDrag only emits the start value — the parent restores', () => {
      const { service, onChange } = setup({ value: BLUE })
      service.startDrag('area', { x: 0, y: 0 })
      service.setOptions({ value: { ...BLUE, s: 0, v: 100 } })
      service.cancelDrag()
      expect(onChange).toHaveBeenLastCalledWith(BLUE)
      expect(service.getState().dragging).toBeNull()
    })

    it('treats a commit without a draft as a no-op success', () => {
      const { service, onChange } = setup()
      expect(service.commitHexDraft()).toBe(true)
      expect(onChange).not.toHaveBeenCalled()
    })

    it('clears the draft when the committed hex is the current colour, without emitting', () => {
      const { service, onChange } = setup()
      service.setHexDraft(BLUE_HEX.toUpperCase())
      expect(service.commitHexDraft()).toBe(true)
      expect(service.getState().hexDraft).toBe(BLUE_HEX)
      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not notify for a cancel with nothing to cancel', () => {
      const { service } = setup()
      const listener = vi.fn()
      service.subscribe(listener)
      service.cancelHexDraft()
      expect(listener).not.toHaveBeenCalled()
    })

    it('leaves an unknown key on a track to the browser', () => {
      const { service } = setup()
      const event = key('Enter')
      expect(service.handleKeydown('hue', event)).toBe(false)
      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('drops its subscribers on destroy, yet keeps working (a double-mount reuses it)', () => {
      const { service } = setup()
      const listener = vi.fn()
      service.subscribe(listener)
      service.destroy()
      expect(service.setChannel('h', 0)).toBe(true)
      expect(listener).not.toHaveBeenCalled()
      expect(service.getState().color.h).toBe(0)
    })
  })
})
