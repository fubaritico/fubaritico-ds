import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'

import { pointer } from '../../../vitest.browser.pointer'
import ColorPicker from './ColorPicker'

import type { HsvaColor } from './ColorPicker'

// Real Chromium with the real skin: real geometry, pointer capture, native range keyboard and RTL —
// everything the jsdom suite had to stub or skip.

const BLUE: HsvaColor = { h: 210, s: 80, v: 60, a: 1 }
/** rgb(31, 92, 153), worked out by hand in the service tests. */
const BLUE_HEX = '#1f5c99'
/** Just inside the area: a box's bottom / right edge is outside it for hit-testing. */
const NEAR_START = 0.02
const NEAR_END = 0.98
const AREA = '.ui-color-picker__area'
const THUMB = '.ui-color-picker__area-thumb'

/**
 * Finds an element the test needs, or fails with a readable message.
 *
 * @param selector - CSS selector.
 * @returns The element.
 */
function queryRequired(selector: string): Element {
  const element = document.querySelector(selector)
  if (!element) throw new Error(`expected an element matching "${selector}"`)
  return element
}

const hexField = () => screen.getByRole('textbox', { name: 'Hex color' })
const hue = () => screen.getByRole('slider', { name: 'Hue' })

/**
 * Renders a picker in a fixed-size host so fractions map to known pixels.
 *
 * @param props - ColorPicker props.
 * @returns The render result.
 */
function renderPicker(props: Parameters<typeof ColorPicker>[0] = {}) {
  return render(
    <div style={{ inlineSize: '300px' }}>
      <ColorPicker defaultValue={BLUE} {...props} />
    </div>
  )
}

