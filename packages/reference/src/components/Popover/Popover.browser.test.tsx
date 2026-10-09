import { act, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'

import { createPopoverService } from '@fubaritico/behaviors'

import Popover from './Popover'

// Real Chromium: top layer, anchor positioning, Escape / light dismiss and focus return are the
// platform's — none of it exists under jsdom.

/**
 * A popover with a focusable field inside, plus an outside button.
 *
 * @param props - Popover props.
 * @returns The rendered fixture.
 */
function Fixture(props: Partial<Parameters<typeof Popover>[0]>) {
  return (
    <div style={{ padding: '40px' }}>
      <Popover label="Settings" {...props}>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>
          <input aria-label="Inside" />
        </Popover.Content>
      </Popover>
      <button type="button">Outside</button>
    </div>
  )
}

const trigger = () => screen.getByRole('button', { name: 'Open' })
// A closed popover is display:none: Testing Library computes no name for it, so query the class.
const surface = () => {
  const element = document.querySelector<HTMLElement>('.ui-popover')
  if (!element) throw new Error('popover surface not rendered')
  return element
}
const isOpen = () => surface().matches(':popover-open')

describe('Popover (browser)', () => {
  describe('happy path', () => {
    it('opens below its trigger and moves focus inside', async () => {
      const onOpenChange = vi.fn()
      render(<Fixture onOpenChange={onOpenChange} />)
      expect(isOpen()).toBe(false)
      await userEvent.click(trigger())
      expect(isOpen()).toBe(true)
      expect(onOpenChange).toHaveBeenCalledWith(true)
      expect(trigger()).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByRole('dialog', { name: 'Settings' })).toBe(surface())
      expect(screen.getByRole('textbox', { name: 'Inside' })).toHaveFocus()

      const triggerBox = trigger().getBoundingClientRect()
      const surfaceBox = surface().getBoundingClientRect()
      expect(surfaceBox.top).toBeGreaterThanOrEqual(triggerBox.bottom)
      expect(Math.abs(surfaceBox.left - triggerBox.left)).toBeLessThan(2)
    })
  })

  describe('variants', () => {
    it('closes on Escape and gives focus back to the trigger', async () => {
      const onOpenChange = vi.fn()
      render(<Fixture onOpenChange={onOpenChange} />)
      await userEvent.click(trigger())
      await userEvent.keyboard('{Escape}')
      expect(isOpen()).toBe(false)
      expect(onOpenChange).toHaveBeenLastCalledWith(false)
      expect(trigger()).toHaveFocus()
      expect(trigger()).toHaveAttribute('aria-expanded', 'false')
    })

    it('closes on a click outside', async () => {
      render(<Fixture />)
      await userEvent.click(trigger())
      await userEvent.click(screen.getByRole('button', { name: 'Outside' }))
      expect(isOpen()).toBe(false)
    })

    it('toggles closed from its trigger', async () => {
      render(<Fixture />)
      await userEvent.click(trigger())
      await userEvent.click(trigger())
      expect(isOpen()).toBe(false)
    })

    it('follows a controlled open state', async () => {
      function Controlled() {
        const [open, setOpen] = useState(false)
        return (
          <>
            <button type="button" onClick={() => setOpen(true)}>
              External
            </button>
            <Fixture open={open} onOpenChange={setOpen} />
          </>
        )
      }
      render(<Controlled />)
      await userEvent.click(screen.getByRole('button', { name: 'External' }))
      expect(isOpen()).toBe(true)
      await userEvent.keyboard('{Escape}')
      expect(isOpen()).toBe(false)
    })
  })

  describe('managed errors', () => {
    it('stays shut when a controlled parent refuses to open', async () => {
      render(<Fixture open={false} />)
      await userEvent.click(trigger())
      // The native click opened it; the service, still controlled at false, closes it back.
      expect(isOpen()).toBe(false)
    })
  })

  describe('unmanaged errors', () => {
    it('is driven by an injected service from outside the tree', () => {
      const service = createPopoverService({ uid: 'ext', label: 'Settings' })
      render(<Fixture service={service} />)
      act(() => {
        service.setOpen(true)
      })
      expect(isOpen()).toBe(true)
    })

    it('keeps the options of an injected service when no prop overrides them', () => {
      const service = createPopoverService({
        uid: 'own',
        label: 'Own label',
        defaultOpen: true,
      })
      render(
        <Popover service={service}>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>Body</Popover.Content>
        </Popover>
      )
      expect(isOpen()).toBe(true)
      expect(surface()).toHaveAttribute('aria-label', 'Own label')
    })
  })

  describe('edge cases', () => {
    it('renders above everything: a z-index 9999 layer and an overflow-hidden ancestor', async () => {
      render(
        <>
          <div
            style={{
              overflow: 'hidden',
              blockSize: '60px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Fixture />
          </div>
          <div
            data-testid="blocker"
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
      const box = surface().getBoundingClientRect()
      // Not clipped by the 60px ancestor…
      expect(box.height).toBeGreaterThan(0)
      // …and on top of the z-index 9999 layer: hit-testing its centre lands on the surface.
      const hit = document.elementFromPoint(
        box.left + box.width / 2,
        box.top + box.height / 2
      )
      expect(surface().contains(hit)).toBe(true)
    })

    it('stays hidden while closed (no author display leaks the UA rule)', () => {
      render(<Fixture />)
      expect(getComputedStyle(surface()).display).toBe('none')
    })
  })
})
