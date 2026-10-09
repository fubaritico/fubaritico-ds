import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import Popover from './Popover'

// jsdom has no Popover API: these tests cover the wiring (ids, ARIA, anchor, guards). Opening,
// closing, focus return and positioning are in Popover.browser.test.tsx.

/**
 * A minimal popover.
 *
 * @param props - Popover props.
 * @returns The fixture.
 */
function Fixture(props: Partial<Parameters<typeof Popover>[0]>) {
  return (
    <Popover label="Settings" {...props}>
      <Popover.Trigger>Open</Popover.Trigger>
      <Popover.Content>Body</Popover.Content>
    </Popover>
  )
}

const trigger = () => screen.getByRole('button', { name: 'Open' })
const surface = () => screen.getByRole('dialog', { name: 'Settings', hidden: true })

describe('Popover', () => {
  describe('happy path', () => {
    it('wires the trigger to the surface', () => {
      render(<Fixture />)
      expect(trigger()).toHaveAttribute('popovertarget', surface().id)
      expect(trigger()).toHaveAttribute('aria-controls', surface().id)
      expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog')
      expect(trigger()).toHaveAttribute('aria-expanded', 'false')
      expect(surface()).toHaveAttribute('popover', 'auto')
      expect(surface()).toHaveTextContent('Body')
    })
  })

  describe('variants', () => {
    it('anchors the surface to its trigger through one shared anchor name', () => {
      render(<Fixture />)
      const anchor = trigger().style.getPropertyValue('--ui-popover-anchor')
      expect(anchor).toMatch(/^--ui-popover-/)
      expect(surface().style.getPropertyValue('--ui-popover-anchor')).toBe(anchor)
      expect(trigger()).toHaveClass('ui-popover-trigger')
      expect(surface()).toHaveClass('ui-popover')
    })

    it('reflects a controlled open state on the trigger', () => {
      const { rerender } = render(<Fixture open={false} />)
      rerender(<Fixture open />)
      expect(trigger()).toHaveAttribute('aria-expanded', 'true')
    })

    it('keeps consumer props and refs', () => {
      const ref = createRef<HTMLDivElement>()
      render(
        <Popover label="Settings">
          <Popover.Trigger className="mine" data-testid="t">
            Open
          </Popover.Trigger>
          <Popover.Content ref={ref} className="body">
            Body
          </Popover.Content>
        </Popover>
      )
      expect(screen.getByTestId('t')).toHaveClass('mine', 'ui-popover-trigger')
      expect(ref.current).toBe(surface())
      expect(surface()).toHaveClass('body', 'ui-popover')
    })
  })

  describe('managed errors', () => {
    it('throws when a part is used outside <Popover>', () => {
      // React logs the thrown render error; silence it for this test only.
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
      expect(() => render(<Popover.Trigger>Open</Popover.Trigger>)).toThrow(
        'Popover parts must be used within <Popover>'
      )
      consoleError.mockRestore()
    })
  })

  describe('unmanaged errors', () => {
    it('renders the markup without crashing where the Popover API is missing (jsdom)', async () => {
      const user = userEvent.setup()
      render(<Fixture open />)
      await user.click(trigger())
      expect(surface()).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('gives two popovers distinct ids and anchors', () => {
      render(
        <>
          <Fixture />
          <Fixture />
        </>
      )
      const [a, b] = screen.getAllByRole('button', { name: 'Open' })
      expect(a.getAttribute('popovertarget')).not.toBe(b.getAttribute('popovertarget'))
      expect(a.style.getPropertyValue('--ui-popover-anchor')).not.toBe(
        b.style.getPropertyValue('--ui-popover-anchor')
      )
    })
  })
})
