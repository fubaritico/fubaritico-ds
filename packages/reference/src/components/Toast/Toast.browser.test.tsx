import { act, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'

import { TOAST_LEAVE_DURATION, createToaster } from '@fubaritico/behaviors'

import { Modal } from '../Modal'

import { createToastApi } from './toast'
import { Toaster } from './Toaster'

import type { ToastApi } from './toast'
import type { ReactToastContent, ToasterProps } from './Toast.types'
import type { ReactNode } from 'react'

// Real Chromium with the real tokens and skin: the top layer, a modal `<dialog>` and the inertness
// it casts on the rest of the page, real key presses, hit-testing, computed styles. Motion is reduced
// for the whole project (vitest.config.ts): the slide is off, the fade keeps its duration.

/**
 * A toaster of its own (real timers) and the toast API bound to it.
 *
 * @param leaveDuration - The machine's exit length; its default unless given.
 * @returns The toaster, the API, and the props binding a Toaster to it.
 */
function setup(leaveDuration?: number) {
  const toaster = createToaster<ReactToastContent>({
    uid: 'browser',
    ...(leaveDuration === undefined ? {} : { leaveDuration }),
  })
  const toast = createToastApi(() => toaster)
  const props: Partial<ToasterProps> = { toaster }
  return { toaster, toast, props }
}

/**
 * Runs a toast call inside `act`.
 *
 * @param call - What to run.
 */
const run = (call: () => unknown) => {
  act(() => {
    call()
  })
}

const region = () => screen.getByRole('region', { name: 'Notifications (F8)' })

/**
 * Whether a point lands on an element or inside it.
 *
 * @param element - The element.
 * @param x - The point's x.
 * @param y - The point's y.
 * @returns `true` when the hit test reaches it.
 */
const hits = (element: Element, x: number, y: number) => {
  const hit = document.elementFromPoint(x, y)
  return hit === element || element.contains(hit)
}

/**
 * Whether the element is painted on top at its own centre.
 *
 * @param element - The element.
 * @returns `true` when nothing covers it.
 */
const paintedOnTop = (element: Element) => {
  const rect = element.getBoundingClientRect()
  return hits(element, rect.x + rect.width / 2, rect.y + rect.height / 2)
}

/**
 * The vertical centre of an element.
 *
 * @param element - The element.
 * @returns Its centre's y, in px.
 */
const centreY = (element: Element) => {
  const rect = element.getBoundingClientRect()
  return rect.top + rect.height / 2
}

/**
 * The three parts of a message toast that must line up: its glyph, its title, its close button.
 *
 * @param item - The toast's `<li>`.
 * @returns The glyph's SVG, the title, the close button.
 */
const parts = (item: Element): Element[] => {
  const found = [
    item.querySelector('.ui-toast__icon svg'),
    item.querySelector('.ui-toast__title'),
    item.querySelector('.ui-toast__close'),
  ]
  return found.map((part) => {
    if (!part) throw new Error('a toast part is missing')
    return part
  })
}

/** Props of {@link PageWithModal}. */
interface PageWithModalProps {
  /** The Toaster props. */
  props: Partial<ToasterProps>
  /** Called with `close` — the Modal's content. */
  children: (close: () => void) => ReactNode
  /** Called when the Modal asks to close (Escape, backdrop). */
  onClose?: () => void
}

/**
 * A page with its Toaster and an open Modal, closed from its own content.
 *
 * @param props - {@link PageWithModalProps}.
 * @param props.props - The Toaster props.
 * @param props.children - The Modal's content, given `close`.
 * @param props.onClose - Called when the Modal asks to close.
 * @returns The page.
 */
function PageWithModal({ props, children, onClose }: PageWithModalProps) {
  // Whether the Modal is open.
  const [open, setOpen] = useState(true)
  const close = () => {
    setOpen(false)
  }
  return (
    <>
      <Toaster {...props} />
      <Modal
        isOpen={open}
        onClose={() => {
          onClose?.()
          close()
        }}
        aria-label="Edit"
      >
        {children(close)}
      </Modal>
    </>
  )
}

/**
 * Renders a page whose Modal is open, and shows a toast that stays.
 *
 * @param toast - The toast API.
 * @param props - The Toaster props.
 * @param onClose - Called when the Modal asks to close.
 */
function renderOverModal(
  toast: ToastApi,
  props: Partial<ToasterProps>,
  onClose?: () => void
) {
  render(
    <PageWithModal props={props} onClose={onClose}>
      {(close) => (
        <button type="button" onClick={close}>
          Close modal
        </button>
      )}
    </PageWithModal>
  )
  run(() => toast('Saved', { duration: Infinity }))
}

describe('Toaster (browser)', () => {
  describe('happy path', () => {
    it('shows the stack in the top layer', () => {
      const { toast, props } = setup()
      render(<Toaster {...props} />)
      run(() => toast('Saved'))
      expect(region().matches(':popover-open')).toBe(true)
    })

    it('paints a toast on top of the page', () => {
      const { toast, props } = setup()
      render(<Toaster {...props} />)
      run(() => toast('Saved'))
      expect(paintedOnTop(screen.getByRole('listitem'))).toBe(true)
    })

    it('sits the same offset away from the inline-end and the bottom edges', () => {
      const { toast, props } = setup()
      render(<Toaster {...props} />)
      run(() => toast('Saved'))
      const rect = region().getBoundingClientRect()
      const right = document.documentElement.clientWidth - rect.right
      expect(right).toBeCloseTo(window.innerHeight - rect.bottom, 0)
    })

    it('moves focus into the stack on a real F8', async () => {
      const { toast, props } = setup()
      render(<Toaster {...props} />)
      run(() => toast('Saved'))
      await userEvent.keyboard('{F8}')
      expect(region()).toHaveFocus()
    })

    it('hands focus to the stack when the focused toast leaves', async () => {
      const { toast, props } = setup()
      render(<Toaster {...props} />)
      run(() => toast('Saved', { duration: Infinity }))
      screen.getByRole('listitem').focus()
      await userEvent.keyboard('{Escape}')
      expect(region()).toHaveFocus()
    })
  })

  describe('variants', () => {
    it('renders the stack inside an open Modal', () => {
      const { toast, props } = setup(0)
      renderOverModal(toast, props)
      expect(region().closest('dialog')).not.toBeNull()
    })

    it('paints a toast above an open Modal', () => {
      const { toast, props } = setup(0)
      renderOverModal(toast, props)
      expect(paintedOnTop(screen.getByRole('listitem'))).toBe(true)
    })

    it('keeps a toast closable over an open Modal', async () => {
      const { toast, props } = setup(0)
      renderOverModal(toast, props)
      await userEvent.click(screen.getByRole('button', { name: 'Close Saved' }))
      expect(screen.queryByRole('listitem')).toBeNull()
    })

    it('goes back in place once the Modal closes', async () => {
      const { toast, props } = setup()
      renderOverModal(toast, props)
      await userEvent.click(screen.getByRole('button', { name: 'Close modal' }))
      await expect.poll(() => region().closest('dialog')).toBeNull()
    })

    it('is shown in the top layer again once back in place', async () => {
      const { toast, props } = setup()
      renderOverModal(toast, props)
      await userEvent.click(screen.getByRole('button', { name: 'Close modal' }))
      await expect.poll(() => region().closest('dialog')).toBeNull()
      expect(region().matches(':popover-open')).toBe(true)
    })

    it('reads the toast a Modal showed as it closes, in the stack back in place', async () => {
      const { toast, props } = setup()
      render(
        <PageWithModal props={props}>
          {(close) => (
            <button
              type="button"
              onClick={() => {
                toast.success('Saved', { duration: Infinity })
                close()
              }}
            >
              Save
            </button>
          )}
        </PageWithModal>
      )
      await userEvent.click(screen.getByRole('button', { name: 'Save' }))
      await expect.poll(() => region().closest('dialog')).toBeNull()
      await expect
        .poll(() => region().querySelector('[aria-live="polite"]')?.textContent)
        .toContain('Saved')
    })

    it('keeps the focus in the stack when it moves out of a closing Modal', async () => {
      const { toast, props } = setup()
      renderOverModal(toast, props)
      screen.getByRole('listitem').focus()
      act(() => {
        screen.getByRole('button', { name: 'Close modal' }).click()
      })
      await expect.poll(() => region().closest('dialog')).toBeNull()
      await expect
        .poll(() => region().contains(document.activeElement))
        .toBe(true)
    })
  })

  describe('managed errors', () => {
    it('closes the toast, not the Modal, on Escape', async () => {
      const onClose = vi.fn()
      const { toast, props } = setup(0)
      renderOverModal(toast, props, onClose)
      screen.getByRole('listitem').focus()
      await userEvent.keyboard('{Escape}')
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  // L4: N/A — the environment knows `:modal` and the Popover API; the degraded mode is jsdom's.

  describe('edge cases', () => {
    it('centres the glyph, the title and the close button in a one-line toast', () => {
      const { toast, props } = setup()
      render(<Toaster {...props} />)
      run(() => toast.info('Saved to your list'))
      const item = screen.getByRole('listitem')
      const middle = centreY(item)
      for (const part of parts(item))
        expect(Math.abs(centreY(part) - middle)).toBeLessThanOrEqual(0.5)
    })

    it('lines the glyph and the close button up with the title in a long toast', () => {
      const { toast, props } = setup()
      render(<Toaster {...props} />)
      run(() =>
        toast.warning('Your storage is nearly full', {
          description: 'You have used 9.6 GB of your 10 GB. '.repeat(4),
        })
      )
      const item = screen.getByRole('listitem')
      const [glyph, title, close] = parts(item)
      expect(Math.abs(centreY(glyph) - centreY(title))).toBeLessThanOrEqual(0.5)
      expect(Math.abs(centreY(close) - centreY(title))).toBeLessThanOrEqual(0.5)
    })

    it('fades out over the machine leave duration (skin and machine agree)', () => {
      const { toast, props } = setup()
      render(<Toaster {...props} />)
      run(() => toast('Saved'))
      const [duration] = getComputedStyle(screen.getByRole('listitem'))
        .transitionDuration.split(',')
        .map((value) => Number.parseFloat(value) * 1000)
      expect(duration).toBe(TOAST_LEAVE_DURATION)
    })

    it('removes a dismissed toast once its leave duration elapsed', async () => {
      const { toast, toaster, props } = setup()
      render(<Toaster {...props} />)
      run(() => toast('Saved', { id: 'save', duration: Infinity }))
      run(() => toaster.dismiss('save'))
      await expect.poll(() => screen.queryByRole('listitem')).toBeNull()
    })

    it('reaches the close button 6 px outside its 32 px glyph (a 44 px target)', () => {
      const { toast, props } = setup()
      render(<Toaster {...props} />)
      run(() => toast('Saved'))
      const button = screen.getByRole('button', { name: 'Close Saved' })
      const rect = button.getBoundingClientRect()
      const middle = rect.top + rect.height / 2
      expect(hits(button, rect.right + 5.5, middle)).toBe(true)
      expect(hits(button, rect.left - 5.5, middle)).toBe(true)
    })

    it('stops the close target past 6 px', () => {
      const { toast, props } = setup()
      render(<Toaster {...props} />)
      run(() => toast('Saved'))
      const button = screen.getByRole('button', { name: 'Close Saved' })
      const rect = button.getBoundingClientRect()
      expect(hits(button, rect.right + 8, rect.top + rect.height / 2)).toBe(
        false
      )
    })

    it('scrolls the list rather than outgrowing a short viewport', () => {
      const { toast, props } = setup()
      render(<Toaster {...props} />)
      for (const title of ['a', 'b', 'c', 'd', 'e'])
        run(() =>
          toast(title, {
            description: 'A long description. '.repeat(12),
            duration: Infinity,
          })
        )
      const list = region().querySelector('ol')
      if (!list) throw new Error('no list')
      expect(list.getBoundingClientRect().height).toBeLessThanOrEqual(
        window.innerHeight
      )
    })
  })
})
