import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Button from './Button'

import '@testing-library/jest-dom'

vi.mock('next/link', () => ({
  default: ({
    children,
    ...props
  }: React.PropsWithChildren<{ href: string; className?: string }>) => (
    <a data-next-link {...props}>
      {children}
    </a>
  ),
}))

vi.mock('../../Icon', () => ({
  Icon: ({ name, ...props }: { name: string }) => (
    <span data-testid="icon" data-name={name} {...props} />
  ),
}))

describe('Button (next) — as="zone-link"', () => {
  it('renders a plain <a> tag with href', () => {
    render(
      <Button as="zone-link" href="/actor/42">
        View Actor
      </Button>
    )
    const link = screen.getByRole('link', { name: /view actor/i })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/actor/42')
    expect(link).not.toHaveAttribute('data-next-link')
  })

  it('applies button visual classes', () => {
    render(
      <Button as="zone-link" href="/test" variant="primary" size="lg">
        Click
      </Button>
    )
    const link = screen.getByRole('link')
    expect(link.className).toContain('ui:bg-primary')
    expect(link.className).toContain('ui:h-12')
  })

  it('applies the same classes as as="link"', () => {
    const { rerender } = render(
      <Button as="link" href="/test" variant="outline" size="md">
        Link
      </Button>
    )
    const linkClasses = screen.getByRole('link').className

    rerender(
      <Button as="zone-link" href="/test" variant="outline" size="md">
        Link
      </Button>
    )
    const zoneLinkClasses = screen.getByRole('link').className

    expect(zoneLinkClasses).toBe(linkClasses)
  })
})

describe('Button (next) — as="link" regression', () => {
  it('renders a next/link with data-next-link attribute', () => {
    render(
      <Button as="link" href="/movie/278">
        Details
      </Button>
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('data-next-link')
    expect(link).toHaveAttribute('href', '/movie/278')
  })
})

describe('Button (next) — as="button" regression', () => {
  it('renders a button element', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
})
