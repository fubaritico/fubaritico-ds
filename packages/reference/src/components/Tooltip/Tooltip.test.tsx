import { cleanup, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { Tooltip } from './Tooltip'

afterEach(cleanup)

describe('Tooltip', () => {
  describe('happy path', () => {
    it('renders nothing when not visible', () => {
      render(
        <Tooltip
          content="Hi"
          visible={false}
          mode="manual"
          position={{ top: 0, left: 0 }}
        />
      )
      expect(screen.queryByRole('tooltip')).toBeNull()
    })

    it('renders the bubble with its content when visible', () => {
      render(
        <Tooltip
          content="Helpful hint"
          visible
          mode="manual"
          position={{ top: 10, left: 20 }}
        />
      )
      const tip = screen.getByRole('tooltip')
      expect(tip).toHaveTextContent('Helpful hint')
    })
  })

  describe('variants', () => {
    it('applies the dark (base) class by default', () => {
      render(
        <Tooltip
          content="x"
          visible
          mode="manual"
          position={{ top: 0, left: 0 }}
        />
      )
      const tip = screen.getByRole('tooltip')
      expect(tip).toHaveClass('ui-tooltip')
      expect(tip).not.toHaveClass('ui-tooltip--light')
    })

    it('applies the light modifier', () => {
      render(
        <Tooltip
          content="x"
          visible
          variant="light"
          mode="manual"
          position={{ top: 0, left: 0 }}
        />
      )
      expect(screen.getByRole('tooltip')).toHaveClass('ui-tooltip--light')
    })

    it('positions the bubble at the manual coordinates', () => {
      render(
        <Tooltip
          content="x"
          visible
          mode="manual"
          position={{ top: 42, left: 84 }}
        />
      )
      const tip = screen.getByRole('tooltip')
      expect(tip.style.top).toBe('42px')
      expect(tip.style.left).toBe('84px')
    })

    it('applies aria-label when provided', () => {
      render(
        <Tooltip
          content="x"
          visible
          mode="manual"
          position={{ top: 0, left: 0 }}
          aria-label="More info"
        />
      )
      expect(screen.getByRole('tooltip')).toHaveAttribute(
        'aria-label',
        'More info'
      )
    })
  })

  describe('managed errors', () => {
    it('hides (returns null) when toggled invisible', () => {
      const { rerender } = render(
        <Tooltip
          content="x"
          visible
          mode="manual"
          position={{ top: 0, left: 0 }}
        />
      )
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
      rerender(
        <Tooltip
          content="x"
          visible={false}
          mode="manual"
          position={{ top: 0, left: 0 }}
        />
      )
      expect(screen.queryByRole('tooltip')).toBeNull()
    })
  })

  describe('unmanaged errors', () => {
    it('renders without crashing in target mode before measurement', () => {
      const ref = createRef<HTMLButtonElement>()
      render(
        <>
          <button ref={ref}>anchor</button>
          <Tooltip content="x" visible mode="target" targetRef={ref} />
        </>
      )
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('renders no arrow in manual mode', () => {
      const { container } = render(
        <Tooltip
          content="x"
          visible
          mode="manual"
          position={{ top: 0, left: 0 }}
        />
      )
      // the arrow lives in the portal, not the render container; query the document
      expect(document.querySelector('.ui-tooltip__arrow')).toBeNull()
      expect(container).toBeTruthy()
    })

    it('applies an explicit width', () => {
      render(
        <Tooltip
          content="A longer message that would wrap"
          visible
          width={200}
          mode="manual"
          position={{ top: 0, left: 0 }}
        />
      )
      expect(screen.getByRole('tooltip').style.width).toBe('200px')
    })
  })
})
