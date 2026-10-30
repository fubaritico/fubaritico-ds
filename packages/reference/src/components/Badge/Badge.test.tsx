import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

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

    it('measures a string label (revealed in a tooltip once cut) when canTruncate is set', () => {
      const { container } = render(<Badge canTruncate>Running</Badge>)
      expect(container.querySelector('.ui-badge__label')).toHaveClass(
        'ui-truncated-text'
      )
    })

    it('measures a number label too when canTruncate is set', () => {
      const { container } = render(<Badge canTruncate>{1234567}</Badge>)
      const label = container.querySelector('.ui-badge__label')
      expect(label).toHaveClass('ui-truncated-text')
      expect(label).toHaveTextContent('1234567')
    })

    it('clips rich children visually only (no tooltip) when canTruncate is set', () => {
      const { container } = render(
        <Badge canTruncate>
          <strong>Running</strong>
        </Badge>
      )
      const label = container.querySelector('.ui-badge__label')
      expect(label).toBeInTheDocument()
      expect(label).not.toHaveClass('ui-truncated-text')
    })

    it('renders the label bare (no wrapper, no modifier) by default', () => {
      const { container } = render(<Badge>Plain</Badge>)
      expect(container.firstChild).not.toHaveClass('ui-badge--truncate')
      expect(container.querySelector('.ui-badge__label')).toBeNull()
      expect(screen.getByText('Plain')).toBeInTheDocument()
    })

    it('renders the secondary-dark variant modifier', () => {
      const { container } = render(<Badge variant="secondary-dark">Dark</Badge>)
      expect(container.firstChild).toHaveClass('ui-badge--secondary-dark')
    })

    it('renders a named remove button that calls onRemove when pressed', async () => {
      const onRemove = vi.fn()
      render(
        <Badge onRemove={onRemove} removeLabel="Remove Port">
          Port
        </Badge>
      )
      const button = screen.getByRole('button', { name: 'Remove Port' })
      expect(button).toHaveClass('ui-badge__remove')
      expect(button).toHaveAttribute('type', 'button')
      await userEvent.click(button)
      expect(onRemove).toHaveBeenCalledTimes(1)
    })

    it('removes by keyboard: Enter on the focused button', async () => {
      const onRemove = vi.fn()
      render(
        <Badge onRemove={onRemove} removeLabel="Remove Port">
          Port
        </Badge>
      )
      await userEvent.tab()
      await userEvent.keyboard('{Enter}')
      expect(onRemove).toHaveBeenCalledTimes(1)
    })

    it('renders no button without onRemove', () => {
      render(<Badge>Port</Badge>)
      expect(screen.queryByRole('button')).toBeNull()
    })
  })

  describe('managed errors', () => {
    it('throws when onRemove comes without a removeLabel', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined)
      const props = { onRemove: vi.fn() } as unknown as Parameters<typeof Badge>[0]
      expect(() => render(<Badge {...props}>Port</Badge>)).toThrow(
        'Badge: `onRemove` needs a `removeLabel` (the button name)'
      )
    })

    it('does not call onRemove through a disabled button', async () => {
      const onRemove = vi.fn()
      render(
        <Badge
          onRemove={onRemove}
          removeLabel="Remove Port"
          removeButtonProps={{ disabled: true }}
        >
          Port
        </Badge>
      )
      await userEvent.click(screen.getByRole('button', { name: 'Remove Port' }))
      expect(onRemove).not.toHaveBeenCalled()
    })
  })

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
