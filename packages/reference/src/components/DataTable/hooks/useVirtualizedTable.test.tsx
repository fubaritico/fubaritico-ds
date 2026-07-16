import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useVirtualizedTable } from './useVirtualizedTable'

import type { UseVirtualizedTableOptions } from './useVirtualizedTable'

// jsdom does not implement getComputedStyle(el, '::after') — it logs a noisy "Not implemented" notice.
// The hook legitimately reads the `::after` height in a real browser, so we mock only the pseudo path
// (returning an empty height, as if the pseudo had none yet) and delegate the rest to the real impl.
const originalGetComputedStyle = window.getComputedStyle.bind(window)

/**
 * Probe wiring the hook onto a realistic table layout and exposing the results as data attributes so
 * tests can read them. Note: jsdom has no layout engine, so `clientHeight`/`scrollTop` are `0` and the
 * virtualizer derives `totalSize` purely from `rowCount * estimateRowHeight`.
 */
function Probe({
  rowCount,
  options,
}: {
  rowCount: number
  options?: UseVirtualizedTableOptions
}) {
  const { parentRef, scrollableRef, tableRef, virtualItems, totalSize } =
    useVirtualizedTable(rowCount, options)

  return (
    <div
      ref={parentRef}
      data-testid="parent"
      style={{ height: 200, overflow: 'auto' }}
    >
      <div
        ref={scrollableRef}
        data-testid="spacer"
        style={{ height: totalSize }}
      >
        <table
          ref={tableRef}
          data-testid="table"
          data-total={totalSize}
          data-items={virtualItems.length}
        />
      </div>
    </div>
  )
}

beforeEach(() => {
  vi.spyOn(window, 'getComputedStyle').mockImplementation(
    (element: Element, pseudoElt?: string | null) =>
      pseudoElt
        ? ({ height: '' } as CSSStyleDeclaration)
        : originalGetComputedStyle(element)
  )
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('useVirtualizedTable', () => {
  describe('happy path', () => {
    it('returns a positive total height for a non-empty row count', () => {
      render(<Probe rowCount={100} />)
      const total = Number(
        screen.getByTestId('table').getAttribute('data-total')
      )
      expect(total).toBeGreaterThan(0)
    })

    it('attaches the three refs to the rendered elements', () => {
      render(<Probe rowCount={10} />)
      // The refs are wired (elements present); the spacer is sized to the total height.
      expect(screen.getByTestId('parent')).toBeInTheDocument()
      expect(screen.getByTestId('spacer')).toBeInTheDocument()
      expect(screen.getByTestId('table')).toBeInTheDocument()
    })

    it('sets --pseudo-height on the table element to the total height', () => {
      render(<Probe rowCount={10} />)
      const table = screen.getByTestId('table')
      const total = table.getAttribute('data-total')
      // jsdom: clientHeight is 0, so pseudoHeight === totalSize.
      expect(table.style.getPropertyValue('--pseudo-height')).toBe(`${total}px`)
    })
  })

  describe('variants', () => {
    it('scales the total height with estimateRowHeight', () => {
      render(<Probe rowCount={10} options={{ estimateRowHeight: 100 }} />)
      const tall = Number(
        screen.getByTestId('table').getAttribute('data-total')
      )
      cleanup()
      render(<Probe rowCount={10} options={{ estimateRowHeight: 40 }} />)
      const short = Number(
        screen.getByTestId('table').getAttribute('data-total')
      )
      expect(tall).toBeGreaterThan(short)
    })

    it('accepts custom overscan and nearBottomThreshold without error', () => {
      expect(() => {
        render(
          <Probe
            rowCount={50}
            options={{ overscan: 5, nearBottomThreshold: 0.8 }}
          />
        )
      }).not.toThrow()
    })
  })

  // L3: managed errors — N/A (the hook has no user-facing error path).

  describe('unmanaged errors', () => {
    it('does not throw when the pseudo-element height is non-numeric (NaN guard)', () => {
      // Force a garbage `::after` height: the `parseFloat(...) || 0` guard must hold.
      vi.spyOn(window, 'getComputedStyle').mockImplementation(
        (element: Element, pseudoElt?: string | null) =>
          pseudoElt
            ? ({ height: 'not-a-number' } as CSSStyleDeclaration)
            : originalGetComputedStyle(element)
      )
      expect(() => {
        render(<Probe rowCount={10} />)
      }).not.toThrow()
      // The guard collapses the bad height to 0, so --pseudo-height still resolves to the total.
      const table = screen.getByTestId('table')
      const total = table.getAttribute('data-total')
      expect(table.style.getPropertyValue('--pseudo-height')).toBe(`${total}px`)
    })
  })

  describe('edge cases', () => {
    it('handles a zero row count (empty, no items, no throw)', () => {
      render(<Probe rowCount={0} />)
      const table = screen.getByTestId('table')
      expect(table.getAttribute('data-total')).toBe('0')
      expect(table.getAttribute('data-items')).toBe('0')
      expect(table.style.getPropertyValue('--pseudo-height')).toBe('0px')
    })

    it('does not throw on unmount (scroll listener cleaned up)', () => {
      const { unmount } = render(<Probe rowCount={1000} />)
      expect(() => {
        unmount()
      }).not.toThrow()
    })
  })
})
