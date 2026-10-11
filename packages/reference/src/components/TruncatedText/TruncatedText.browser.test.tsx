import { render, screen } from '@testing-library/react'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'

import { TruncatedText } from './TruncatedText'

// Real Chromium: real text layout, so the cut is MEASURED (scrollWidth vs clientWidth) and a real
// ResizeObserver reports box changes — none of which jsdom computes.

const LONG = 'The Holy Roman Empire of the German Nation, from 962 to 1806'

/**
 * A TruncatedText in a box of a given width.
 *
 * @param props - The box width and the text.
 * @param props.width - Width of the container, in px.
 * @param props.text - The text.
 * @returns The fixture.
 */
function Boxed({ width, text = LONG }: { width: number; text?: string }) {
  return (
    <div style={{ inlineSize: `${String(width)}px`, padding: '40px' }}>
      <TruncatedText>{text}</TruncatedText>
    </div>
  )
}

// The text itself, not the bubble repeating it once revealed.
const text = () => {
  const element = document.querySelector<HTMLElement>('.ui-truncated-text')
  if (!element) throw new Error('text not rendered')
  return element
}
const bubble = () => screen.queryByRole('tooltip', { hidden: true })

describe('TruncatedText (browser)', () => {
  // The real pointer stays where the previous test left it: park it in a corner.
  beforeEach(async () => {
    await userEvent.hover(document.documentElement, {
      position: { x: 1, y: 1 },
    })
  })

  describe('happy path', () => {
    it('cuts a long text with an ellipsis and reveals it on keyboard focus', async () => {
      render(<Boxed width={120} />)
      const style = getComputedStyle(text())
      expect(style.textOverflow).toBe('ellipsis')
      expect(text().scrollWidth).toBeGreaterThan(text().clientWidth)

      await userEvent.keyboard('{Tab}')
      expect(text()).toHaveFocus()
      await vi.waitFor(() => {
        expect(bubble()).toHaveTextContent(LONG)
      })
    })

    it('reveals it on hover too', async () => {
      render(<Boxed width={120} />)
      await userEvent.hover(text())
      await vi.waitFor(() => {
        expect(bubble()).not.toBeNull()
      })
    })
  })

  describe('variants', () => {
    it('a text that fits is plain: no tab stop, no tooltip', async () => {
      render(<Boxed width={900} />)
      expect(text()).not.toHaveAttribute('tabindex')
      await userEvent.hover(text())
      await new Promise((resolve) => setTimeout(resolve, 400))
      expect(bubble()).toBeNull()
    })

    it('hides the bubble from assistive technology — the full text is already read', async () => {
      render(<Boxed width={120} />)
      await userEvent.keyboard('{Tab}')
      await vi.waitFor(() => {
        expect(bubble()).toHaveAttribute('aria-hidden', 'true')
      })
      expect(text()).not.toHaveAttribute('aria-describedby')
      expect(text()).toHaveAccessibleName('')
      // The DOM keeps the whole text: a screen reader reads it, cut or not.
      expect(text()).toHaveTextContent(LONG)
    })

    it('renders the element asked for', () => {
      render(
        <div style={{ inlineSize: '120px' }}>
          <TruncatedText as="p">{LONG}</TruncatedText>
        </div>
      )
      expect(text().tagName).toBe('P')
    })
  })

  describe('managed errors', () => {
    it('Escape dismisses the bubble and keeps focus on the text', async () => {
      render(<Boxed width={120} />)
      await userEvent.keyboard('{Tab}')
      await vi.waitFor(() => {
        expect(bubble()).not.toBeNull()
      })
      await userEvent.keyboard('{Escape}')
      expect(bubble()).toBeNull()
      expect(text()).toHaveFocus()
    })
  })

  describe('consumer control', () => {
    it('a consumer onKeyDown that prevents Escape keeps the bubble open', async () => {
      render(
        <div style={{ inlineSize: '120px', padding: '40px' }}>
          <TruncatedText
            onKeyDown={(event) => {
              if (event.key === 'Escape') event.preventDefault()
            }}
          >
            {LONG}
          </TruncatedText>
        </div>
      )
      await userEvent.keyboard('{Tab}')
      await vi.waitFor(() => {
        expect(bubble()).not.toBeNull()
      })
      await userEvent.keyboard('{Escape}')
      expect(bubble()).not.toBeNull()
    })

    it('forwards the tooltip look', async () => {
      render(
        <div style={{ inlineSize: '120px', padding: '40px' }}>
          <TruncatedText tooltipVariant="light">{LONG}</TruncatedText>
        </div>
      )
      await userEvent.keyboard('{Tab}')
      await vi.waitFor(() => {
        expect(bubble()).toHaveClass('ui-tooltip--light')
      })
    })
  })

  // L4: N/A — no async source; a non-string child is a type error (children: string).

  describe('edge cases', () => {
    it('becomes revealable when its box shrinks, and plain again when it grows', async () => {
      function Resizable() {
        const [width, setWidth] = useState(900)
        return (
          <>
            <button
              type="button"
              onClick={() => {
                setWidth((current) => (current === 900 ? 120 : 900))
              }}
            >
              Resize
            </button>
            <Boxed width={width} />
          </>
        )
      }
      render(<Resizable />)
      expect(text()).not.toHaveAttribute('tabindex')

      await userEvent.click(screen.getByRole('button', { name: 'Resize' }))
      await vi.waitFor(() => {
        expect(text()).toHaveAttribute('tabindex', '0')
      })

      await userEvent.click(screen.getByRole('button', { name: 'Resize' }))
      await vi.waitFor(() => {
        expect(text()).not.toHaveAttribute('tabindex')
      })
    })

    it('keeps the bubble valid inside a paragraph: it is a span', async () => {
      render(
        <p style={{ inlineSize: '120px' }}>
          <TruncatedText>{LONG}</TruncatedText>
        </p>
      )
      await userEvent.keyboard('{Tab}')
      await vi.waitFor(() => {
        expect(bubble()?.tagName).toBe('SPAN')
      })
    })

    it('a too-long text that changes to a short one stops being revealable', async () => {
      const { rerender } = render(<Boxed width={120} />)
      await vi.waitFor(() => {
        expect(text()).toHaveAttribute('tabindex', '0')
      })
      rerender(<Boxed width={120} text="Rome" />)
      await vi.waitFor(() => {
        expect(screen.getByText('Rome')).not.toHaveAttribute('tabindex')
      })
    })
  })
})
