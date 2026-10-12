import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { TruncatedContent } from '../../features/TruncatedContent/TruncatedContent'
import IconStatusCell from '../IconStatusCell'

import { ClickableCellView } from './ClickableCellView'
import { IconStatusCellView } from './IconStatusCellView'
import { LabelWithTooltipCellView } from './LabelWithTooltipCellView'
import { TruncableLinkCellView } from './TruncableLinkCellView'

import type { Row } from '@tanstack/react-table'
import type { ReactNode } from 'react'

// The cells that reveal a cut-off text or show a hint in a tooltip. jsdom lays nothing out, so the
// cut is stubbed here (every element reports `overflow`); opening the bubble on hover / focus is
// covered for real in `tooltipCells.browser.test.tsx`.

/** Every element reports this overflow while set. */
let overflow = { scrollWidth: 0, clientWidth: 0 }

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    }
  )
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
    configurable: true,
    get: () => overflow.scrollWidth,
  })
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => overflow.clientWidth,
  })
})

afterEach(() => {
  overflow = { scrollWidth: 0, clientWidth: 0 }
})

// Leave no stubbed geometry behind for a file sharing this environment.
afterAll(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollWidth')
  Reflect.deleteProperty(HTMLElement.prototype, 'clientWidth')
  vi.unstubAllGlobals()
})

/** Makes every measured text read as cut off. */
const cut = () => {
  overflow = { scrollWidth: 300, clientWidth: 100 }
}

// A bare <td> outside a table trips React's DOM-nesting validation — keep the real table shape.
const inRow = (node: ReactNode) =>
  render(
    <table>
      <tbody>
        <tr>{node}</tr>
      </tbody>
    </table>
  )

const statusRow = (status: unknown) =>
  ({ getValue: () => status }) as unknown as Row<unknown>

