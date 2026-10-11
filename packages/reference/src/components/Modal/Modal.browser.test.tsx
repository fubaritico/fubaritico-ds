import { render, screen } from '@testing-library/react'
import { StrictMode, createRef, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'

import Modal from './Modal'

import type { ModalProps } from './Modal'

// Real Chromium: `showModal()`, the top layer, the focus trap, inertness, Escape and the UA rule
// `dialog:not([open]) { display: none }` are the platform's — jsdom implements none of them.

/** Props a test may override on the fixture's Modal. */
type FixtureProps = Partial<Omit<ModalProps, 'isOpen' | 'aria-label'>> & {
  /** Initial open state. */
  defaultOpen?: boolean
}

/**
 * A trigger, a Modal holding a padded panel with a button, and an outside button.
 *
 * @param props - {@link FixtureProps}.
 * @returns The rendered fixture.
 */
function Fixture({ defaultOpen = false, onClose, ...props }: FixtureProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <button type="button">Outside</button>
      <Modal
        aria-label="Confirm"
        isOpen={open}
        onClose={() => {
          setOpen(false)
          onClose?.()
        }}
        {...props}
      >
        <div
          data-testid="panel"
          style={{ padding: '40px', background: 'white' }}
        >
          <button type="button">Inside</button>
        </div>
      </Modal>
    </>
  )
}

// A closed dialog is display:none: Testing Library computes no role for it, so query the class.
const dialog = () => {
  const element = document.querySelector<HTMLDialogElement>('.ui-modal')
  if (!element) throw new Error('modal not rendered')
  return element
}
const isModal = () => dialog().matches(':modal')
const display = () => getComputedStyle(dialog()).display
const openButton = () => screen.getByRole('button', { name: 'Open' })

/** An unlayered consumer rule forcing a layout — it beats any layered skin rule. */
const FORCE_DISPLAY = '.force-display { display: grid; }'

afterEach(() => {
  document.body.style.overflow = ''
})

describe('Modal (browser)', () => {
  describe('happy path', () => {
    it('opens as a true modal: top layer, focus inside, page locked', async () => {
      render(<Fixture />)
      expect(isModal()).toBe(false)
      await userEvent.click(openButton())

      expect(isModal()).toBe(true)
      expect(screen.getByRole('dialog', { name: 'Confirm' })).toBe(dialog())
      expect(dialog().contains(document.activeElement)).toBe(true)
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('paints above a z-index 9999 layer', async () => {
      render(
        <>
          <Fixture />
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
      await userEvent.click(openButton())
      const panel = screen.getByTestId('panel')
      const box = panel.getBoundingClientRect()
      const hit = document.elementFromPoint(
        box.left + box.width / 2,
        box.top + box.height / 2
      )
      expect(panel.contains(hit)).toBe(true)
    })
  })

  describe('variants', () => {
    it('closes on Escape and gives focus back to the trigger', async () => {
      const onClose = vi.fn()
      render(<Fixture onClose={onClose} />)
      await userEvent.click(openButton())
      await userEvent.keyboard('{Escape}')

      expect(isModal()).toBe(false)
      expect(onClose).toHaveBeenCalledOnce()
      expect(openButton()).toHaveFocus()
      expect(document.body.style.overflow).toBe('')
    })

    it('closes on a backdrop click, not on a click in the panel', async () => {
      const onClose = vi.fn()
      render(<Fixture onClose={onClose} />)
      await userEvent.click(openButton())

      await userEvent.click(screen.getByTestId('panel'), {
        position: { x: 5, y: 5 },
      })
      expect(isModal()).toBe(true)

      // The shell spans the viewport: its top-left corner is backdrop.
      await userEvent.click(dialog(), { position: { x: 2, y: 2 } })
      expect(isModal()).toBe(false)
      expect(onClose).toHaveBeenCalledOnce()
      expect(openButton()).toHaveFocus()
    })

    it('routes a backdrop click to onOverlayClick instead of closing', async () => {
      const onClose = vi.fn()
      const onOverlayClick = vi.fn()
      render(<Fixture onClose={onClose} onOverlayClick={onOverlayClick} />)
      await userEvent.click(openButton())
      await userEvent.click(dialog(), { position: { x: 2, y: 2 } })

      expect(onOverlayClick).toHaveBeenCalledOnce()
      expect(onClose).not.toHaveBeenCalled()
      expect(isModal()).toBe(true)
    })
  })

  describe('managed errors', () => {
    it('makes the rest of the page inert while open', async () => {
      render(<Fixture />)
      await userEvent.click(openButton())
      const outside = screen.getByRole('button', {
        name: 'Outside',
        hidden: true,
      })

      outside.focus()
      expect(outside).not.toHaveFocus()
      const box = outside.getBoundingClientRect()
      expect(document.elementFromPoint(box.left + 1, box.top + 1)).not.toBe(
        outside
      )
    })

    it('never lets Tab or Shift+Tab reach the page behind', async () => {
      render(<Fixture />)
      await userEvent.click(openButton())
      const outside = screen.getByRole('button', {
        name: 'Outside',
        hidden: true,
      })

      for (const shift of [false, true]) {
        for (let i = 0; i < 4; i++) {
          await userEvent.tab({ shift })
          // Past the last control focus may leave the document for the browser UI — never for
          // the inert page.
          expect(document.activeElement).not.toBe(outside)
          expect(document.activeElement).not.toBe(openButton())
        }
      }
    })

    it('stays hidden while closed — before and after an open/close cycle', async () => {
      render(<Fixture />)
      expect(display()).toBe('none')

      await userEvent.click(openButton())
      expect(display()).toBe('grid')

      await userEvent.keyboard('{Escape}')
      expect(display()).toBe('none')
    })
  })

  describe('unmanaged errors', () => {
    it('stays hidden while closed even when the consumer forces a display', () => {
      render(
        <>
          <style>{FORCE_DISPLAY}</style>
          <Fixture className="force-display" />
        </>
      )
      expect(display()).toBe('none')
    })

    it('stays hidden while closed even with an inline display', async () => {
      render(<Fixture style={{ display: 'grid' }} />)
      expect(display()).toBe('none')
      // …and the forced layout applies once open, the guard only covers the closed state.
      await userEvent.click(openButton())
      expect(display()).toBe('grid')
    })

    it('still opens when the consumer passes its own ref', async () => {
      const ref = createRef<HTMLDialogElement>()
      render(<Fixture ref={ref} />)
      await userEvent.click(openButton())

      expect(ref.current).toBe(dialog())
      expect(isModal()).toBe(true)
    })

    it('gives the host its own overflow back on close', async () => {
      document.body.style.overflow = 'clip'
      render(<Fixture />)
      await userEvent.click(openButton())
      expect(document.body.style.overflow).toBe('hidden')

      await userEvent.keyboard('{Escape}')
      expect(document.body.style.overflow).toBe('clip')
    })
  })

  describe('edge cases', () => {
    it('does not report a close under StrictMode’s mount / unmount / mount', async () => {
      const onClose = vi.fn()
      render(
        <StrictMode>
          <Fixture defaultOpen onClose={onClose} />
        </StrictMode>
      )
      // The close event of the simulated unmount is queued as a task: let it run.
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(onClose).not.toHaveBeenCalled()
      expect(isModal()).toBe(true)
    })

    it('releases the scroll lock when unmounted while open', () => {
      const { unmount } = render(<Fixture defaultOpen />)
      expect(isModal()).toBe(true)
      expect(document.body.style.overflow).toBe('hidden')

      unmount()
      expect(document.body.style.overflow).toBe('')
    })
  })
})
