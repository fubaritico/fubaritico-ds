import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useIsTextTruncated } from './useIsTextTruncated'

/** Captured ResizeObserver callbacks so tests can fire them on demand. */
let observerCallbacks: ResizeObserverCallback[] = []

/** Minimal controllable ResizeObserver mock (jsdom has none). */
class MockResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    observerCallbacks.push(callback)
  }
  observe(): void {
    // no-op — tests fire callbacks manually via triggerResize()
  }
  unobserve(): void {
    // no-op
  }
  disconnect(): void {
    // no-op
  }
}

/** Fires every registered ResizeObserver callback (simulates an element resize). */
const triggerResize = () => {
  act(() => {
    observerCallbacks.forEach((cb) => {
      cb([], {} as ResizeObserver)
    })
  })
}

/** Probe component exposing the hook's `isTruncated` flag as a data attribute. */
function Probe({ text }: { text: string }) {
  const { elementRef, isTruncated } =
    useIsTextTruncated<HTMLParagraphElement>(text)
  return (
    <p ref={elementRef} data-truncated={isTruncated}>
      {text}
    </p>
  )
}

/** Forces an element's measured overflow, then fires the observer so the hook re-checks. */
const forceOverflow = (el: HTMLElement, scroll: number, client: number) => {
  Object.defineProperty(el, 'scrollWidth', {
    configurable: true,
    value: scroll,
  })
  Object.defineProperty(el, 'clientWidth', {
    configurable: true,
    value: client,
  })
  triggerResize()
}

beforeEach(() => {
  observerCallbacks = []
  vi.stubGlobal('ResizeObserver', MockResizeObserver)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('useIsTextTruncated', () => {
  describe('happy path', () => {
    it('reports not truncated when content fits (jsdom default 0/0)', () => {
      render(<Probe text="short" />)
      expect(screen.getByText('short')).toHaveAttribute(
        'data-truncated',
        'false'
      )
    })
  })

  describe('variants', () => {
    it('reports truncated when scrollWidth exceeds clientWidth', () => {
      render(<Probe text="a very long label" />)
      const p = screen.getByText('a very long label')
      forceOverflow(p, 300, 100)
      expect(p).toHaveAttribute('data-truncated', 'true')
    })

    it('reports not truncated when content exactly fits', () => {
      render(<Probe text="exact" />)
      const p = screen.getByText('exact')
      forceOverflow(p, 100, 100)
      expect(p).toHaveAttribute('data-truncated', 'false')
    })
  })

  // L3: managed errors — N/A (no error path)

  describe('unmanaged errors', () => {
    it('does not throw when unmounted (observer disconnected)', () => {
      const { unmount } = render(<Probe text="x" />)
      expect(() => {
        unmount()
      }).not.toThrow()
    })
  })

  describe('edge cases', () => {
    it('exposes a ref and a boolean flag', () => {
      render(<Probe text="x" />)
      const p = screen.getByText('x')
      expect(['true', 'false']).toContain(p.getAttribute('data-truncated'))
    })
  })
})
