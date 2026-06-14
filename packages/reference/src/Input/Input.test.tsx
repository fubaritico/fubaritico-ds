import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import Input from './Input'

describe('Input', () => {
  describe('happy path', () => {
    it('should render a text input by default', () => {
      render(<Input placeholder="Enter text" />)
      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toBeInTheDocument()
      expect(input).toHaveClass('ui-input')
    })

    it('should forward native attributes', () => {
      render(<Input type="email" name="email" required disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
      expect(input).toHaveAttribute('name', 'email')
      expect(input).toBeRequired()
      expect(input).toBeDisabled()
    })

    it('should merge a custom className onto the control', () => {
      render(<Input className="custom-class" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('ui-input')
      expect(input).toHaveClass('custom-class')
    })

    it('should handle onChange', async () => {
      const onChange = vi.fn()
      render(<Input onChange={onChange} />)
      await userEvent.type(screen.getByRole('textbox'), 'hello')
      expect(onChange).toHaveBeenCalledTimes(5)
    })
  })

  describe('variants', () => {
    it('should render the sm size modifier', () => {
      render(<Input size="sm" />)
      expect(screen.getByRole('textbox')).toHaveClass('ui-input--sm')
    })

    it('should emit no size modifier for md (base)', () => {
      render(<Input size="md" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('ui-input')
      expect(input).not.toHaveClass('ui-input--sm')
      expect(input).not.toHaveClass('ui-input--lg')
    })

    it('should render the lg size modifier', () => {
      render(<Input size="lg" />)
      expect(screen.getByRole('textbox')).toHaveClass('ui-input--lg')
    })

    it('should not wrap in an affix when there is no icon', () => {
      const { container } = render(<Input />)
      expect(container.querySelector('.ui-input-affix')).not.toBeInTheDocument()
    })

    it('should wrap in an affix and render the icon when an icon is given', () => {
      const { container } = render(<Input icon="MagnifyingGlass" />)
      expect(container.querySelector('.ui-input-affix')).toBeInTheDocument()
      expect(
        container.querySelector('.ui-input-affix__icon')
      ).toBeInTheDocument()
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('should reserve end padding via --has-icon when an icon is present', () => {
      render(<Input icon="MagnifyingGlass" />)
      expect(screen.getByRole('textbox')).toHaveClass('ui-input--has-icon')
    })

    it('should size the affix with the control', () => {
      const { container } = render(<Input icon="MagnifyingGlass" size="sm" />)
      expect(container.querySelector('.ui-input-affix')).toHaveClass(
        'ui-input-affix--sm'
      )
    })

    it('should render a label linked to the control', () => {
      render(<Input label="Email" />)
      const input = screen.getByLabelText('Email')
      expect(input.tagName).toBe('INPUT')
      expect(screen.getByText('Email')).toHaveClass('ui-field__label')
    })

    it('should use an external id for label association', () => {
      render(<Input label="Email" id="my-input" />)
      expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'my-input')
    })

    it('should size the field wrapper with the control', () => {
      const { container } = render(<Input label="Email" size="lg" />)
      expect(container.querySelector('.ui-field')).toHaveClass('ui-field--lg')
    })

    it('should render an info message linked via aria-describedby', () => {
      render(<Input message="Helpful hint" id="test-input" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'test-input-message')
      const message = screen.getByText('Helpful hint')
      expect(message).toHaveAttribute('id', 'test-input-message')
      expect(message).toHaveClass('ui-field__message')
      expect(message).not.toHaveClass('ui-field__message--error')
    })

    it('should not flag an info message as invalid', () => {
      render(<Input message="Just info" messageType="info" />)
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
      expect(screen.getByText('Just info')).not.toHaveAttribute('role')
    })
  })

  describe('managed errors', () => {
    it('should set aria-invalid and the invalid modifier on error', () => {
      render(<Input message="Required field" messageType="error" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveClass('ui-input--invalid')
    })

    it('should render the error message with the alert role and error modifier', () => {
      render(<Input message="Required field" messageType="error" />)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent('Required field')
      expect(alert).toHaveClass('ui-field__message--error')
    })

    it('should prefix the error message with an icon (not colour-only)', () => {
      render(<Input message="Required field" messageType="error" />)
      // The error state must not rely on colour alone (WCAG 1.4.1) — a leading icon is present.
      expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument()
    })

    it('should not render an icon on an info message', () => {
      render(<Input message="Just info" messageType="info" />)
      expect(screen.getByText('Just info').querySelector('svg')).toBeNull()
    })

    it('should prevent interaction when disabled', () => {
      render(<Input disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })
  })

  describe('unmanaged errors', () => {
    it('should not flag invalid when messageType is error but there is no message', () => {
      render(<Input messageType="error" />)
      const input = screen.getByRole('textbox')
      expect(input).not.toHaveAttribute('aria-invalid')
      expect(input).not.toHaveClass('ui-input--invalid')
    })

    it('should not set aria-describedby when there is no message', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).not.toHaveAttribute(
        'aria-describedby'
      )
    })

    it('should not render a label when none is provided', () => {
      const { container } = render(<Input />)
      expect(container.querySelector('label')).not.toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should render bare (no field wrapper) when neither label nor message is set', () => {
      const { container } = render(<Input />)
      expect(container.querySelector('.ui-field')).not.toBeInTheDocument()
    })

    it('should render label + icon + error message together', () => {
      const { container } = render(
        <Input
          label="Search"
          icon="MagnifyingGlass"
          message="No results found"
          messageType="error"
        />
      )
      expect(screen.getByLabelText('Search')).toBeInTheDocument()
      expect(
        container.querySelector('.ui-input-affix__icon')
      ).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('No results found')
      expect(screen.getByRole('textbox')).toHaveClass(
        'ui-input--invalid',
        'ui-input--has-icon'
      )
    })

    it('should render a field with only a message and no label', () => {
      const { container } = render(<Input message="Hint only" />)
      expect(container.querySelector('label')).not.toBeInTheDocument()
      expect(container.querySelector('.ui-field')).toBeInTheDocument()
      expect(screen.getByText('Hint only')).toBeInTheDocument()
    })
  })
})
