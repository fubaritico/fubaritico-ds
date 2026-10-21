import { render, screen } from '@testing-library/react'
import { StrictMode, useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { media } from '../../../vitest.browser.media'
import { Modal } from '../Modal'

import { Tooltip } from './Tooltip'
import { ARROW_SIZE } from './Tooltip.constants'

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

/** Placements, each with room around the target so it does not flip. */
const PLACEMENTS = ['top', 'bottom', 'left', 'right'] as const

/** Padding around the fixture: room for the bubble on every side, so no placement flips. */
const ROOM = '120px 200px'

/**
 * The bubble's arrow, once the position is measured (the arrow only renders then).
 *
 * @returns The arrow element.
 */
async function arrowOf(): Promise<Element> {
  await expect.poll(() => bubble().querySelector('.ui-tooltip__arrow')).not.toBeNull()
  const arrow = bubble().querySelector('.ui-tooltip__arrow')
  if (!arrow) throw new Error('the tooltip rendered no arrow')
  return arrow
}

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

    it.each(PLACEMENTS)(
      'joins the light arrow to the bubble’s border, placement %s',
      async (placement) => {
        render(
          <div style={{ padding: ROOM }}>
            <Anchored variant="light" placement={placement} />
          </div>
        )
        const arrow = await arrowOf()
        const bubbleStyle = getComputedStyle(bubble())
        const border = bubbleStyle.borderTopWidth
        const b = bubble().getBoundingClientRect()
        const a = arrow.getBoundingClientRect()
        // Per placement: the arrow edge that meets the bubble, and the axis the fill is shifted on
        // (toward the bubble, by one border width, to cover the border under the arrow's base).
        const expected = {
          top: { edges: [a.top, b.bottom], axis: 'top', shift: `-${border}` },
          bottom: { edges: [a.bottom, b.top], axis: 'top', shift: border },
          left: { edges: [a.left, b.right], axis: 'left', shift: `-${border}` },
          right: { edges: [a.right, b.left], axis: 'left', shift: border },
        }[placement]
        // No gap: the arrow starts exactly at the bubble's outer edge.
        expect(expected.edges[0]).toBeCloseTo(expected.edges[1], 1)
        const colour = `border-${placement}-color`
        const outline = getComputedStyle(arrow, '::before')
        const fill = getComputedStyle(arrow, '::after')
        expect(outline.getPropertyValue(colour)).toBe(bubbleStyle.borderTopColor)
        expect(fill.getPropertyValue(colour)).toBe(bubbleStyle.backgroundColor)
        expect(fill.getPropertyValue(expected.axis)).toBe(expected.shift)
      }
    )

    it.each(PLACEMENTS)('sizes the arrow from ARROW_SIZE, placement %s', async (placement) => {
      // The positioning math and the skin must agree on the arrow's footprint.
      render(
        <div style={{ padding: ROOM }}>
          <Anchored placement={placement} />
        </div>
      )
      const { width, height } = (await arrowOf()).getBoundingClientRect()
      const vertical = placement === 'top' || placement === 'bottom'
      expect([width, height]).toEqual(
        vertical ? [2 * ARROW_SIZE, ARROW_SIZE] : [ARROW_SIZE, 2 * ARROW_SIZE]
      )
    })

    it('keeps the arrow a triangle under forced colours', async () => {
      // High contrast repaints every border colour, transparent ones too: unprotected, the arrow
      // becomes a solid rectangle. Its sides must stay transparent, its tip in a system colour.
      await media.forcedColors(true)
      try {
        render(
          <div style={{ padding: ROOM }}>
            <Anchored />
          </div>
        )
        const outline = getComputedStyle(await arrowOf(), '::before')
        expect(outline.borderLeftColor).toBe('rgba(0, 0, 0, 0)')
        expect(outline.borderRightColor).toBe('rgba(0, 0, 0, 0)')
        expect(outline.borderBottomColor).not.toBe('rgba(0, 0, 0, 0)')
        // Every variant gets a visible outline under forced colours.
        expect(getComputedStyle(bubble()).borderTopWidth).toBe('1px')
      } finally {
        await media.forcedColors(false)
      }
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
