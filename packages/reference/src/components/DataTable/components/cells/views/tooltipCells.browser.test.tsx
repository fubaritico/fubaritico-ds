import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Badge } from '../../../../Badge'
import { Modal } from '../../../../Modal'
import { TruncatedContent } from '../../features/TruncatedContent/TruncatedContent'

import { ClickableCellView } from './ClickableCellView'
import { LabelWithTooltipCellView } from './LabelWithTooltipCellView'
import { TruncableLinkCellView } from './TruncableLinkCellView'

import type { ReactNode } from 'react'

// Real Chromium: the cut is MEASURED in a fixed-width column, and the bubble opens on real hover /
// keyboard focus — what jsdom cannot do. The table sits in a Modal for the top-layer case.

const LONG = 'The Holy Roman Empire of the German Nation, from 962 to 1806'

/**
 * One row of a fixed-layout table whose column is narrower than {@link LONG}.
 *
 * @param props - The cell(s) to render.
 * @param props.children - The `<td>`s of the row.
 * @returns The fixture.
 */
function Narrow({ children }: { children: ReactNode }) {
  return (
    // `.ui-data-table` carries the grid's vars, as the Card of a real DataTable does.
    <div className="ui-data-table" style={{ padding: '60px' }}>
      <table style={{ tableLayout: 'fixed', inlineSize: '160px' }}>
        <tbody>
          <tr>{children}</tr>
        </tbody>
      </table>
    </div>
  )
}

const bubble = () => screen.queryByRole('tooltip', { hidden: true })

describe('tooltip cells (browser)', () => {
  // The real pointer stays where the previous test left it: park it in a corner.
  beforeEach(async () => {
    await userEvent.hover(document.documentElement, {
      position: { x: 1, y: 1 },
    })
  })

  describe('happy path', () => {
    it('reveals a cut-off cell value on keyboard focus', async () => {
      render(
        <Narrow>
          <td>
            <TruncatedContent value={LONG} />
          </td>
        </Narrow>
      )
      const text = screen.getByText(LONG)
      expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)

      await userEvent.keyboard('{Tab}')
      expect(text).toHaveFocus()
      await vi.waitFor(() => {
        expect(bubble()).toHaveTextContent(LONG)
      })
    })

    it('reveals a cut-off link on hover, the link staying the only tab stop', async () => {
      render(
        <Narrow>
          <TruncableLinkCellView label={LONG} linkPath="/empire" />
        </Narrow>
      )
      const link = screen.getByRole('link')
      await userEvent.hover(link)
      await vi.waitFor(() => {
        expect(bubble()).toHaveTextContent(LONG)
      })
      await userEvent.keyboard('{Tab}')
      expect(link).toHaveFocus()
    })
  })

  describe('variants', () => {
    it('shows a hint on focus and hides the bubble from assistive technology', async () => {
      render(
        <Narrow>
          <LabelWithTooltipCellView
            value="HRE"
            tooltipText="Holy Roman Empire"
          />
        </Narrow>
      )
      await userEvent.keyboard('{Tab}')
      await vi.waitFor(() => {
        expect(bubble()).toHaveTextContent('Holy Roman Empire')
      })
      expect(bubble()).toHaveAttribute('aria-hidden', 'true')
    })

    it('opens a button hint on focus, the bubble hidden from assistive technology', async () => {
      render(
        <Narrow>
          <ClickableCellView
            content={<span>×</span>}
            onClick={() => undefined}
            ariaLabel="Delete row 3"
            tooltipText="Removes it for good"
          />
        </Narrow>
      )
      await userEvent.keyboard('{Tab}')
      await vi.waitFor(() => {
        expect(bubble()).toHaveTextContent('Removes it for good')
      })
      expect(bubble()).toHaveAttribute('aria-hidden', 'true')
      expect(
        screen.getByRole('button', {
          name: 'Delete row 3',
          description: 'Removes it for good',
        })
      ).toBeInTheDocument()
    })

    it('rings a hint trigger with the DS focus ring', async () => {
      render(
        <Narrow>
          <LabelWithTooltipCellView value="HRE" tooltipText="Holy Roman Empire" />
        </Narrow>
      )
      await userEvent.keyboard('{Tab}')
      const style = getComputedStyle(screen.getByText('HRE'))
      expect(style.outlineStyle).toBe('solid')
      expect(style.outlineWidth).toBe('2px')
    })

    it('reveals a cut-off Badge label', async () => {
      render(
        <Narrow>
          <td>
            <Badge canTruncate>{LONG}</Badge>
          </td>
        </Narrow>
      )
      await userEvent.keyboard('{Tab}')
      await vi.waitFor(() => {
        expect(bubble()).toHaveTextContent(LONG)
      })
    })
  })

  describe('managed errors', () => {
    it('opens no bubble on hover for a button without a hint', async () => {
      render(
        <Narrow>
          <ClickableCellView content={<span>Open</span>} onClick={() => undefined} />
        </Narrow>
      )
      await userEvent.hover(screen.getByRole('button'))
      await new Promise((resolve) => setTimeout(resolve, 500))
      expect(bubble()).toBeNull()
    })

    it('adds no tab stop and no bubble when the value fits', async () => {
      render(
        <>
          <Narrow>
            <td>
              <TruncatedContent value="HRE" />
            </td>
          </Narrow>
          <button type="button">After</button>
        </>
      )
      await userEvent.keyboard('{Tab}')
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus()
      expect(bubble()).toBeNull()
    })
  })

  // L4: N/A — no async data; the cells render their props.

  describe('edge cases', () => {
    it('opens inside a Modal, above it, and Escape closes the bubble only', async () => {
      render(
        <Modal isOpen onClose={() => undefined} aria-label="Polities">
          <div style={{ background: 'white' }}>
            <Narrow>
              <td>
                <TruncatedContent value={LONG} />
              </td>
            </Narrow>
          </div>
        </Modal>
      )
      const text = screen.getByText(LONG)
      // Focusable only once measured as cut; the click then puts the focus on it.
      await vi.waitFor(() => {
        expect(text).toHaveAttribute('tabindex', '0')
      })
      await userEvent.click(text)
      expect(text).toHaveFocus()
      await vi.waitFor(() => {
        expect(bubble()).toHaveTextContent(LONG)
      })
      expect(bubble()?.matches(':popover-open')).toBe(true)
      await userEvent.keyboard('{Escape}')
      expect(bubble()).toBeNull()
      expect(document.querySelector('dialog')?.open).toBe(true)
    })
  })
})