describe('ColorPicker (browser)', () => {
  describe('happy path', () => {
    it('picks a colour with a real drag, measured on the real area', async () => {
      const onChange = vi.fn()
      const onChangeComplete = vi.fn()
      renderPicker({ onChange, onChangeComplete })
      await pointer.pointerDown(AREA, { x: 0.5, y: 0.5 })
      await pointer.pointerMove(AREA, { x: 1, y: 0 })
      await pointer.pointerUp()

      const last = onChange.mock.lastCall?.[0] as HsvaColor
      expect(last.s).toBeGreaterThan(98)
      expect(last.v).toBeGreaterThan(98)
      expect(onChangeComplete).toHaveBeenCalledTimes(1)
      expect(screen.getByRole('slider', { name: 'Saturation' })).toHaveFocus()
    })
  })

  describe('variants', () => {
    it('keeps tracking while the pointer leaves the area (pointer capture)', async () => {
      const onChange = vi.fn()
      renderPicker({ onChange })
      await pointer.pointerDown(AREA, { x: 0.5, y: 0.5 })
      await pointer.pointerMove(AREA, { x: 3, y: 2 })
      await pointer.pointerUp()
      // Past the inline-end and the bottom: clamped to full saturation, zero brightness.
      expect(onChange).toHaveBeenLastCalledWith({ ...BLUE, s: 100, v: 0 })
      expect(hexField()).toHaveValue('#000000')
    })

    it('mirrors the saturation axis under dir="rtl"', async () => {
      const onChange = vi.fn()
      render(
        <div dir="rtl" style={{ inlineSize: '300px' }}>
          <ColorPicker defaultValue={BLUE} onChange={onChange} />
        </div>
      )
      // Near the physical LEFT edge — the inline-END in rtl — so nearly full saturation. (Exact edges
      // are avoided: a box's bottom / right edge is outside it for hit-testing.)
      await pointer.pointerDown(AREA, { x: NEAR_START, y: NEAR_START })
      await pointer.pointerUp()
      const last = onChange.mock.lastCall?.[0] as HsvaColor
      expect(last.s).toBeGreaterThan(95)
      expect(last.v).toBeGreaterThan(95)
    })

    it('drives the hue track with the native range keyboard', async () => {
      const onChange = vi.fn()
      const onChangeComplete = vi.fn()
      renderPicker({ onChange, onChangeComplete })
      hue().focus()
      await userEvent.keyboard('{ArrowRight}{ArrowRight}')
      expect(hue()).toHaveValue('212')
      expect(onChange).toHaveBeenLastCalledWith({ ...BLUE, h: 212 })
      expect(onChangeComplete).toHaveBeenLastCalledWith({ ...BLUE, h: 212 })
    })

    it('paints the hue ramp and the alpha ramp over a checkerboard (computed, not declared)', () => {
      renderPicker({ alpha: true })
      const tracks = document.querySelectorAll('.ui-color-picker__track .ui-slider__track')
      const [hueImage, alphaImage] = [...tracks].map((t) => getComputedStyle(t).backgroundImage)
      // An invalid declaration computes to 'none' — the grey track the first screenshot showed.
      expect(hueImage).toContain('linear-gradient')
      expect(alphaImage).toContain('linear-gradient')
      expect(alphaImage).toContain('conic-gradient')
    })

    it('places the thumb where the colour is', async () => {
      renderPicker({ defaultValue: { h: 0, s: 25, v: 75, a: 1 } })
      const area = queryRequired(AREA).getBoundingClientRect()
      const thumb = queryRequired(THUMB).getBoundingClientRect()
      const centreX = thumb.left + thumb.width / 2 - area.left
      const centreY = thumb.top + thumb.height / 2 - area.top
      expect(centreX / area.width).toBeCloseTo(0.25, 1)
      expect(centreY / area.height).toBeCloseTo(0.25, 1)
    })
  })

  describe('managed errors', () => {
    it('ignores a drag on a disabled picker', async () => {
      const onChange = vi.fn()
      renderPicker({ onChange, disabled: true })
      await pointer.pointerDown(AREA, { x: 0.5, y: 0.5 })
      await pointer.pointerUp()
      expect(onChange).not.toHaveBeenCalled()
      expect(getComputedStyle(queryRequired(AREA)).cursor).toBe(
        'not-allowed'
      )
    })
  })

  describe('unmanaged errors', () => {
    it('settles a track change that comes with no key or pointer release (assistive technology)', async () => {
      const onChangeComplete = vi.fn()
      renderPicker({ onChangeComplete })
      const input = hue() as HTMLInputElement
      input.focus()
      // A screen reader adjusts the value directly: an input event, no keyup / mouseup.
      // The native setter, as the browser does for an AT adjustment: assigning `input.value` would
      // go through React's value tracker and the event would read as "no change".
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      setValue?.call(input, '120')
      input.dispatchEvent(new Event('input', { bubbles: true }))
      expect(onChangeComplete).not.toHaveBeenCalled()
      await userEvent.tab()
      expect(onChangeComplete).toHaveBeenCalledWith({ ...BLUE, h: 120 })
    })
  })


  describe('edge cases', () => {
    it('puts the colour back when Escape is pressed mid-drag', async () => {
      const onChangeComplete = vi.fn()
      renderPicker({ onChangeComplete })
      // Near the bottom-start corner: almost black.
      await pointer.pointerDown(AREA, { x: NEAR_START, y: NEAR_END })
      expect(hexField()).not.toHaveValue(BLUE_HEX)
      await userEvent.keyboard('{Escape}')
      await pointer.pointerUp()
      expect(hexField()).toHaveValue(BLUE_HEX)
      expect(onChangeComplete).not.toHaveBeenCalled()
    })

    it('follows a dir attribute changed after mount', async () => {
      const onChange = vi.fn()
      const { container } = render(
        <div style={{ inlineSize: '300px' }}>
          <ColorPicker defaultValue={BLUE} onChange={onChange} />
        </div>
      )
      ;(container.firstElementChild as HTMLElement).dir = 'rtl'
      // The MutationObserver fires asynchronously.
      await new Promise((resolve) => setTimeout(resolve, 0))
      screen.getByRole('slider', { name: 'Saturation' }).focus()
      await userEvent.keyboard('{ArrowRight}')
      expect(onChange).toHaveBeenLastCalledWith({ ...BLUE, s: 79 })
    })

    it('shows the focus ring on the thumb only for keyboard focus', async () => {
      renderPicker()
      const thumb = queryRequired(THUMB)
      await userEvent.tab()
      expect(screen.getByRole('slider', { name: 'Saturation' })).toHaveFocus()
      expect(getComputedStyle(thumb).outlineStyle).toBe('solid')
      // Two-tone: a light halo is added to the shadow, so the ring holds on any colour.
      expect(getComputedStyle(thumb).boxShadow).toContain('rgb(255, 255, 255)')
    })
  })
})
