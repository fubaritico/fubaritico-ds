import { render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Modal } from '../Modal'

import BottomSheet from './BottomSheet'

import type { BottomSheetProps } from './BottomSheet'

// Real Chromium: the top layer, a real `<dialog>` (focus trap, inertness, Escape, ::backdrop) and
// hit-testing are the platform's — none of it exists under jsdom.

/**
 * A button that opens a BottomSheet holding a field, plus a button outside it.
 *
 * @param props - BottomSheet props to override; `onClose` is called after the fixture closes.
 * @param props.onClose - Spy notified of every close.
 * @returns The fixture.
 */
function Fixture({ onClose, ...props }: Partial<BottomSheetProps>) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true)
        }}
      >
        Open sheet
      </button>
      <button type="button">Outside</button>
      <BottomSheet
        aria-label="Filters"
        open={open}
        onClose={() => {
          setOpen(false)
          onClose?.()
        }}
        {...props}
      >
        <BottomSheet.Header>Filters</BottomSheet.Header>
        <BottomSheet.Body>
          <input aria-label="Name" />
        </BottomSheet.Body>
      </BottomSheet>
    </>
  )
}

const sheet = () => screen.queryByRole('dialog', { name: 'Filters' })
const close = () => screen.getByRole('button', { name: 'Close' })

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

