import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'

import Slider from './Slider'

// Real Chromium: the native range keyboard jsdom does not implement (see known-issues).

describe('Slider (browser)', () => {
  describe('happy path', () => {
    it('steps with the arrow keys, through the native control', async () => {
      const onChange = vi.fn()
      render(
        <Slider aria-label="Volume" defaultValue={40} onChange={onChange} />
      )
      const slider = screen.getByRole('slider', { name: 'Volume' })
      slider.focus()
      await userEvent.keyboard('{ArrowRight}{ArrowRight}')
      expect(slider).toHaveValue('42')
      expect(onChange).toHaveBeenLastCalledWith(42)
    })
  })

  describe('variants', () => {
    it.each([
      ['{Home}', '0'],
      ['{End}', '100'],
      ['{ArrowDown}', '39'],
      ['{ArrowLeft}', '39'],
    ])('%s moves the value to %s', async (keys, expected) => {
      render(<Slider aria-label="Volume" defaultValue={40} />)
      const slider = screen.getByRole('slider', { name: 'Volume' })
      slider.focus()
      await userEvent.keyboard(keys)
      expect(slider).toHaveValue(expected)
    })

    it('reports the settled value on key release', async () => {
      const onChangeComplete = vi.fn()
      render(
        <Slider
          aria-label="Volume"
          defaultValue={40}
          onChangeComplete={onChangeComplete}
        />
      )
      screen.getByRole('slider', { name: 'Volume' }).focus()
      await userEvent.keyboard('{ArrowRight}')
      expect(onChangeComplete).toHaveBeenCalledWith(41)
    })
  })

  describe('managed errors', () => {
    it('ignores the keyboard when disabled (it cannot even take focus)', async () => {
      render(<Slider aria-label="Volume" defaultValue={40} disabled />)
      const slider = screen.getByRole('slider', { name: 'Volume' })
      slider.focus()
      expect(slider).not.toHaveFocus()
      await userEvent.keyboard('{ArrowRight}')
      expect(slider).toHaveValue('40')
    })
  })

  // L4: N/A — the value comes from the native control, which cannot produce a malformed number.

  describe('edge cases', () => {
    it('reverses the horizontal arrows under dir="rtl" (the platform does it)', async () => {
      render(
        <div dir="rtl">
          <Slider aria-label="Volume" defaultValue={40} />
        </div>
      )
      const slider = screen.getByRole('slider', { name: 'Volume' })
      slider.focus()
      await userEvent.keyboard('{ArrowRight}')
      expect(slider).toHaveValue('39')
    })

    it('stays at the bounds', async () => {
      render(<Slider aria-label="Volume" defaultValue={100} />)
      const slider = screen.getByRole('slider', { name: 'Volume' })
      slider.focus()
      await userEvent.keyboard('{ArrowRight}{PageUp}')
      expect(slider).toHaveValue('100')
    })
  })
})
