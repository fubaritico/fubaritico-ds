import { render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Card } from '../Card'
import { Modal } from '../Modal'

import MultiSelect from './MultiSelect'

import type { MultiSelectProps } from './MultiSelect'
import type { MultiSelectOption } from '@fubaritico/behaviors'

// Real Chromium: the top layer, CSS anchor positioning, flex wrapping, hit-testing, `:has()` with
// `:focus-visible` and a real `<dialog>` are the platform's — none of it exists under jsdom.

const REASONS: MultiSelectOption[] = [
  { value: 'port', label: 'Port' },
  { value: 'pilgrimage', label: 'Pèlerinage' },
  { value: 'fair', label: 'Foire' },
  { value: 'bishopric', label: 'Évêché' },
  { value: 'university', label: 'Université' },
  { value: 'capital', label: 'Capitale' },
]

/**
 * A controlled MultiSelect.
 *
 * @param props - Props to override.
 * @returns The rendered field.
 */
function Reasons(props: Partial<MultiSelectProps>) {
  const [value, setValue] = useState<string[]>(
    props.defaultValue ? [...props.defaultValue] : []
  )
  return (
    <MultiSelect
      label="Reasons"
      options={REASONS}
      {...props}
      defaultValue={undefined}
      value={value}
      onChange={setValue}
    />
  )
}

const combobox = () => screen.getByRole('combobox', { name: 'Reasons' })
const listbox = () => screen.getByRole('listbox')
const control = () => {
  const node = document.querySelector('.ui-multi-select__control')
  if (!(node instanceof HTMLElement)) throw new Error('control not rendered')
  return node
}

/**
 * Whether a pointer at the centre of the element would reach it — nothing paints over it, nothing
 * clips it, and it is not inert.
 *
 * @param element - The element to hit-test.
 * @returns `true` when the element (or a descendant) is the hit target.
 */
function reachable(element: HTMLElement) {
  const box = element.getBoundingClientRect()
  const hit = document.elementFromPoint(
    box.left + box.width / 2,
    box.top + box.height / 2
  )
  return hit !== null && element.contains(hit)
}

describe('MultiSelect (browser)', () => {
  describe('happy path', () => {
    it('opens in the top layer, under the control and as wide, focus kept in the input', async () => {
      render(
        <div style={{ padding: '40px', inlineSize: '320px' }}>
          <Reasons />
        </div>
      )
      await userEvent.click(combobox())
      expect(listbox().matches(':popover-open')).toBe(true)
      expect(combobox()).toHaveFocus()

      const controlBox = control().getBoundingClientRect()
      const menuBox = listbox().getBoundingClientRect()
      expect(menuBox.top).toBeGreaterThanOrEqual(controlBox.bottom)
      expect(Math.abs(menuBox.left - controlBox.left)).toBeLessThan(1)
      expect(Math.abs(menuBox.width - controlBox.width)).toBeLessThan(1)
    })

    it('keeps focus in the input when an option is pressed', async () => {
      render(<Reasons />)
      await userEvent.click(combobox())
      await userEvent.click(screen.getByRole('option', { name: 'Port' }))
      expect(screen.getByRole('button', { name: 'Remove Port' })).toBeVisible()
      expect(combobox()).toHaveFocus()
    })
  })

  describe('variants', () => {
    it('wraps the badges onto several lines in a narrow field', () => {
      render(
        <div style={{ inlineSize: '220px' }}>
          <Reasons defaultValue={REASONS.map((reason) => reason.value)} />
        </div>
      )
      const badges = [...document.querySelectorAll('.ui-badge')]
      const rows = new Set(
        badges.map((badge) => Math.round(badge.getBoundingClientRect().top))
      )
      expect(rows.size).toBeGreaterThan(1)
      // The control grows with its content and stays inside its column.
      expect(control().getBoundingClientRect().width).toBeLessThanOrEqual(220)
    })

    it('draws the focus ring around the whole control when the input has focus', async () => {
      render(<Reasons />)
      await userEvent.click(combobox())
      expect(getComputedStyle(control()).outlineStyle).toBe('solid')
      await userEvent.keyboard('{Escape}')
      ;(document.activeElement as HTMLElement | null)?.blur()
      expect(getComputedStyle(control()).outlineStyle).toBe('none')
    })
  })

  describe('managed errors', () => {
    it('inside a Modal: every option is reachable and Escape closes the menu only', async () => {
      /**
       * A Modal holding a Card, which clips its content (`overflow: hidden`).
       *
       * @returns The fixture.
       */
      function InModal() {
        const [open, setOpen] = useState(true)
        return (
          <Modal
            isOpen={open}
            onClose={() => {
              setOpen(false)
            }}
            aria-label="City"
          >
            <Card style={{ inlineSize: '320px' }}>
              <Card.Body>
                <Reasons />
              </Card.Body>
            </Card>
          </Modal>
        )
      }
      render(<InModal />)
      await userEvent.click(combobox())
      expect(reachable(screen.getByRole('option', { name: 'Capitale' }))).toBe(
        true
      )
      await userEvent.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(document.querySelector('dialog')?.open).toBe(true)
      expect(combobox()).toHaveFocus()
    })
  })

  // L4: N/A — the options are the consumer's; the service tests cover malformed values.

  describe('edge cases', () => {
    it('gives the remove button a 24px hit area around its 16px glyph', () => {
      render(<Reasons defaultValue={['port']} />)
      const button = screen.getByRole('button', { name: 'Remove Port' })
      const box = button.getBoundingClientRect()
      expect(box.width).toBe(16)
      // A press 3px outside the glyph still lands on the button (its ::before overflows by 4px).
      const hit = document.elementFromPoint(
        box.right + 3,
        box.top + box.height / 2
      )
      expect(hit).toBe(button)
    })

    it('opens above the control when there is no room below', async () => {
      render(
        <div style={{ position: 'fixed', insetInline: 0, bottom: '8px' }}>
          <Reasons />
        </div>
      )
      await userEvent.click(combobox())
      expect(listbox().getBoundingClientRect().bottom).toBeLessThanOrEqual(
        control().getBoundingClientRect().top
      )
    })
  })
})
