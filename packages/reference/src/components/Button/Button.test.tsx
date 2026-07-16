import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from './Button'

describe('Button', () => {
  describe('happy path', () => {
    it('renders children in a button element', () => {
      render(<Button>Click me</Button>)
      expect(
        screen.getByRole('button', { name: 'Click me' })
      ).toBeInTheDocument()
    })

    it('applies the base skin class', () => {
      render(<Button>Primary</Button>)
      expect(screen.getByRole('button').className).toContain('ui-button')
    })
  })

  describe('variants', () => {
    it('emits no variant modifier for the default primary', () => {
      render(<Button>Primary</Button>)
      const cls = screen.getByRole('button').className
      expect(cls).toContain('ui-button')
      expect(cls).not.toContain('ui-button--')
    })

    it.each([
      ['secondary', 'ui-button--secondary'],
      ['destructive', 'ui-button--destructive'],
      ['outline', 'ui-button--outline'],
      ['ghost', 'ui-button--ghost'],
    ] as const)('emits the modifier for variant "%s"', (variant, expected) => {
      render(<Button variant={variant}>Label</Button>)
      expect(screen.getByRole('button').className).toContain(expected)
    })

    it.each([
      ['sm', 'ui-button--sm'],
      ['lg', 'ui-button--lg'],
    ] as const)('emits the modifier for size "%s"', (size, expected) => {
      render(<Button size={size}>Label</Button>)
      expect(screen.getByRole('button').className).toContain(expected)
    })

    it('emits the icon-right modifier when iconPosition is right', () => {
      render(<Button iconPosition="right">Label</Button>)
      expect(screen.getByRole('button').className).toContain(
        'ui-button--icon-right'
      )
    })
  })

  describe('managed errors', () => {
    it('disables the button element', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('unmanaged errors', () => {
    it('forwards arbitrary attributes to the button', () => {
      render(<Button data-testid="custom-button">Test</Button>)
      expect(screen.getByTestId('custom-button')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('merges a consumer className with the resolved skin classes', () => {
      render(<Button className="my-class">Label</Button>)
      const cls = screen.getByRole('button').className
      expect(cls).toContain('ui-button')
      expect(cls).toContain('my-class')
    })
  })
})
