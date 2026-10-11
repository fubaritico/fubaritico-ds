import { render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Card } from '../Card'
import { Modal } from '../Modal'

import { Dropdown } from './Dropdown'

import type { DropdownProps } from './Dropdown.types'
import type { CSSProperties } from 'react'

// Real Chromium: the top layer, CSS anchor positioning, hit-testing, a real `<dialog>` and its
// inertness are the platform's — none of it exists under jsdom.

const OPTIONS = Array.from({ length: 6 }, (_, index) => ({
  value: `v${String(index)}`,
  label: `Option ${String(index)}`,
}))

/**
 * A controlled Dropdown named "Kind".
 *
 * @param props - Dropdown props to override.
 * @returns The rendered dropdown.
 */
function Kind(props: Partial<DropdownProps>) {
  const [value, setValue] = useState('v0')
  return (
    <Dropdown
      aria-label="Kind"
      options={OPTIONS}
      selectedValue={value}
      onSelect={setValue}
      {...props}
    />
  )
}

const trigger = () => screen.getByRole('button', { name: 'Kind' })
const menu = () => {
  const element = document.querySelector<HTMLElement>('.ui-dropdown__menu')
  if (!element) throw new Error('menu not rendered')
  return element
}
const control = () => {
  const element = document.querySelector<HTMLElement>('.ui-dropdown__control')
  if (!element) throw new Error('control not rendered')
  return element
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

describe('Dropdown (browser)', () => {
  describe('happy path', () => {
    it('opens in the top layer, below its control and at least as wide, with focus inside', async () => {
      render(
        <div style={{ padding: '40px', inlineSize: '240px' }}>
          <Kind />
        </div>
      )
      await userEvent.click(trigger())
      expect(menu().matches(':popover-open')).toBe(true)
      expect(screen.getByRole('listbox')).toHaveFocus()

      const controlBox = control().getBoundingClientRect()
      const menuBox = menu().getBoundingClientRect()
      expect(menuBox.top).toBeGreaterThanOrEqual(controlBox.bottom)
      expect(Math.abs(menuBox.left - controlBox.left)).toBeLessThan(1)
      expect(menuBox.width).toBeGreaterThanOrEqual(controlBox.width - 0.5)
    })

    it('selects with the keyboard from the selected option and returns focus to the trigger', async () => {
      render(<Kind />)
      await userEvent.click(trigger())
      // The cursor opens on the selected Option 0: two steps down is Option 2.
      await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(trigger()).toHaveFocus()
      expect(trigger()).toHaveTextContent('Option 2')
    })
  })

  describe('variants', () => {
    it('aligns to the end edge of the control with position="right"', async () => {
      render(
        <div style={{ padding: '40px 40px 40px 300px', inlineSize: '120px' }}>
          <Kind position="right" />
        </div>
      )
      await userEvent.click(trigger())
      const controlBox = control().getBoundingClientRect()
      const menuBox = menu().getBoundingClientRect()
      expect(Math.abs(menuBox.right - controlBox.right)).toBeLessThan(1)
    })

    it('opens above the control when there is no room below', async () => {
      render(
        <div style={{ position: 'fixed', insetInline: 0, bottom: '8px' }}>
          <Kind />
        </div>
      )
      await userEvent.click(trigger())
      const controlBox = control().getBoundingClientRect()
      const menuBox = menu().getBoundingClientRect()
      expect(menuBox.bottom).toBeLessThanOrEqual(controlBox.top)
    })

    it('stays anchored to its control when portalled', async () => {
      render(
        <div style={{ padding: '80px' }}>
          <Kind withPortal />
        </div>
      )
      await userEvent.click(trigger())
      expect(menu().parentElement).toBe(document.body)
      const controlBox = control().getBoundingClientRect()
      const menuBox = menu().getBoundingClientRect()
      expect(menuBox.top).toBeGreaterThanOrEqual(controlBox.bottom)
      expect(Math.abs(menuBox.left - controlBox.left)).toBeLessThan(1)
    })
  })

  describe('managed errors', () => {
    it('inside a Modal: every option is reachable and Escape closes the menu only', async () => {
      /**
       * A Modal holding a Card, which clips its content (`overflow: hidden`) — the layout a menu
       * opened near the dialog's edge used to be cut by.
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
            aria-label="Polity"
          >
            <Card style={{ inlineSize: '300px' }}>
              <Card.Body>
                <Kind />
              </Card.Body>
            </Card>
          </Modal>
        )
      }
      render(<InModal />)
      await userEvent.click(trigger())

      const last = screen.getByText('Option 5')
      expect(reachable(last)).toBe(true)

      await userEvent.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(document.querySelector('dialog')?.open).toBe(true)
      expect(trigger()).toHaveFocus()

      await userEvent.click(trigger())
      await userEvent.click(screen.getByText('Option 5'))
      expect(trigger()).toHaveTextContent('Option 5')
    })
  })

  describe('inside a Modal — Escape never closes the dialog while the menu is open', () => {
    /**
     * A Modal holding a Dropdown with the given options.
     *
     * @param props - The options.
     * @param props.options - Options of the Dropdown.
     * @returns The fixture.
     */
    function InModal({ options = OPTIONS }: { options?: typeof OPTIONS }) {
      const [open, setOpen] = useState(true)
      return (
        <Modal
          isOpen={open}
          onClose={() => {
            setOpen(false)
          }}
          aria-label="Polity"
        >
          <div style={{ padding: '40px', background: 'white' }}>
            <Kind
              options={options.map((o) => ({ ...o, disabled: true }))}
              selectedValue="v0"
            />
          </div>
        </Modal>
      )
    }
    const dialogOpen = () => document.querySelector('dialog')?.open

    it('with every option disabled', async () => {
      render(<InModal />)
      await userEvent.click(trigger())
      await userEvent.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(dialogOpen()).toBe(true)
    })

    it('after Shift+Tab back onto the trigger', async () => {
      render(<InModal />)
      await userEvent.click(trigger())
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
      expect(trigger()).toHaveFocus()
      await userEvent.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(dialogOpen()).toBe(true)
      // The next Escape is the dialog's.
      await userEvent.keyboard('{Escape}')
      expect(dialogOpen()).toBe(false)
    })
  })

  // L4: N/A — no async source; options are plain data.

  describe('edge cases', () => {
    it('keeps focus in the listbox when its chrome (a divider) is pressed', async () => {
      render(
        <Kind
          options={[
            { value: 'v0', label: 'Option 0' },
            { value: 'v1', label: 'Option 1', dividerBefore: true },
          ]}
        />
      )
      await userEvent.click(trigger())
      await userEvent.click(screen.getByRole('separator'))
      expect(screen.getByRole('listbox')).toHaveFocus()
    })

    it('escapes an overflow-hidden ancestor and a z-index 9999 layer', async () => {
      const clip: CSSProperties = {
        overflow: 'hidden',
        blockSize: '48px',
        position: 'relative',
        zIndex: 1,
      }
      render(
        <>
          <div style={clip}>
            <Kind />
          </div>
          <div
            style={{
              position: 'relative',
              zIndex: 9999,
              blockSize: '200px',
              background: 'white',
            }}
          />
        </>
      )
      await userEvent.click(trigger())
      expect(reachable(screen.getByText('Option 5'))).toBe(true)
    })
  })
})
