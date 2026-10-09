import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import ColorField from './ColorField'

import type { HsvaColor } from '../ColorPicker'

// jsdom: the field's wiring. The popover itself (top layer, focus, Escape) is browser-tested.

const BLUE: HsvaColor = { h: 210, s: 80, v: 60, a: 1 }
const BLUE_HEX = '#1f5c99'

const trigger = () => screen.getByRole('button', { name: 'Choose color Fill' })
const hexField = () => screen.getByRole('textbox', { name: 'Hex color Fill' })

describe('ColorField', () => {
  describe('happy path', () => {
    it('renders a labelled field: swatch button and hex input', () => {
      render(<ColorField label="Fill" defaultValue={BLUE} />)
      expect(screen.getByRole('group', { name: 'Fill' })).toBeInTheDocument()
      expect(screen.getByText('Fill')).toHaveClass('ui-color-field__label')
      expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog')
      expect(hexField()).toHaveValue(BLUE_HEX)
    })
  })

  describe('variants', () => {
    it('passes the compact density to the picker it composes', () => {
      render(<ColorField label="Fill" defaultValue={BLUE} density="compact" />)
      expect(screen.getByRole('group', { name: 'Fill' })).toHaveClass(
        'ui-color-picker--compact'
      )
    })

    it('edits the colour from the hex field directly', async () => {
      const user = userEvent.setup()
      const onChangeComplete = vi.fn()
      render(<ColorField label="Fill" defaultValue={BLUE} onChangeComplete={onChangeComplete} />)
      await user.clear(hexField())
      await user.type(hexField(), '#00ff00{Enter}')
      expect(onChangeComplete).toHaveBeenCalledWith({ h: 120, s: 100, v: 100, a: 1 })
    })

    it('names the popover after the field and the trigger after triggerLabel', () => {
      render(<ColorField label="Fill" defaultValue={BLUE} triggerLabel="Pick fill" />)
      expect(screen.getByRole('button', { name: 'Pick fill Fill' })).toBeInTheDocument()
      expect(screen.getByRole('dialog', { name: 'Fill', hidden: true })).toBeInTheDocument()
    })

    it('puts the panel inside the popover', () => {
      render(<ColorField label="Fill" defaultValue={BLUE} alpha nullable />)
      const dialog = screen.getByRole('dialog', { name: 'Fill', hidden: true })
      expect(dialog.querySelector('.ui-color-picker__area')).not.toBeNull()
      expect(dialog.querySelectorAll('.ui-color-picker__track')).toHaveLength(2)
    })
  })

  describe('managed errors', () => {
    it('disables the swatch button and the hex input', () => {
      render(<ColorField label="Fill" defaultValue={BLUE} disabled />)
      expect(trigger()).toBeDisabled()
      expect(hexField()).toBeDisabled()
    })
  })

  describe('unmanaged errors', () => {
    it('starts from the placeholder for a null default on a non-nullable field', () => {
      render(<ColorField label="Fill" defaultValue={null} />)
      expect(hexField()).toHaveValue('#ff0000')
    })
  })

  describe('edge cases', () => {
    it('hides the swatch from assistive technology inside the named button', () => {
      render(<ColorField label="Fill" defaultValue={BLUE} />)
      expect(trigger().querySelector('[role="img"]')).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
