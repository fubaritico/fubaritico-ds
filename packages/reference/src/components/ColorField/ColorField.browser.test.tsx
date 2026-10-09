import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'

import { pointer } from '../../../vitest.browser.pointer'
import { Modal } from '../Modal'
import ColorField from './ColorField'

import type { HsvaColor } from '../ColorPicker'

// Real Chromium: the picker lives in a top-layer popover, which only a browser renders.

const BLUE: HsvaColor = { h: 210, s: 80, v: 60, a: 1 }
/** rgb(31, 92, 153), worked out by hand in the service tests. */
const BLUE_HEX = '#1f5c99'

const trigger = () => screen.getByRole('button', { name: 'Choose color Fill' })
const hexField = () => screen.getByRole('textbox', { name: 'Hex color Fill' })
const popoverOpen = () =>
  document.querySelector('.ui-popover')?.matches(':popover-open') ?? false

describe('ColorField (browser)', () => {
  describe('happy path', () => {
    it('opens the picker from the swatch, focus inside, and closes on Escape back to the swatch', async () => {
      render(<ColorField label="Fill" defaultValue={BLUE} />)
      expect(screen.getByRole('group', { name: 'Fill' })).toBeInTheDocument()
      expect(hexField()).toHaveValue(BLUE_HEX)

      await userEvent.click(trigger())
      expect(popoverOpen()).toBe(true)
      expect(screen.getByRole('slider', { name: 'Saturation' })).toHaveFocus()

      await userEvent.keyboard('{Escape}')
      expect(popoverOpen()).toBe(false)
      expect(trigger()).toHaveFocus()
    })

    it('shares one colour between the popover and the field', async () => {
      const onChangeComplete = vi.fn()
      render(
        <ColorField
          label="Fill"
          defaultValue={BLUE}
          onChangeComplete={onChangeComplete}
        />
      )
      await userEvent.click(trigger())
      await pointer.pointerDown('.ui-color-picker__area', { x: 0.5, y: 0.5 })
      await pointer.pointerUp()
      expect(onChangeComplete).toHaveBeenCalledTimes(1)
      expect(hexField()).not.toHaveValue(BLUE_HEX)
      // Still open: picking a colour does not close the panel.
      expect(popoverOpen()).toBe(true)
    })
  })

  describe('variants', () => {
    it('opens a tighter panel in the compact density: narrower, with a 2:1 area', async () => {
      const measure = async (density: 'default' | 'compact') => {
        const { unmount } = render(
          <ColorField label="Fill" defaultValue={BLUE} density={density} />
        )
        await userEvent.click(trigger())
        const panel = document.querySelector('.ui-popover')?.getBoundingClientRect()
        const area = document
          .querySelector('.ui-color-picker__area')
          ?.getBoundingClientRect()
        unmount()
        if (!panel || !area) throw new Error('panel not rendered')
        return { panel, area }
      }
      const normal = await measure('default')
      const compact = await measure('compact')
      expect(compact.panel.width).toBeLessThan(normal.panel.width)
      expect(compact.panel.height).toBeLessThan(normal.panel.height * 0.75)
      expect(compact.area.width / compact.area.height).toBeCloseTo(2, 1)
      expect(normal.area.width / normal.area.height).toBeCloseTo(4 / 3, 1)
    })

    it('applies a typed hex without opening anything', async () => {
      const onChange = vi.fn()
      render(
        <ColorField label="Fill" defaultValue={BLUE} onChange={onChange} />
      )
      await userEvent.clear(hexField())
      await userEvent.type(hexField(), '#ff0000{Enter}')
      expect(onChange).toHaveBeenLastCalledWith({ h: 0, s: 100, v: 100, a: 1 })
      expect(popoverOpen()).toBe(false)
    })

    it('offers the automatic state inside the popover when nullable', async () => {
      const onChange = vi.fn()
      render(
        <ColorField
          label="Fill"
          defaultValue={BLUE}
          nullable
          onChange={onChange}
        />
      )
      await userEvent.click(trigger())
      await userEvent.click(screen.getByRole('button', { name: 'Automatic' }))
      expect(onChange).toHaveBeenLastCalledWith(null)
      expect(hexField()).toHaveValue('')
      expect(hexField()).toHaveAttribute('placeholder', 'Automatic')
    })

    it('follows a controlled open state', () => {
      render(<ColorField label="Fill" defaultValue={BLUE} open />)
      expect(popoverOpen()).toBe(true)
    })
  })

  describe('managed errors', () => {
    it('cannot be opened when disabled', async () => {
      render(<ColorField label="Fill" defaultValue={BLUE} disabled />)
      expect(trigger()).toBeDisabled()
      expect(hexField()).toBeDisabled()
    })
  })

  // L4: N/A — the field adds no input of its own; malformed values are the ColorPicker's tests.

  describe('edge cases', () => {
    it('opens on top of a modal dialog, stays usable, and Escape closes only the popover', async () => {
      const onClose = vi.fn()
      const onChangeComplete = vi.fn()
      render(
        <Modal isOpen onClose={onClose} aria-label="Edit layer">
          <ColorField
            label="Fill"
            defaultValue={BLUE}
            onChangeComplete={onChangeComplete}
          />
        </Modal>
      )
      const dialog = screen.getByRole('dialog', { name: 'Edit layer' })
      expect(dialog.matches(':modal')).toBe(true)

      await userEvent.click(trigger())
      expect(popoverOpen()).toBe(true)
      // Painted above the modal: the topmost element at the panel's centre belongs to the panel.
      const panel = document.querySelector<HTMLElement>('.ui-popover')
      if (!panel) throw new Error('popover surface not rendered')
      const box = panel.getBoundingClientRect()
      const hit = document.elementFromPoint(
        box.left + box.width / 2,
        box.top + box.height / 2
      )
      expect(panel.contains(hit)).toBe(true)
      expect(screen.getByRole('slider', { name: 'Saturation' })).toHaveFocus()

      // Not inert: the panel lives inside the dialog's subtree (no portal), so it takes input.
      await pointer.pointerDown('.ui-color-picker__area', { x: 0.5, y: 0.5 })
      await pointer.pointerUp()
      expect(onChangeComplete).toHaveBeenCalledTimes(1)

      await userEvent.keyboard('{Escape}')
      expect(popoverOpen()).toBe(false)
      expect(onClose).not.toHaveBeenCalled()
      expect(dialog).toHaveAttribute('open')
      expect(trigger()).toHaveFocus()
    })

    it('renders the popover above a z-index 9999 layer', async () => {
      render(
        <>
          <ColorField label="Fill" defaultValue={BLUE} />
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          />
        </>
      )
      await userEvent.click(trigger())
      const area = document
        .querySelector('.ui-color-picker__area')
        ?.getBoundingClientRect()
      if (!area) throw new Error('area not rendered')
      const hit = document.elementFromPoint(
        area.left + area.width / 2,
        area.top + area.height / 2
      )
      expect(hit?.closest('.ui-popover')).not.toBeNull()
    })

    it('gives the swatch button a fixed name, not the colour words', () => {
      render(
        <ColorField label="Fill" defaultValue={BLUE} triggerLabel="Pick fill" />
      )
      expect(
        screen.getByRole('button', { name: 'Pick fill Fill' })
      ).toBeInTheDocument()
    })
  })
})