describe('TruncatedContent', () => {
  describe('happy path', () => {
    it('renders the value as a measured truncated text', () => {
      inRow(
        <td>
          <TruncatedContent value="Holy Roman Empire" />
        </td>
      )
      const text = screen.getByText('Holy Roman Empire')
      expect(text.tagName).toBe('P')
      expect(text).toHaveClass('ui-truncated-text', 'ui-data-table__truncate')
    })
  })

  describe('variants', () => {
    it('becomes a tab stop once cut, with no title nor aria-label', () => {
      cut()
      inRow(
        <td>
          <TruncatedContent value="Holy Roman Empire" />
        </td>
      )
      const text = screen.getByText('Holy Roman Empire')
      expect(text).toHaveAttribute('tabindex', '0')
      expect(text).not.toHaveAttribute('title')
      expect(text).not.toHaveAttribute('aria-label')
    })
  })

  describe('managed errors', () => {
    it('stays plain text when it fits', () => {
      inRow(
        <td>
          <TruncatedContent value="Holy Roman Empire" />
        </td>
      )
      expect(screen.getByText('Holy Roman Empire')).not.toHaveAttribute(
        'tabindex'
      )
    })
  })

  describe('unmanaged errors', () => {
    it.each([[null], [undefined], [''], ['0']])('shows "-" for %j', (value) => {
      inRow(
        <td>
          <TruncatedContent value={value} />
        </td>
      )
      expect(screen.getByText('-')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('stringifies a non-string value', () => {
      inRow(
        <td>
          <TruncatedContent value={42} />
        </td>
      )
      expect(screen.getByText('42')).toBeInTheDocument()
    })
  })
})

describe('TruncableLinkCellView', () => {
  describe('happy path', () => {
    it('renders the label as a link to the path', () => {
      inRow(<TruncableLinkCellView label="Report" linkPath="/reports/1" />)
      expect(screen.getByRole('link', { name: 'Report' })).toHaveAttribute(
        'href',
        '/reports/1'
      )
    })
  })

  describe('variants', () => {
    it('adds no extra tab stop and no title once cut — the link is the trigger', async () => {
      cut()
      inRow(<TruncableLinkCellView label="Report" linkPath="/reports/1" />)
      const link = screen.getByRole('link', { name: 'Report' })
      expect(link).not.toHaveAttribute('title')
      expect(link).not.toHaveAttribute('tabindex')
      await userEvent.tab()
      expect(link).toHaveFocus()
    })
  })

  describe('managed errors', () => {
    it('neutralises an unsafe scheme to "#"', () => {
      inRow(
        <TruncableLinkCellView label="Report" linkPath="javascript:alert(1)" />
      )
      expect(screen.getByRole('link')).toHaveAttribute('href', '#')
    })
  })

  // L4: N/A — props are typed strings, no async path.

  describe('edge cases', () => {
    it('renders a hash link', () => {
      inRow(<TruncableLinkCellView label="Top" linkPath="#top" />)
      expect(screen.getByRole('link')).toHaveAttribute('href', '#top')
    })
  })
})

describe('LabelWithTooltipCellView', () => {
  describe('happy path', () => {
    it('makes the value a tab stop and keeps the hint readable as hidden text', async () => {
      inRow(<LabelWithTooltipCellView value="FR" tooltipText="France" />)
      const trigger = screen.getByText('FR')
      expect(trigger).toHaveAttribute('tabindex', '0')
      expect(trigger).toHaveClass('ui-data-table__hint')
      expect(trigger).toHaveTextContent('FR (France)')
      expect(screen.getByText('(France)')).toHaveClass(
        'ui-data-table__visually-hidden'
      )
      await userEvent.tab()
      expect(trigger).toHaveFocus()
    })
  })

  describe('variants', () => {
    it('renders the bare value, no tab stop, without a hint', () => {
      inRow(<LabelWithTooltipCellView value="FR" />)
      expect(screen.getByRole('cell')).toHaveTextContent('FR')
      expect(screen.getByRole('cell').querySelector('[tabindex]')).toBeNull()
    })
  })

  describe('managed errors', () => {
    it('treats an empty hint as no hint', () => {
      inRow(<LabelWithTooltipCellView value="FR" tooltipText="" />)
      expect(screen.getByRole('cell').querySelector('[tabindex]')).toBeNull()
    })
  })

  // L4: N/A — props are typed strings, no async path.

  describe('edge cases', () => {
    it('renders an empty cell without a value', () => {
      inRow(<LabelWithTooltipCellView />)
      expect(screen.getByRole('cell')).toBeEmptyDOMElement()
    })

    it('adds no invisible tab stop for a hint without a value', () => {
      inRow(<LabelWithTooltipCellView value="" tooltipText="France" />)
      expect(screen.getByRole('cell').querySelector('[tabindex]')).toBeNull()
    })
  })
})

describe('IconStatusCellView', () => {
  describe('happy path', () => {
    it('renders the status as hidden text next to a decorative icon', () => {
      inRow(
        <IconStatusCellView
          status="Completed"
        />
      )
      expect(screen.getByText('Completed')).toHaveClass(
        'ui-data-table__visually-hidden'
      )
      expect(screen.getByRole('cell').querySelector('[tabindex]')).toBeNull()
    })
  })

  describe('variants', () => {
    it('with a hint, wraps the icon in a tab stop and reads the hint with the status', () => {
      inRow(
        <IconStatusCellView
          status="Failed"
          tooltipText="Disk full"
        />
      )
      expect(screen.getByText('Failed (Disk full)')).toBeInTheDocument()
      expect(screen.getByText('Failed (Disk full)').parentElement).toHaveClass(
        'ui-data-table__hint'
      )
      expect(screen.getByRole('cell')).not.toHaveAttribute('title')
      expect(
        screen.getByRole('cell').querySelector('[tabindex="0"]')
      ).not.toBeNull()
    })
  })

  describe('managed errors', () => {
    it('falls back to the default icon for an unknown status', () => {
      const unknown = inRow(
        <IconStatusCellView status="Weird" />
      )
      const fallback = unknown.container.querySelector('svg')?.outerHTML
      unknown.unmount()
      const warning = inRow(
        <IconStatusCellView status="Warning" />
      )
      // The default icon IS the warning one.
      expect(warning.container.querySelector('svg')?.outerHTML).toBe(fallback)
    })
  })

  // L4: covered by the factory below — the view takes a typed status, the factory reads the row.

  describe('edge cases', () => {
    it('matches the status case-insensitively', () => {
      const upper = inRow(
        <IconStatusCellView status="COMPLETED" />
      )
      const upperIcon = upper.container.querySelector('svg')?.outerHTML
      upper.unmount()
      const lower = inRow(
        <IconStatusCellView status="completed" />
      )
      const lowerIcon = lower.container.querySelector('svg')?.outerHTML
      lower.unmount()
      const fallback = inRow(
        <IconStatusCellView status="Weird" />
      )
      expect(upperIcon).toBe(lowerIcon)
      expect(upperIcon).not.toBe(fallback.container.querySelector('svg')?.outerHTML)
    })
  })
})

describe('IconStatusCell (factory)', () => {
  describe('happy path', () => {
    it('reads the status from the "status" key by default', () => {
      const Cell = IconStatusCell()
      inRow(<Cell row={statusRow('Completed')} />)
      expect(screen.getByText('Completed')).toBeInTheDocument()
    })
  })

  describe('variants', () => {
    it('reads a custom key and forwards the hint', () => {
      const Cell = IconStatusCell({}, 'state', 'Disk full')
      const row = {
        getValue: (key: string) => (key === 'state' ? 'Failed' : undefined),
      } as unknown as Row<unknown>
      inRow(<Cell row={row} />)
      expect(screen.getByText('Failed (Disk full)')).toBeInTheDocument()
    })
  })

  // L3: N/A — no handled error state; malformed data is L4.

  describe('unmanaged errors', () => {
    it.each([[undefined], [null], [42]])(
      'renders the default icon instead of crashing on a %j status',
      (status) => {
        // The factory reads the row: malformed data must not reach the view as a crash.
        const Cell = IconStatusCell()
        const malformed = inRow(<Cell row={statusRow(status)} />)
        const icon = malformed.container.querySelector('svg')?.outerHTML
        malformed.unmount()
        const warning = inRow(
          <IconStatusCellView status="Warning" />
        )
        expect(warning.container.querySelector('svg')?.outerHTML).toBe(icon)
      }
    )

    it('reads the hint alone when the status is missing', () => {
      const Cell = IconStatusCell({}, 'status', 'Disk full')
      inRow(<Cell row={statusRow(null)} />)
      expect(screen.getByText('Disk full')).toHaveClass('ui-data-table__visually-hidden')
    })
  })

  // L5: covered by the view's edge cases (case-insensitive match).
})

describe('ClickableCellView', () => {
  describe('happy path', () => {
    it('renders a button that fires onClick', async () => {
      const onClick = vi.fn()
      inRow(
        <ClickableCellView
          content={<span>Open</span>}
          onClick={onClick}
          ariaLabel="Open row"
        />
      )
      await userEvent.click(screen.getByRole('button', { name: 'Open row' }))
      expect(onClick).toHaveBeenCalledOnce()
    })
  })

  describe('variants', () => {
    it('names the button with the hint when no aria-label is given, without a title', () => {
      inRow(
        <ClickableCellView
          content={<svg />}
          onClick={vi.fn()}
          tooltipText="Delete"
        />
      )
      const button = screen.getByRole('button', { name: 'Delete' })
      expect(button).not.toHaveAttribute('title')
      // The hint is the name already: not repeated as a description.
      expect(button).not.toHaveAttribute('aria-describedby')
    })
  })

  describe('managed errors', () => {
    it('adds no description without a hint', () => {
      inRow(
        <ClickableCellView content={<span>Open</span>} onClick={vi.fn()} ariaLabel="Open row" />
      )
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby')
    })
  })

  // L4: N/A — no async path; the callback is the consumer's.

  describe('edge cases', () => {
    it('keeps an explicit aria-label over the hint', () => {
      inRow(
        <ClickableCellView
          content={<svg />}
          onClick={vi.fn()}
          ariaLabel="Delete row 3"
          tooltipText="Delete"
        />
      )
      // The hint differs from the name: it describes the button, bubble open or not.
      expect(
        screen.getByRole('button', { name: 'Delete row 3', description: 'Delete' })
      ).toBeInTheDocument()
    })
  })
})
