import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithRouter } from '@fubaritico-ds/shared/test-utils'

import { LinkButton } from './LinkButton'

describe('LinkButton', () => {
  describe('happy path', () => {
    it('renders a link with the correct href', () => {
      renderWithRouter(<LinkButton to="/movie/278">Details</LinkButton>)
      expect(screen.getByRole('link', { name: 'Details' })).toHaveAttribute(
        'href',
        '/movie/278'
      )
    })

    it('applies the base skin class', () => {
      renderWithRouter(<LinkButton to="/x">Go</LinkButton>)
      expect(screen.getByRole('link').className).toContain('ui-button')
    })
  })

  describe('variants', () => {
    it('applies variant and size modifiers', () => {
      renderWithRouter(
        <LinkButton to="/x" variant="outline" size="lg">
          Outline
        </LinkButton>
      )
      const cls = screen.getByRole('link').className
      expect(cls).toContain('ui-button--outline')
      expect(cls).toContain('ui-button--lg')
    })
  })

  // L3/L4: N/A — a link has no disabled/error state; routing is owned by react-router.

  describe('edge cases', () => {
    it('merges a consumer className with the resolved skin classes', () => {
      renderWithRouter(
        <LinkButton to="/x" className="my-class">
          Go
        </LinkButton>
      )
      expect(screen.getByRole('link').className).toContain('my-class')
    })
  })
})
