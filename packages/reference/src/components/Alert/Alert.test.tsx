import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Alert } from './Alert'

describe('Alert', () => {
  describe('happy path', () => {
    it('renders its message inside a polite live region', () => {
      render(<Alert>Your changes were saved.</Alert>)

      const alert = screen.getByRole('status')
      expect(alert).toHaveTextContent('Your changes were saved.')
      expect(alert).toHaveClass('ui-alert')
    })

    it('renders an optional title alongside the message', () => {
      render(<Alert title="Saved">Your changes were saved.</Alert>)

      expect(screen.getByText('Saved')).toBeInTheDocument()
      expect(screen.getByText('Your changes were saved.')).toBeInTheDocument()
    })
  })

  describe('variants', () => {
    it.each([
      ['info', null, 'status'],
      ['success', 'ui-alert--success', 'status'],
      ['warning', 'ui-alert--warning', 'alert'],
      ['error', 'ui-alert--error', 'alert'],
    ] as const)(
      'maps the %s intent to its modifier and live-region politeness',
      (variant, modifier, expectedRole) => {
        render(<Alert variant={variant}>Message</Alert>)
        const alert = screen.getByRole(expectedRole)

        expect(alert).toHaveClass('ui-alert')
        if (modifier) expect(alert).toHaveClass(modifier)
        else expect(alert.className).toBe('ui-alert')
      }
    )

    it('renders a distinct glyph per intent, so meaning is not colour-only', () => {
      const { container, rerender } = render(<Alert variant="success">M</Alert>)
      const success = container.querySelector('.ui-alert__icon')?.innerHTML

      rerender(<Alert variant="error">M</Alert>)
      const error = container.querySelector('.ui-alert__icon')?.innerHTML

      expect(success).toBeTruthy()
      expect(error).toBeTruthy()
      expect(success).not.toBe(error)
    })

    it('shows a dismiss button only when onDismiss is given', () => {
      const { rerender } = render(<Alert>Message</Alert>)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()

      rerender(<Alert onDismiss={vi.fn()}>Message</Alert>)
      expect(
        screen.getByRole('button', { name: 'Dismiss' })
      ).toBeInTheDocument()
    })

    it('lets the dismiss button be renamed', () => {
      render(
        <Alert onDismiss={vi.fn()} dismissLabel="Close notification">
          Message
        </Alert>
      )

      expect(
        screen.getByRole('button', { name: 'Close notification' })
      ).toBeInTheDocument()
    })

    it('accepts a custom glyph', () => {
      const { container } = render(
        <Alert icon={<span data-testid="custom">★</span>}>Message</Alert>
      )

      expect(screen.getByTestId('custom')).toBeInTheDocument()
      expect(container.querySelector('.ui-alert__icon')).toBeInTheDocument()
    })
  })

  describe('managed errors', () => {
    it('calls onDismiss when the button is pressed', async () => {
      const onDismiss = vi.fn()
      const user = userEvent.setup()
      render(<Alert onDismiss={onDismiss}>Message</Alert>)

      await user.click(screen.getByRole('button', { name: 'Dismiss' }))

      expect(onDismiss).toHaveBeenCalledOnce()
    })

    it('does not remove itself on dismiss — that is the consumer’s job', async () => {
      const user = userEvent.setup()
      render(<Alert onDismiss={vi.fn()}>Still here</Alert>)

      await user.click(screen.getByRole('button', { name: 'Dismiss' }))

      expect(screen.getByText('Still here')).toBeInTheDocument()
    })

    it('lets the consumer override the live-region role', () => {
      render(
        <Alert variant="error" role="status">
          Not urgent after all
        </Alert>
      )

      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  // L4: N/A — a presentational block with no async path and no external dependency to fail.

  describe('edge cases', () => {
    it('renders with no message at all', () => {
      render(<Alert title="Heads up" />)

      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('Heads up')).toBeInTheDocument()
    })

    it('drops the glyph entirely when icon is null', () => {
      const { container } = render(<Alert icon={null}>Message</Alert>)

      expect(container.querySelector('.ui-alert__icon')).toBeNull()
    })

    it('renders rich nodes in the title and the message', () => {
      render(
        <Alert title={<strong>Quota</strong>}>
          <em>Almost full</em>
        </Alert>
      )

      expect(screen.getByText('Quota').tagName).toBe('STRONG')
      expect(screen.getByText('Almost full').tagName).toBe('EM')
    })

    it('merges a consumer className without dropping the block class', () => {
      render(<Alert className="custom">Message</Alert>)
      const alert = screen.getByRole('status')

      expect(alert).toHaveClass('ui-alert')
      expect(alert).toHaveClass('custom')
    })

    it('forwards rest props to the root element', () => {
      render(
        <Alert data-testid="alert" id="quota">
          Message
        </Alert>
      )

      expect(screen.getByTestId('alert')).toHaveAttribute('id', 'quota')
    })
  })
})
