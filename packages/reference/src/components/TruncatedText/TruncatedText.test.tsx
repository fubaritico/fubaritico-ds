import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { TruncatedText } from './TruncatedText'

// jsdom lays nothing out: every box measures 0, so a text is never "truncated" on its own. The
// wiring is tested here with stubbed widths; the real measurement lives in the browser suite.

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

const text = () => screen.getByText('Holy Roman Empire')

describe('TruncatedText', () => {
  describe('happy path', () => {
    it('renders the text in a span wearing the skin class', () => {
      render(<TruncatedText>Holy Roman Empire</TruncatedText>)
      expect(text().tagName).toBe('SPAN')
      expect(text()).toHaveClass('ui-truncated-text')
    })

    it('becomes focusable when the text overflows its box', () => {
      overflow = { scrollWidth: 300, clientWidth: 100 }
      render(<TruncatedText>Holy Roman Empire</TruncatedText>)
      expect(text()).toHaveAttribute('tabindex', '0')
    })
  })

  describe('variants', () => {
    it('renders the element asked for', () => {
      render(<TruncatedText as="div">Holy Roman Empire</TruncatedText>)
      expect(text().tagName).toBe('DIV')
    })

    it('merges a consumer className with the block class', () => {
      render(<TruncatedText className="mine">Holy Roman Empire</TruncatedText>)
      expect(text()).toHaveClass('ui-truncated-text', 'mine')
    })
  })

  describe('managed errors', () => {
    it('stays a plain text, with no tab stop, when it fits', () => {
      render(<TruncatedText>Holy Roman Empire</TruncatedText>)
      expect(text()).not.toHaveAttribute('tabindex')
      expect(screen.queryByRole('tooltip', { hidden: true })).toBeNull()
    })
  })

  describe('unmanaged errors', () => {
    it('runs the consumer handlers before its own, and keeps the consumer ref', async () => {
      overflow = { scrollWidth: 300, clientWidth: 100 }
      const ref = createRef<HTMLSpanElement>()
      const onFocus = vi.fn()
      const onKeyDown = vi.fn()
      render(
        <TruncatedText ref={ref} onFocus={onFocus} onKeyDown={onKeyDown}>
          Holy Roman Empire
        </TruncatedText>
      )
      expect(ref.current).toBe(text())
      await userEvent.tab()
      expect(onFocus).toHaveBeenCalledOnce()
      await userEvent.keyboard('{Escape}')
      expect(onKeyDown).toHaveBeenCalledOnce()
    })
  })

  describe('unmanaged errors — pointer and blur composition', () => {
    it('runs the consumer pointer and blur handlers', async () => {
      overflow = { scrollWidth: 300, clientWidth: 100 }
      const onPointerEnter = vi.fn()
      const onPointerLeave = vi.fn()
      const onBlur = vi.fn()
      render(
        <>
          <TruncatedText
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onBlur={onBlur}
          >
            Holy Roman Empire
          </TruncatedText>
          <button type="button">After</button>
        </>
      )
      await userEvent.hover(text())
      await userEvent.unhover(text())
      await userEvent.tab()
      await userEvent.tab()
      expect(onPointerEnter).toHaveBeenCalledOnce()
      expect(onPointerLeave).toHaveBeenCalledOnce()
      expect(onBlur).toHaveBeenCalledOnce()
    })
  })

  describe('edge cases', () => {
    it('lets a consumer tabIndex win, even while the text is cut (a grid owning the focus)', () => {
      overflow = { scrollWidth: 300, clientWidth: 100 }
      render(<TruncatedText tabIndex={-1}>Holy Roman Empire</TruncatedText>)
      expect(text()).toHaveAttribute('tabindex', '-1')
    })

    it('renders an empty string without crashing', () => {
      const { container } = render(<TruncatedText>{''}</TruncatedText>)
      expect(container.querySelector('.ui-truncated-text')).toBeInTheDocument()
    })
  })
})
