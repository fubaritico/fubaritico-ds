import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithRouter } from '@fubaritico-ds/shared/test-utils'

import { Button } from '../react-router/Button'

describe('Button (as="button")', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    render(<Button>Primary</Button>)
    expect(screen.getByRole('button').className).toContain('ui:bg-primary')
  })

  it('applies secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button').className).toContain('ui:bg-secondary')
  })

  it('applies size classes', () => {
    render(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button').className).toContain('ui:h-12')
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('passes additional props', () => {
    render(<Button data-testid="custom-button">Test</Button>)
    expect(screen.getByTestId('custom-button')).toBeInTheDocument()
  })
})

describe('Button (as="link")', () => {
  it('renders a link element', () => {
    renderWithRouter(
      <Button as="link" to="/test">
        Go
      </Button>
    )
    expect(screen.getByRole('link', { name: 'Go' })).toBeInTheDocument()
  })

  it('applies the correct href', () => {
    renderWithRouter(
      <Button as="link" to="/movie/278">
        Details
      </Button>
    )
    expect(screen.getByRole('link')).toHaveAttribute('href', '/movie/278')
  })

  it('applies variant classes', () => {
    renderWithRouter(
      <Button as="link" to="/test" variant="outline">
        Outline
      </Button>
    )
    expect(screen.getByRole('link').className).toContain('ui:border-input')
  })
})
