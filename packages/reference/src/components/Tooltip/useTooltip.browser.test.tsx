import { render, screen } from '@testing-library/react'
import { StrictMode, useRef } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Modal } from '../Modal'

import { Tooltip } from './Tooltip'
import { useTooltip } from './useTooltip'

import type { UseTooltipOptions } from './useTooltip'

// Real Chromium: real hover, real focus and Tab, a real <dialog> for the Escape test. Short delays
// keep the suite fast; the delay logic itself is covered by the service tests on a manual clock.

/**
 * A trigger button wired to a Tooltip through useTooltip, plus a neighbour to move focus to.
 *
 * @param props - Hook options.
 * @returns The rendered fixture.
 */
function Fixture(props: UseTooltipOptions) {
  const ref = useRef<HTMLButtonElement>(null)
  const { open, triggerProps, bubbleProps } = useTooltip({
    openDelay: 30,
    closeDelay: 80,
    ...props,
  })
  return (
    <div style={{ padding: '60px' }}>
      <button ref={ref} type="button" {...triggerProps}>
        Save
      </button>
      <Tooltip
        content="Save your changes"
        visible={open}
        targetRef={ref}
        {...bubbleProps}
      />
      <button type="button">Other</button>
    </div>
  )
}

const trigger = () => screen.getByRole('button', { name: 'Save' })
const bubble = () => screen.queryByRole('tooltip')
const settle = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

describe('useTooltip (browser)', () => {
  // The real pointer stays where the previous test left it — possibly on this test's trigger, which
  // would legitimately hold the bubble open. Park it in a corner first.
  beforeEach(async () => {
    await userEvent.hover(document.documentElement, { position: { x: 1, y: 1 } })
  })

  describe('happy path', () => {
    it('opens on hover after the delay and describes its trigger', async () => {
      render(<Fixture />)
      await userEvent.hover(trigger())
      await vi.waitFor(() => {
        expect(bubble()).not.toBeNull()
      })
      expect(trigger()).toHaveAccessibleDescription('Save your changes')
    })

    it('opens at once on keyboard focus and closes when focus leaves', async () => {
      render(<Fixture openDelay={10_000} />)
      await userEvent.keyboard('{Tab}')
      expect(trigger()).toHaveFocus()
      expect(bubble()).not.toBeNull()
      // Keyboard only: make sure the pointer does not rest on the trigger (it would hold the bubble).
      await userEvent.unhover(trigger())
      await userEvent.keyboard('{Tab}')
      await vi.waitFor(() => {
        expect(bubble()).toBeNull()
      })
    })
  })

  describe('variants', () => {
    it('is dismissible: Escape closes it and focus stays on the trigger', async () => {
      render(<Fixture />)
      await userEvent.keyboard('{Tab}')
      await userEvent.keyboard('{Escape}')
      expect(bubble()).toBeNull()
      expect(trigger()).toHaveFocus()
    })

    it('is hoverable: the pointer can travel onto the bubble without it closing', async () => {
      render(<Fixture />)
      await userEvent.hover(trigger())
      await vi.waitFor(() => {
        expect(bubble()).not.toBeNull()
      })
      const tooltip = bubble()
      if (!tooltip) throw new Error('bubble not shown')
      await userEvent.hover(tooltip)
      await settle(200)
      expect(bubble()).not.toBeNull()

      await userEvent.unhover(tooltip)
      await vi.waitFor(() => {
        expect(bubble()).toBeNull()
      })
    })

    it('with describe: false hides the bubble from assistive technology', async () => {
      render(<Fixture describe={false} />)
      await userEvent.keyboard('{Tab}')
      expect(trigger()).not.toHaveAttribute('aria-describedby')
      expect(
        document.querySelector('.ui-tooltip')?.getAttribute('aria-hidden')
      ).toBe('true')
    })
  })

  describe('hover and focus are independent', () => {
    it('a keyboard-opened bubble survives the pointer passing over and out', async () => {
      render(<Fixture />)
      await userEvent.keyboard('{Tab}')
      await userEvent.hover(trigger())
      await userEvent.hover(document.documentElement, { position: { x: 1, y: 1 } })
      await settle(200)
      expect(bubble()).not.toBeNull()
    })

    it('a mouse click focuses without opening at once', async () => {
      render(<Fixture openDelay={10_000} />)
      await userEvent.click(trigger())
      expect(trigger()).toHaveFocus()
      expect(bubble()).toBeNull()
    })
  })

  describe('managed errors', () => {
    it('never opens while disabled', async () => {
      render(<Fixture disabled />)
      await userEvent.hover(trigger())
      await userEvent.keyboard('{Tab}')
      await settle(100)
      expect(bubble()).toBeNull()
    })

    it('inside a modal, Escape closes the tooltip only — the modal stays open', async () => {
      render(
        <Modal isOpen onClose={() => undefined} aria-label="Polity">
          <div style={{ background: 'white' }}>
            <Fixture />
          </div>
        </Modal>
      )
      await vi.waitFor(() => {
        expect(trigger()).toHaveFocus()
      })
      expect(bubble()).not.toBeNull()
      await userEvent.keyboard('{Escape}')
      expect(bubble()).toBeNull()
      expect(document.querySelector('dialog')?.open).toBe(true)
    })
  })

  describe('unmanaged errors', () => {
    it('leaves no timer behind when the trigger unmounts mid-delay', async () => {
      const onOpenChange = vi.fn()
      const { unmount } = render(
        <Fixture openDelay={300} onOpenChange={onOpenChange} />
      )
      await userEvent.hover(trigger())
      unmount()
      await settle(400)
      expect(onOpenChange).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('works under StrictMode’s double effects', async () => {
      render(
        <StrictMode>
          <Fixture />
        </StrictMode>
      )
      await userEvent.keyboard('{Tab}')
      expect(screen.getAllByRole('tooltip')).toHaveLength(1)
    })
  })
})
