import { render, screen } from '@testing-library/react'
import { createRef, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'

import Drawer from './Drawer'

import type { DrawerProps } from './Drawer'

// Real Chromium: `showModal()`, the top layer, Escape, the UA rule hiding a closed dialog, logical
// anchoring under `dir="rtl"` and the geometric backdrop test are the platform's — jsdom measures
// every box at zero. Motion is off for the whole project (reduced motion), so boxes are read at rest.

/** Props a test may override on the fixture's Drawer. */
type FixtureProps = Partial<Omit<DrawerProps, 'open' | 'aria-label'>> & {
  /** Initial open state. */
  defaultOpen?: boolean
  /** Render a body under the header; without it, the panel's own background shows below. */
  withBody?: boolean
}

/**
 * A trigger and a Drawer with a header (and its close button), optionally a body.
 *
 * @param props - {@link FixtureProps}.
 * @returns The rendered fixture.
 */
function Fixture({
  defaultOpen = false,
  withBody = true,
  onClose,
  ...props
}: FixtureProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Drawer
        aria-label="Filters"
        open={open}
        onClose={() => {
          setOpen(false)
          onClose?.()
        }}
        {...props}
      >
        <Drawer.Header>Filters</Drawer.Header>
        {withBody ? (
          <Drawer.Body>
            <button type="button">Apply</button>
          </Drawer.Body>
        ) : null}
      </Drawer>
    </>
  )
}

// A closed dialog is display:none: Testing Library computes no role for it, so query the class.
const panel = () => {
  const element = document.querySelector<HTMLDialogElement>('.ui-drawer')
  if (!element) throw new Error('drawer not rendered')
  return element
}
const isModal = () => panel().matches(':modal')
const box = () => panel().getBoundingClientRect()
const openButton = () => screen.getByRole('button', { name: 'Open' })

/** An unlayered consumer rule forcing a layout — it beats any layered skin rule. */
const FORCE_DISPLAY = '.force-display { display: grid; }'

afterEach(() => {
  document.body.style.overflow = ''
})

describe('Drawer (browser)', () => {
  describe('happy path', () => {
    it('opens as a modal panel pinned to the start edge, full height', async () => {
      render(<Fixture />)
      await userEvent.click(openButton())

      expect(isModal()).toBe(true)
      expect(screen.getByRole('dialog', { name: 'Filters' })).toBe(panel())
      expect(panel().contains(document.activeElement)).toBe(true)
      expect(getComputedStyle(panel()).display).toBe('flex')
      expect(box().left).toBeCloseTo(0, 0)
      expect(box().height).toBeCloseTo(window.innerHeight, 0)
      expect(box().width).toBeLessThan(window.innerWidth)
    })
  })

  describe('variants', () => {
    it('closes from its header close button', async () => {
      const onClose = vi.fn()
      render(<Fixture onClose={onClose} />)
      await userEvent.click(openButton())
      await userEvent.click(screen.getByRole('button', { name: 'Close' }))

      expect(isModal()).toBe(false)
      expect(onClose).toHaveBeenCalledOnce()
      expect(openButton()).toHaveFocus()
    })

    it('closes on Escape and gives focus back to the trigger', async () => {
      const onClose = vi.fn()
      render(<Fixture onClose={onClose} />)
      await userEvent.click(openButton())
      await userEvent.keyboard('{Escape}')

      expect(isModal()).toBe(false)
      expect(onClose).toHaveBeenCalledOnce()
      expect(openButton()).toHaveFocus()
    })

    it('closes on a click outside its box', async () => {
      const onClose = vi.fn()
      render(<Fixture onClose={onClose} />)
      await userEvent.click(openButton())
      // A backdrop click reports the dialog as its target; aim past the panel's inline end.
      await userEvent.click(panel(), {
        position: { x: box().width + 40, y: box().height / 2 },
      })

      expect(isModal()).toBe(false)
      expect(onClose).toHaveBeenCalledOnce()
      expect(openButton()).toHaveFocus()
    })

    it('pins to the end edge with side="end"', async () => {
      render(<Fixture side="end" />)
      await userEvent.click(openButton())

      expect(box().right).toBeCloseTo(window.innerWidth, 0)
    })

    it('spans the full width along the top with side="top"', async () => {
      render(<Fixture side="top" />)
      await userEvent.click(openButton())

      expect(box().top).toBeCloseTo(0, 0)
      expect(box().width).toBeCloseTo(window.innerWidth, 0)
      expect(box().height).toBeLessThan(window.innerHeight)
    })
  })

  describe('managed errors', () => {
    it('stays open on a click on its own background — the target is the dialog there too', async () => {
      const onClose = vi.fn()
      render(<Fixture onClose={onClose} withBody={false} />)
      await userEvent.click(openButton())
      // No body: below the header, the hit target is the <dialog> itself, inside its box.
      await userEvent.click(panel(), {
        position: { x: box().width / 2, y: box().height - 10 },
      })

      expect(isModal()).toBe(true)
      expect(onClose).not.toHaveBeenCalled()
    })

    it('keeps Tab and Shift+Tab inside, the page behind inert', async () => {
      render(<Fixture />)
      await userEvent.click(openButton())

      openButton().focus()
      expect(openButton()).not.toHaveFocus()
      for (const shift of [false, true]) {
        for (let i = 0; i < 4; i++) {
          await userEvent.tab({ shift })
          expect(document.activeElement).not.toBe(openButton())
        }
      }
    })

    it('stays hidden while closed — before and after an open/close cycle', async () => {
      render(<Fixture />)
      expect(getComputedStyle(panel()).display).toBe('none')

      await userEvent.click(openButton())
      await userEvent.keyboard('{Escape}')
      expect(getComputedStyle(panel()).display).toBe('none')
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
      expect(getComputedStyle(panel()).display).toBe('none')
    })

    it('stays hidden while closed even with an inline display', () => {
      render(<Fixture style={{ display: 'block' }} />)
      expect(getComputedStyle(panel()).display).toBe('none')
    })

    it('still opens when the consumer passes its own ref', async () => {
      const ref = createRef<HTMLDialogElement>()
      render(<Fixture ref={ref} />)
      await userEvent.click(openButton())

      expect(ref.current).toBe(panel())
      expect(isModal()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('flips side="start" to the right edge under dir="rtl"', async () => {
      render(
        <div dir="rtl">
          <Fixture />
        </div>
      )
      await userEvent.click(openButton())

      expect(box().right).toBeCloseTo(window.innerWidth, 0)
    })

    it('mounts open and releases the scroll lock on unmount', () => {
      const { unmount } = render(<Fixture defaultOpen />)
      expect(isModal()).toBe(true)
      expect(document.body.style.overflow).toBe('hidden')

      unmount()
      expect(document.body.style.overflow).toBe('')
    })
  })
})
