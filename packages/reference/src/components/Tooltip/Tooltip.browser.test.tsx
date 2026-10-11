import { render, screen } from '@testing-library/react'
import { StrictMode, useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Modal } from '../Modal'

import { Tooltip } from './Tooltip'

import type { TooltipProps } from './Tooltip'

// Real Chromium: the top layer, hit-testing, a real `<dialog>` and its inertness are the platform's.
// The bubble is `pointer-events: none` by design; the tests that hit-test it turn that off.

/** Tooltip props a fixture may override. */
type FixtureProps = Partial<Omit<TooltipProps, 'targetRef'>>

/**
 * A target button and a visible tooltip anchored to it.
 *
 * @param props - {@link FixtureProps}.
 * @returns The rendered fixture.
 */
function Anchored(props: FixtureProps) {
  const ref = useRef<HTMLButtonElement>(null)
  return (
    <>
      <button ref={ref} type="button">
        Target
      </button>
      <Tooltip
        content="Full polity name"
        visible
        targetRef={ref}
        style={{ pointerEvents: 'auto' }}
        {...props}
      />
    </>
  )
}

const bubble = () => screen.getByRole('tooltip')

/**
 * Whether the bubble is what the pointer meets at its own centre — i.e. painted on top.
 *
 * @returns `true` when the hit-test lands on the bubble.
 */
function paintedOnTop(): boolean {
  const box = bubble().getBoundingClientRect()
  const hit = document.elementFromPoint(
    box.left + box.width / 2,
    box.top + box.height / 2
  )
  return bubble().contains(hit)
}

describe('Tooltip (browser)', () => {
  describe('happy path', () => {
    it('shows in the top layer, below its target', () => {
      render(<Anchored />)
      expect(bubble().matches(':popover-open')).toBe(true)
      const target = screen.getByRole('button', { name: 'Target' })
      expect(bubble().getBoundingClientRect().top).toBeGreaterThanOrEqual(
        target.getBoundingClientRect().bottom
      )
    })
  })

  describe('variants', () => {
    it('shows above a modal it is opened from — no portal out of the <dialog>', async () => {
      // As in real use: the modal is up first, the tooltip opens later (on hover / focus). The top
      // layer stacks in opening order, so the later bubble paints over the modal.
      function OpenedLater() {
        const ref = useRef<HTMLButtonElement>(null)
        const [visible, setVisible] = useState(false)
        return (
          <Modal isOpen onClose={() => undefined} aria-label="Polity">
            <div style={{ padding: '40px', background: 'white' }}>
              <button
                ref={ref}
                type="button"
                onClick={() => {
                  setVisible(true)
                }}
              >
                Target
              </button>
              <Tooltip
                content="Full polity name"
                visible={visible}
                targetRef={ref}
                style={{ pointerEvents: 'auto' }}
              />
            </div>
          </Modal>
        )
      }
      render(<OpenedLater />)
      await userEvent.click(screen.getByRole('button', { name: 'Target' }))

      expect(bubble().closest('dialog')).not.toBeNull()
      expect(paintedOnTop()).toBe(true)
    })

    it('escapes an overflow-hidden ancestor and a z-index 9999 layer', () => {
      render(
        <>
          <div
            style={{
              overflow: 'hidden',
              blockSize: '30px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Anchored />
          </div>
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
      expect(paintedOnTop()).toBe(true)
    })

    it('mounts into a given container with portalContainer', () => {
      const container = document.createElement('section')
      document.body.append(container)
      render(<Anchored portalContainer={container} />)
      expect(container.contains(bubble())).toBe(true)
      expect(bubble().matches(':popover-open')).toBe(true)
      container.remove()
    })
  })

  describe('managed errors', () => {
    it('shows a bubble remounted while visible (portalContainer switched)', () => {
      const first = document.createElement('section')
      const second = document.createElement('section')
      document.body.append(first, second)
      const { rerender } = render(<Anchored portalContainer={first} />)
      rerender(<Anchored portalContainer={second} />)
      expect(second.contains(bubble())).toBe(true)
      expect(bubble().matches(':popover-open')).toBe(true)
      first.remove()
      second.remove()
    })

    it('renders nothing once hidden again', async () => {
      function Toggle() {
        const ref = useRef<HTMLButtonElement>(null)
        const [visible, setVisible] = useState(true)
        return (
          <>
            <button
              ref={ref}
              type="button"
              onClick={() => {
                setVisible(false)
              }}
            >
              Hide
            </button>
            <Tooltip content="Tip" visible={visible} targetRef={ref} />
          </>
        )
      }
      render(<Toggle />)
      expect(bubble().matches(':popover-open')).toBe(true)
      await userEvent.click(screen.getByRole('button', { name: 'Hide' }))
      expect(screen.queryByRole('tooltip')).toBeNull()
    })

    it('stays under a modal that opens AFTER it — the top layer stacks in opening order', async () => {
      // Documented contract: whatever entered the top layer last paints on top.
      function ModalOpenedLater() {
        const [modal, setModal] = useState(false)
        return (
          <>
            <Anchored />
            <button
              type="button"
              onClick={() => {
                setModal(true)
              }}
            >
              Open modal
            </button>
            <Modal isOpen={modal} onClose={() => undefined} aria-label="Later">
              <div style={{ padding: '40px', background: 'white' }}>Modal</div>
            </Modal>
          </>
        )
      }
      render(<ModalOpenedLater />)
      await userEvent.click(screen.getByRole('button', { name: 'Open modal' }))
      expect(paintedOnTop()).toBe(false)
    })
  })

  // L4: N/A — no async source or external data; a missing target is covered by the unit suite.

  describe('edge cases', () => {
    it('wraps its text even under a nowrap, ellipsised, right-aligned parent', () => {
      render(
        <div
          style={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            textAlign: 'end',
            textTransform: 'uppercase',
          }}
        >
          <Anchored content={'A long polity name '.repeat(8)} />
        </div>
      )
      const style = getComputedStyle(bubble())
      expect(style.whiteSpace).toBe('normal')
      expect(style.textTransform).toBe('none')
      // Wrapped: several lines tall, within the max width.
      expect(bubble().getBoundingClientRect().width).toBeLessThanOrEqual(281)
      expect(bubble().getBoundingClientRect().height).toBeGreaterThan(40)
    })

    it('keeps the light variant’s border', () => {
      render(<Anchored variant="light" />)
      expect(getComputedStyle(bubble()).borderTopWidth).toBe('1px')
    })

    it('opens one bubble under StrictMode’s double effects', () => {
      render(
        <StrictMode>
          <Anchored />
        </StrictMode>
      )
      expect(screen.getAllByRole('tooltip')).toHaveLength(1)
      expect(bubble().matches(':popover-open')).toBe(true)
    })

    it('is not restyled by the user-agent popover rules: no border, no inset, no margin', () => {
      render(<Anchored />)
      const style = getComputedStyle(bubble())
      expect(style.marginTop).toBe('0px')
      expect(style.right).not.toBe('0px')
      expect(style.borderTopWidth).toBe('0px')
    })
  })
})
