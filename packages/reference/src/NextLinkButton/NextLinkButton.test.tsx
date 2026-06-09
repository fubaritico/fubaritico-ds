import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { NextLinkButton } from './NextLinkButton'

import type { PropsWithChildren } from 'react'

import '@testing-library/jest-dom'

vi.mock('next/link', () => ({
  default: ({
    children,
    ...props
  }: PropsWithChildren<{ href: string; className?: string }>) => (
    <a data-next-link {...props}>
      {children}
    </a>
  ),
}))

vi.mock('../Icon', () => ({
  Icon: ({ name }: { name: string }) => (
    <span data-testid="icon" data-name={name} />
  ),
}))

describe('NextLinkButton', () => {
  describe('happy path', () => {
    it('renders a next/link by default', () => {
      render(<NextLinkButton href="/movie/278">Details</NextLinkButton>)
      const link = screen.getByRole('link', { name: 'Details' })
      expect(link).toHaveAttribute('data-next-link')
      expect(link).toHaveAttribute('href', '/movie/278')
    })

    it('renders a plain anchor for as="zone-link"', () => {
      render(
        <NextLinkButton as="zone-link" href="/actor/42">
          View Actor
        </NextLinkButton>
      )
      const link = screen.getByRole('link', { name: /view actor/i })
      expect(link.tagName).toBe('A')
      expect(link).not.toHaveAttribute('data-next-link')
    })
  })

  describe('variants', () => {
    it('applies the same skin classes for link and zone-link', () => {
      const { rerender } = render(
        <NextLinkButton as="link" href="/x" variant="outline" size="md">
          Link
        </NextLinkButton>
      )
      const linkClasses = screen.getByRole('link').className

      rerender(
        <NextLinkButton as="zone-link" href="/x" variant="outline" size="md">
          Link
        </NextLinkButton>
      )
      expect(screen.getByRole('link').className).toBe(linkClasses)
      expect(linkClasses).toContain('ui-button--outline')
    })
  })

  // L3: N/A — a link has no disabled/error state. L4: N/A — pure presentational, no async.

  describe('edge cases', () => {
    it('renders the optional icon', () => {
      render(
        <NextLinkButton href="/x" icon="XMark">
          With icon
        </NextLinkButton>
      )
      expect(screen.getByTestId('icon')).toHaveAttribute('data-name', 'XMark')
    })
  })
})