describe('BottomSheet (browser)', () => {
  describe('happy path', () => {
    it('opens in the top layer, pinned to the bottom edge and full width', async () => {
      render(<Fixture />)
      await userEvent.click(screen.getByRole('button', { name: 'Open sheet' }))
      const panel = sheet()
      if (!panel) throw new Error('sheet not open')
      expect(panel.matches(':popover-open')).toBe(true)
      const box = panel.getBoundingClientRect()
      expect(Math.abs(box.bottom - window.innerHeight)).toBeLessThan(1)
      expect(
        Math.abs(box.width - document.documentElement.clientWidth)
      ).toBeLessThan(1)
      expect(reachable(close())).toBe(true)
    })
  })

  describe('variants', () => {
    it('without overlay: the page stays usable behind the sheet', async () => {
      render(<Fixture />)
      await userEvent.click(screen.getByRole('button', { name: 'Open sheet' }))
      expect(reachable(screen.getByRole('button', { name: 'Outside' }))).toBe(
        true
      )
    })

    it('without overlay: no scrim — a popover has a ::backdrop too, left transparent', async () => {
      render(<Fixture />)
      await userEvent.click(screen.getByRole('button', { name: 'Open sheet' }))
      const panel = sheet()
      if (!panel) throw new Error('sheet not open')
      expect(getComputedStyle(panel, '::backdrop').backgroundColor).toBe(
        'rgba(0, 0, 0, 0)'
      )
    })

    it('with overlay: a real modal — focus trapped inside, page inert', async () => {
      render(<Fixture overlay />)
      await userEvent.click(screen.getByRole('button', { name: 'Open sheet' }))
      const panel = sheet()
      if (!panel) throw new Error('sheet not open')
      expect(panel.matches(':modal')).toBe(true)
      expect(reachable(screen.getByRole('button', { name: 'Outside' }))).toBe(
        false
      )

      // Tab cycles within the sheet, never back to the page behind. (Past the last control Chromium
      // may hand focus to the browser UI — `activeElement` is then `<body>` — which the spec allows.)
      const outside = screen.getByRole('button', { name: 'Outside' })
      for (let step = 0; step < 5; step += 1) {
        await userEvent.keyboard('{Tab}')
        expect(outside).not.toHaveFocus()
        expect(
          screen.getByRole('button', { name: 'Open sheet' })
        ).not.toHaveFocus()
      }
    })

    it('with overlay: Escape and a click on the backdrop close it', async () => {
      const onClose = vi.fn()
      render(<Fixture overlay onClose={onClose} />)
      await userEvent.click(screen.getByRole('button', { name: 'Open sheet' }))
      await userEvent.keyboard('{Escape}')
      expect(onClose).toHaveBeenCalledOnce()

      // Reopen, then press the backdrop above the panel: the dialog reports itself as the target,
      // and its box tells the backdrop from the panel.
      await userEvent.click(screen.getByRole('button', { name: 'Open sheet' }))
      const panel = sheet()
      if (!panel) throw new Error('sheet not open')
      await userEvent.click(panel, { position: { x: 10, y: -40 } })
      expect(onClose).toHaveBeenCalledTimes(2)
    })
  })

  describe('managed errors', () => {
    for (const overlay of [false, true]) {
      it(`opened inside a Modal (overlay=${String(overlay)}): usable, and Escape closes the sheet only`, async () => {
        /**
         * A Modal from which the sheet is opened.
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
              <div style={{ padding: '40px', background: 'white' }}>
                <Fixture overlay={overlay} />
              </div>
            </Modal>
          )
        }
        render(<InModal />)
        await userEvent.click(
          screen.getByRole('button', { name: 'Open sheet' })
        )
        expect(reachable(close())).toBe(true)

        await userEvent.keyboard('{Escape}')
        expect(sheet()).toBeNull()
        expect(document.querySelector('dialog.ui-modal')).toHaveProperty(
          'open',
          true
        )
      })
    }
  })

  // L4: N/A — no async source.

  describe('edge cases', () => {
    it('switches between modal and non-modal while open, both ways', async () => {
      /**
       * A sheet kept open while its `overlay` flips.
       *
       * @returns The fixture.
       */
      function Flip() {
        const [overlay, setOverlay] = useState(false)
        return (
          <BottomSheet
            aria-label="Filters"
            open
            overlay={overlay}
            onClose={vi.fn()}
          >
            <BottomSheet.Body>
              <button
                type="button"
                onClick={() => {
                  setOverlay((current) => !current)
                }}
              >
                Flip
              </button>
            </BottomSheet.Body>
          </BottomSheet>
        )
      }
      render(<Flip />)
      const panel = () => {
        const element = sheet()
        if (!element) throw new Error('sheet not open')
        return element
      }
      expect(panel().matches(':popover-open')).toBe(true)
      await userEvent.click(screen.getByRole('button', { name: 'Flip' }))
      expect(panel().matches(':modal')).toBe(true)
      await userEvent.click(screen.getByRole('button', { name: 'Flip' }))
      expect(panel().matches(':popover-open')).toBe(true)
    })

    it('reports Escape after a reopen that followed a close by the prop', async () => {
      const onClose = vi.fn()
      render(<Fixture overlay onClose={onClose} />)
      await userEvent.click(screen.getByRole('button', { name: 'Open sheet' }))
      await userEvent.click(close())
      expect(onClose).toHaveBeenCalledTimes(1)
      await userEvent.click(screen.getByRole('button', { name: 'Open sheet' }))
      await userEvent.keyboard('{Escape}')
      expect(onClose).toHaveBeenCalledTimes(2)
      expect(sheet()).toBeNull()
    })

    it('leaves a Modal opened on top of the sheet alone: its clicks and Escape are its own', async () => {
      /**
       * A non-modal sheet from which a Modal is opened.
       *
       * @returns The fixture.
       */
      function ModalOnTop() {
        const [modal, setModal] = useState(false)
        return (
          <BottomSheet aria-label="Filters" open onClose={onClose}>
            <BottomSheet.Body>
              <button
                type="button"
                onClick={() => {
                  setModal(true)
                }}
              >
                Details
              </button>
              <Modal
                isOpen={modal}
                onClose={() => {
                  setModal(false)
                }}
                aria-label="Details"
              >
                <div style={{ padding: '40px', background: 'white' }}>
                  <button type="button">In the modal</button>
                </div>
              </Modal>
            </BottomSheet.Body>
          </BottomSheet>
        )
      }
      const onClose = vi.fn()
      render(<ModalOnTop />)
      await userEvent.click(screen.getByRole('button', { name: 'Details' }))
      await userEvent.click(
        screen.getByRole('button', { name: 'In the modal' })
      )
      await userEvent.keyboard('{Escape}')
      expect(onClose).not.toHaveBeenCalled()
      expect(sheet()).not.toBeNull()
    })

    it('stays hidden once closed by Escape, even with a consumer display and onClose ignored', async () => {
      /**
       * A modal sheet whose consumer never closes it and forces a `display`.
       *
       * @returns The fixture.
       */
      function Stubborn() {
        return (
          <BottomSheet
            aria-label="Filters"
            open
            overlay
            onClose={() => undefined}
            style={{ display: 'flex' }}
          >
            <BottomSheet.Body>
              <button type="button">Inside</button>
            </BottomSheet.Body>
          </BottomSheet>
        )
      }
      render(<Stubborn />)
      const panel = document.querySelector<HTMLElement>('.ui-bottom-sheet')
      if (!panel) throw new Error('sheet not rendered')
      expect(getComputedStyle(panel).display).toBe('flex')
      await userEvent.keyboard('{Escape}')
      expect(panel).not.toHaveAttribute('open')
      expect(getComputedStyle(panel).display).toBe('none')
    })

    it('without overlay: a click outside closes it', async () => {
      render(<Fixture />)
      await userEvent.click(screen.getByRole('button', { name: 'Open sheet' }))
      await userEvent.click(screen.getByRole('button', { name: 'Outside' }))
      expect(sheet()).toBeNull()
    })
  })
})
