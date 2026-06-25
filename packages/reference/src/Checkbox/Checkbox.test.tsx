import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Checkbox } from './Checkbox'

afterEach(cleanup)

describe('Checkbox', () => {
  describe('happy path', () => {
    it('renders an unchecked checkbox', () => {
      render(<Checkbox checked={false} onChange={vi.fn()} />)
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('renders a checked checkbox', () => {
      render(<Checkbox checked={true} onChange={vi.fn()} />)
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('fires the native onChange and toggles when clicked', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      // uncontrolled so the DOM actually toggles (a controlled input with a no-op handler
      // would be reverted by React before we could read the new value)
      render(<Checkbox onChange={onChange} />)
      const input = screen.getByRole<HTMLInputElement>('checkbox')
      await user.click(input)
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(input).toBeChecked()
    })
  })

  describe('variants', () => {
    it('applies the sm size modifier on the row', () => {
      render(
        <Checkbox checked={false} onChange={vi.fn()} size="sm" label="x" />
      )
      expect(screen.getByText('x').closest('label')).toHaveClass(
        'ui-checkbox--sm'
      )
    })

    it('emits no size modifier for md (base)', () => {
      render(
        <Checkbox checked={false} onChange={vi.fn()} size="md" label="x" />
      )
      const row = screen.getByText('x').closest('label')
      expect(row).toHaveClass('ui-checkbox')
      expect(row).not.toHaveClass('ui-checkbox--sm')
    })

    it('renders the label text', () => {
      render(
        <Checkbox checked={false} onChange={vi.fn()} label="Accept terms" />
      )
      expect(screen.getByText('Accept terms')).toBeInTheDocument()
    })

    it('uses the label as the accessible name', () => {
      render(
        <Checkbox checked={false} onChange={vi.fn()} label="Accept terms" />
      )
      expect(screen.getByRole('checkbox')).toHaveAccessibleName('Accept terms')
    })

    it('sets the indeterminate property on the input', () => {
      render(<Checkbox checked={false} onChange={vi.fn()} indeterminate />)
      expect(screen.getByRole<HTMLInputElement>('checkbox').indeterminate).toBe(
        true
      )
    })
  })

  describe('managed errors', () => {
    it('renders the error message with role="alert"', () => {
      render(
        <Checkbox
          checked={false}
          onChange={vi.fn()}
          error="This field is required"
        />
      )
      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent('This field is required')
    })

    it('marks the input invalid and links the message via aria-describedby', () => {
      render(<Checkbox checked={false} onChange={vi.fn()} error="Required" />)
      const input = screen.getByRole('checkbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input.getAttribute('aria-describedby')).toBe(
        screen.getByRole('alert').id
      )
    })

    it('applies the invalid modifier on the row', () => {
      render(
        <Checkbox
          checked={false}
          onChange={vi.fn()}
          error="Required"
          label="x"
        />
      )
      expect(screen.getByText('x').closest('label')).toHaveClass(
        'ui-checkbox--invalid'
      )
    })

    it('does not fire onChange when disabled', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<Checkbox checked={false} onChange={onChange} disabled />)
      await user.click(screen.getByRole('checkbox'))
      expect(onChange).not.toHaveBeenCalled()
      expect(screen.getByRole('checkbox')).toBeDisabled()
    })
  })

  describe('unmanaged errors', () => {
    it('renders bare (no label, no message) without crashing', () => {
      render(<Checkbox checked={false} onChange={vi.fn()} />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(screen.queryByRole('alert')).toBeNull()
    })

    it('omits aria-invalid and aria-describedby when there is no error', () => {
      render(<Checkbox checked={false} onChange={vi.fn()} />)
      const input = screen.getByRole('checkbox')
      expect(input).not.toHaveAttribute('aria-invalid')
      expect(input).not.toHaveAttribute('aria-describedby')
    })
  })

  describe('edge cases', () => {
    it('lets aria-label override the visible label as accessible name', () => {
      render(
        <Checkbox
          checked={false}
          onChange={vi.fn()}
          label="Accept"
          aria-label="Accept the terms and conditions"
        />
      )
      expect(screen.getByRole('checkbox')).toHaveAccessibleName(
        'Accept the terms and conditions'
      )
    })

    it('supports uncontrolled usage via defaultChecked', async () => {
      const user = userEvent.setup()
      render(<Checkbox defaultChecked />)
      const input = screen.getByRole<HTMLInputElement>('checkbox')
      expect(input).toBeChecked()
      await user.click(input)
      expect(input).not.toBeChecked()
    })

    it('forwards arbitrary native attributes (name, value)', () => {
      render(
        <Checkbox checked={false} onChange={vi.fn()} name="agree" value="yes" />
      )
      const input = screen.getByRole('checkbox')
      expect(input).toHaveAttribute('name', 'agree')
      expect(input).toHaveAttribute('value', 'yes')
    })
  })
})
