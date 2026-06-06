import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import Input from './Input'

describe('Input', () => {
  // --- Rendering ---

  it('should render a text input by default', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('should forward native attributes', () => {
    render(<Input type="email" name="email" required disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('name', 'email')
    expect(input).toBeRequired()
    expect(input).toBeDisabled()
  })

  it('should apply custom className', () => {
    render(<Input className="custom-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-class')
  })

  // --- Sizes ---

  it('should render sm size', () => {
    render(<Input inputSize="sm" />)
    expect(screen.getByRole('textbox')).toHaveClass('ui:h-8')
  })

  it('should render md size by default', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toHaveClass('ui:h-10')
  })

  it('should render lg size', () => {
    render(<Input inputSize="lg" />)
    expect(screen.getByRole('textbox')).toHaveClass('ui:h-12')
  })

  // --- Icon ---

  it('should render without icon wrapper when no icon', () => {
    const { container } = render(<Input />)
    expect(container.querySelector('.ui\\:relative')).not.toBeInTheDocument()
  })

  it('should render icon on the right', () => {
    const { container } = render(<Input icon="MagnifyingGlass" />)
    expect(container.querySelector('.ui\\:relative')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('should add extra right padding when icon is present', () => {
    render(<Input icon="MagnifyingGlass" inputSize="md" />)
    expect(screen.getByRole('textbox')).toHaveClass('ui:pr-10')
  })

  it('should make icon non-interactive', () => {
    const { container } = render(<Input icon="MagnifyingGlass" />)
    const iconWrapper = container.querySelector('span')
    expect(iconWrapper).toHaveClass('ui:pointer-events-none')
  })

  // --- Label ---

  it('should render label linked to input', () => {
    render(<Input label="Email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toBeInTheDocument()
    expect(input.tagName).toBe('INPUT')
  })

  it('should use external id for label association', () => {
    render(<Input label="Email" id="my-input" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('id', 'my-input')
  })

  it('should not render label when not provided', () => {
    const { container } = render(<Input />)
    expect(container.querySelector('label')).not.toBeInTheDocument()
  })

  // --- Message (info) ---

  it('should render info message', () => {
    render(<Input message="Helpful hint" />)
    expect(screen.getByText('Helpful hint')).toBeInTheDocument()
  })

  it('should link message to input via aria-describedby', () => {
    render(<Input message="Helpful hint" id="test-input" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-describedby', 'test-input-message')
    expect(screen.getByText('Helpful hint')).toHaveAttribute(
      'id',
      'test-input-message'
    )
  })

  it('should not set aria-invalid for info message', () => {
    render(<Input message="Just info" messageType="info" />)
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
  })

  it('should not set role alert for info message', () => {
    render(<Input message="Just info" messageType="info" />)
    expect(screen.getByText('Just info')).not.toHaveAttribute('role')
  })

  // --- Message (error) ---

  it('should set aria-invalid on error', () => {
    render(<Input message="Required field" messageType="error" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('should render error message with alert role', () => {
    render(<Input message="Required field" messageType="error" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Required field')
  })

  it('should apply destructive border on error', () => {
    render(<Input message="Error" messageType="error" />)
    expect(screen.getByRole('textbox')).toHaveClass('ui:border-destructive')
  })

  it('should apply default border when no error', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toHaveClass('ui:border-input')
  })

  it('should not set aria-invalid when messageType is error but no message', () => {
    render(<Input messageType="error" />)
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
  })

  // --- No message ---

  it('should not render aria-describedby when no message', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby')
  })

  // --- Interaction ---

  it('should handle onChange', async () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), 'hello')
    expect(onChange).toHaveBeenCalledTimes(5)
  })

  // --- Combined ---

  it('should render label + icon + error message together', () => {
    render(
      <Input
        label="Search"
        icon="MagnifyingGlass"
        message="No results found"
        messageType="error"
      />
    )
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('No results found')
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })
})
