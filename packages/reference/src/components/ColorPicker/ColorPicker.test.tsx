import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createColorPickerService } from '@fubaritico/behaviors'

import ColorPicker from './ColorPicker'

import type { ColorValue, HsvaColor } from './ColorPicker'

const BLUE: HsvaColor = { h: 210, s: 80, v: 60, a: 1 }
/** rgb(31, 92, 153) — worked out by hand in the service tests. */
const BLUE_HEX = '#1f5c99'

/** The area box jsdom cannot measure: 200 × 100 at (0, 0). */
const AREA_RECT = {
  left: 0,
  top: 0,
  width: 200,
  height: 100,
  right: 200,
  bottom: 100,
  x: 0,
  y: 0,
}

const area = () => screen.getByRole('group', { name: 'Color' })
const saturation = () => screen.getByRole('slider', { name: 'Saturation' })
const hue = () => screen.getByRole('slider', { name: 'Hue' })
const hexField = () => screen.getByRole('textbox', { name: 'Hex color' })
const swatch = () => screen.getByRole('img')

beforeEach(() => {
  // jsdom measures nothing and has no pointer capture: stub both (Drawer precedent).
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    ...AREA_RECT,
    toJSON: () => AREA_RECT,
  })
  HTMLElement.prototype.setPointerCapture = vi.fn()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ColorPicker', () => {
  describe('happy path', () => {
    it('renders the default arrangement around the value', () => {
      render(<ColorPicker defaultValue={BLUE} />)
      expect(area()).toBeInTheDocument()
      expect(saturation()).toHaveAttribute('aria-roledescription', '2D slider')
      expect(hue()).toHaveValue('210')
      expect(hexField()).toHaveValue(BLUE_HEX)
      expect(swatch()).toHaveAccessibleName('dark blue')
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('picks a colour by dragging on the area: onChange while moving, onChangeComplete once', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const onChangeComplete = vi.fn()
      render(
        <ColorPicker
          defaultValue={BLUE}
          onChange={onChange}
          onChangeComplete={onChangeComplete}
        />
      )
      await user.pointer([
        {
          keys: '[MouseLeft>]',
          target: area(),
          coords: { clientX: 100, clientY: 50 },
        },
        { target: area(), coords: { clientX: 200, clientY: 0 } },
        { keys: '[/MouseLeft]', target: area() },
      ])
      expect(onChange).toHaveBeenCalledWith({ h: 210, s: 50, v: 50, a: 1 })
      expect(onChange).toHaveBeenLastCalledWith({
        h: 210,
        s: 100,
        v: 100,
        a: 1,
      })
      expect(onChangeComplete).toHaveBeenCalledTimes(1)
      expect(hexField()).toHaveValue('#0080ff')
      expect(saturation()).toHaveFocus()
    })
  })

  describe('variants', () => {
    it('drives both area axes from the keyboard on the saturation input', async () => {
      const user = userEvent.setup()
      const onChangeComplete = vi.fn()
      render(
        <ColorPicker defaultValue={BLUE} onChangeComplete={onChangeComplete} />
      )
      saturation().focus()
      await user.keyboard('{ArrowRight}{ArrowUp}')
      expect(onChangeComplete).toHaveBeenLastCalledWith({
        ...BLUE,
        s: 81,
        v: 61,
      })
      expect(saturation()).toHaveAttribute(
        'aria-valuetext',
        expect.stringContaining('Saturation 81%, Brightness 61%')
      )
    })

    it('mirrors the inline axis under dir="rtl"', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
        <div dir="rtl">
          <ColorPicker defaultValue={BLUE} onChange={onChange} />
        </div>
      )
      saturation().focus()
      await user.keyboard('{ArrowRight}')
      expect(onChange).toHaveBeenLastCalledWith({ ...BLUE, s: 79 })
    })

    it('reports every hue step and completes once on release (slider run)', () => {
      const onChange = vi.fn()
      const onChangeComplete = vi.fn()
      render(
        <ColorPicker
          defaultValue={BLUE}
          onChange={onChange}
          onChangeComplete={onChangeComplete}
        />
      )
      // Native range keyboard is not implemented by jsdom: drive the input's events (Slider precedent).
      fireEvent.change(hue(), { target: { value: '100' } })
      fireEvent.change(hue(), { target: { value: '120' } })
      expect(onChange).toHaveBeenCalledTimes(2)
      expect(onChangeComplete).not.toHaveBeenCalled()
      fireEvent.mouseUp(hue())
      expect(onChangeComplete).toHaveBeenCalledTimes(1)
      expect(onChangeComplete).toHaveBeenCalledWith({ ...BLUE, h: 120 })
    })

    it('shows the alpha track only with alpha, as a percentage', () => {
      const onChange = vi.fn()
      const { rerender } = render(<ColorPicker defaultValue={BLUE} />)
      expect(screen.queryByRole('slider', { name: 'Opacity' })).toBeNull()
      rerender(<ColorPicker defaultValue={BLUE} alpha onChange={onChange} />)
      const opacity = screen.getByRole('slider', { name: 'Opacity' })
      expect(opacity).toHaveValue('100')
      fireEvent.change(opacity, { target: { value: '25' } })
      expect(onChange).toHaveBeenLastCalledWith({ ...BLUE, a: 0.25 })
    })

    it('applies a typed hex on Enter, not while typing', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<ColorPicker defaultValue={BLUE} onChange={onChange} />)
      await user.clear(hexField())
      await user.type(hexField(), '#ff0000')
      expect(onChange).not.toHaveBeenCalled()
      expect(hexField()).toHaveValue('#ff0000')
      await user.keyboard('{Enter}')
      expect(onChange).toHaveBeenCalledWith({ h: 0, s: 100, v: 100, a: 1 })
      expect(swatch()).toHaveAccessibleName('vivid red')
    })

    it('toggles the automatic state, then back to the last colour', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<ColorPicker defaultValue={BLUE} nullable onChange={onChange} />)
      const toggle = screen.getByRole('button', { name: 'Automatic' })
      expect(toggle).toHaveAttribute('aria-pressed', 'false')

      await user.click(toggle)
      expect(onChange).toHaveBeenLastCalledWith(null)
      expect(toggle).toHaveAttribute('aria-pressed', 'true')
      expect(swatch()).toHaveAccessibleName('Automatic, no color selected')
      expect(swatch()).toHaveClass('ui-color-picker__swatch--auto')
      expect(hexField()).toHaveValue('')

      await user.click(toggle)
      expect(onChange).toHaveBeenLastCalledWith(BLUE)
    })

    it('follows a controlled value round-tripped through state', async () => {
      const user = userEvent.setup()
      function Controlled() {
        const [value, setValue] = useState<ColorValue>(BLUE)
        return (
          <>
            <ColorPicker value={value} onChange={setValue} />
            <output>{value === null ? 'none' : String(value.s)}</output>
          </>
        )
      }
      render(<Controlled />)
      saturation().focus()
      await user.keyboard('{Home}')
      expect(screen.getByText('0')).toBeInTheDocument()
      expect(hexField()).toHaveValue('#999999')
    })

    it('accepts a custom arrangement of parts', () => {
      render(
        <ColorPicker defaultValue={BLUE}>
          <ColorPicker.Swatch />
          <ColorPicker.Hue />
        </ColorPicker>
      )
      expect(swatch()).toBeInTheDocument()
      expect(hue()).toBeInTheDocument()
      expect(screen.queryByRole('group', { name: 'Color' })).toBeNull()
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('managed errors', () => {
    it('blocks every interaction when disabled', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<ColorPicker defaultValue={BLUE} disabled onChange={onChange} />)
      expect(saturation()).toBeDisabled()
      expect(hue()).toBeDisabled()
      expect(hexField()).toBeDisabled()
      expect(area().parentElement).toHaveClass('ui-color-picker--disabled')
      await user.pointer({
        keys: '[MouseLeft]',
        target: area(),
        coords: { clientX: 0, clientY: 0 },
      })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('shows a text error for an invalid hex on Enter, linked to the field', async () => {
      const user = userEvent.setup()
      render(<ColorPicker defaultValue={BLUE} />)
      await user.clear(hexField())
      await user.type(hexField(), 'nope{Enter}')
      const error = screen.getByRole('alert')
      expect(error).toHaveTextContent('Enter a hex color such as #1976d2')
      expect(hexField()).toHaveAttribute('aria-invalid', 'true')
      expect(hexField()).toHaveAttribute('aria-describedby', error.id)
    })

    it('discards an invalid draft on blur and restores the hex on Escape', async () => {
      const user = userEvent.setup()
      render(<ColorPicker defaultValue={BLUE} />)
      await user.clear(hexField())
      await user.type(hexField(), 'nope')
      await user.tab()
      expect(hexField()).toHaveValue(BLUE_HEX)

      await user.clear(hexField())
      await user.type(hexField(), '#123{Escape}')
      expect(hexField()).toHaveValue(BLUE_HEX)
      expect(screen.queryByRole('alert')).toBeNull()
    })

    it('throws when a part is used outside <ColorPicker>', () => {
      // React logs the thrown render error; silence it for this test only.
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined)
      expect(() => render(<ColorPicker.Swatch />)).toThrow(
        'ColorPicker parts must be used within <ColorPicker>'
      )
      consoleError.mockRestore()
    })
  })

  describe('unmanaged errors', () => {
    it('ignores a non-primary pointer button', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<ColorPicker defaultValue={BLUE} onChange={onChange} />)
      await user.pointer({
        keys: '[MouseRight]',
        target: area(),
        coords: { clientX: 0, clientY: 0 },
      })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('starts from the placeholder when a non-nullable picker gets a null default', () => {
      render(<ColorPicker defaultValue={null} />)
      expect(hexField()).toHaveValue('#ff0000')
    })
  })

  describe('edge cases', () => {
    it('puts the colour back when Escape is pressed during a drag', async () => {
      const user = userEvent.setup()
      const onChangeComplete = vi.fn()
      render(
        <ColorPicker defaultValue={BLUE} onChangeComplete={onChangeComplete} />
      )
      await user.pointer([
        {
          keys: '[MouseLeft>]',
          target: area(),
          coords: { clientX: 0, clientY: 100 },
        },
      ])
      expect(hexField()).toHaveValue('#000000')
      await user.keyboard('{Escape}')
      expect(hexField()).toHaveValue(BLUE_HEX)
      expect(onChangeComplete).not.toHaveBeenCalled()
    })

    it('announces settled changes in the live region', async () => {
      const user = userEvent.setup()
      render(<ColorPicker defaultValue={BLUE} />)
      expect(screen.getByRole('status')).toHaveTextContent('')
      saturation().focus()
      await user.keyboard('{End}')
      expect(screen.getByRole('status')).toHaveTextContent(/blue/)
    })

    it('does not call onChange on mount', () => {
      const onChange = vi.fn()
      render(<ColorPicker defaultValue={BLUE} onChange={onChange} />)
      expect(onChange).not.toHaveBeenCalled()
    })

    it('works under StrictMode (double mount)', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
        <StrictMode>
          <ColorPicker defaultValue={BLUE} onChange={onChange} />
        </StrictMode>
      )
      saturation().focus()
      await user.keyboard('{ArrowRight}')
      expect(onChange).toHaveBeenCalledWith({ ...BLUE, s: 81 })
    })

    it('can be driven from outside through an injected service', () => {
      const service = createColorPickerService({
        uid: 'ext',
        defaultValue: BLUE,
      })
      render(<ColorPicker service={service} />)
      act(() => {
        service.setColor({ h: 120, s: 100, v: 100, a: 1 })
      })
      expect(hexField()).toHaveValue('#00ff00')
      expect(hexField()).toHaveAttribute('id', 'ext-hex')
    })

    it('gives two pickers distinct ids', () => {
      render(
        <>
          <ColorPicker defaultValue={BLUE} />
          <ColorPicker defaultValue={BLUE} />
        </>
      )
      const ids = screen.getAllByRole('textbox').map((field) => field.id)
      expect(new Set(ids).size).toBe(2)
    })
  })
})
