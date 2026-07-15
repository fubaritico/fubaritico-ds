import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Badge from './Badge'

describe('Badge', () => {
  describe('happy path', () => {
    it('renders children', () => {
      render(<Badge>Action</Badge>)
      expect(screen.getByText('Action')).toBeInTheDocument()
    })

    it('applies the base BEM block and emits no modifier for the defaults', () => {
      const { container } = render(<Badge>Default</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('ui-badge')
      // default variant + default size (md) => base class only, no modifier
      expect(badge).not.toHaveClass('ui-badge--secondary')
      expect(badge).not.toHaveClass('ui-badge--sm')
      expect(badge).not.toHaveClass('ui-badge--lg')
    })
  })

  describe('variants', () => {
    it('renders the secondary variant modifier', () => {
      const { container } = render(<Badge variant="secondary">Secondary</Badge>)
      expect(container.firstChild).toHaveClass('ui-badge--secondary')
    })

    it('renders the outline variant modifier', () => {
      const { container } = render(<Badge variant="outline">Outline</Badge>)
      expect(container.firstChild).toHaveClass('ui-badge--outline')
    })

    it('renders the destructive variant modifier', () => {
      const { container } = render(<Badge variant="destructive">Error</Badge>)
      expect(container.firstChild).toHaveClass('ui-badge--destructive')
    })

    it('applies each size modifier', () => {
      const { container: sm } = render(<Badge size="sm">Small</Badge>)
      expect(sm.firstChild).toHaveClass('ui-badge--sm')

      // md is the default size => base class only, no `ui-badge--md` modifier emitted
      const { container: md } = render(<Badge size="md">Medium</Badge>)
      expect(md.firstChild).toHaveClass('ui-badge')
      expect(md.firstChild).not.toHaveClass('ui-badge--sm')
      expect(md.firstChild).not.toHaveClass('ui-badge--lg')

      const { container: lg } = render(<Badge size="lg">Large</Badge>)
      expect(lg.firstChild).toHaveClass('ui-badge--lg')
    })

    it('renders a leading icon with the BEM element class', () => {
      const { container } = render(<Badge icon="Star">Featured</Badge>)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('ui-badge__icon')
    })

    it('wraps the label and applies the truncate modifier when canTruncate is set', () => {
      const { container } = render(<Badge canTruncate>Running</Badge>)
      expect(container.firstChild).toHaveClass('ui-badge--truncate')
      const label = container.querySelector('.ui-badge__label')
      expect(label).toBeInTheDocument()
      expect(label).toHaveTextContent('Running')
    })

    it('keeps the icon visible and wraps only the label when canTruncate is set', () => {
      const { container } = render(
        <Badge icon="Check" canTruncate>
          Completed
        </Badge>
      )
      expect(container.querySelector('.ui-badge__icon')).toBeInTheDocument()
      expect(container.querySelector('.ui-badge__label')).toHaveTextContent(
        'Completed'
      )
    })

    it('renders the label bare (no wrapper, no modifier) by default', () => {
      const { container } = render(<Badge>Plain</Badge>)
      expect(container.firstChild).not.toHaveClass('ui-badge--truncate')
      expect(container.querySelector('.ui-badge__label')).toBeNull()
      expect(screen.getByText('Plain')).toBeInTheDocument()
    })
  })

  // L3 (managed errors): N/A — presentational atom with no validation/disabled/error states.
  // L4 (unmanaged errors): N/A — no async/data path; nothing to throw or swallow.

  describe('edge cases', () => {
    it('merges a custom className after the skin classes', () => {
      const { container } = render(
        <Badge className="custom-class">Custom</Badge>
      )
      expect(container.firstChild).toHaveClass('ui-badge')
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('renders no icon when none is provided', () => {
      const { container } = render(<Badge>No icon</Badge>)
      expect(container.querySelector('svg')).toBeNull()
    })
  })
})
