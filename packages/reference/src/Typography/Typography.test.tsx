import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Typography } from './Typography'

describe('Typography', () => {
  describe('happy path', () => {
    it('renders body in a <p> by default with the base + body classes', () => {
      const { container } = render(<Typography>Body text</Typography>)
      const el = container.querySelector('p')
      expect(el).toBeInTheDocument()
      expect(el).toHaveClass('ui-typography')
      expect(el).toHaveClass('ui-typography--body')
      expect(el).toHaveTextContent('Body text')
    })
  })

  describe('variants', () => {
    it.each([
      ['h1', 'h1'],
      ['h2', 'h2'],
      ['h3', 'h3'],
      ['h4', 'h4'],
      ['h5', 'h5'],
      ['h6', 'h6'],
      ['caption', 'span'],
      ['overline', 'span'],
      ['label', 'span'],
    ] as const)(
      'maps variant "%s" to the <%s> element with its modifier',
      (variant, tag) => {
        const { container } = render(
          <Typography variant={variant}>Text</Typography>
        )
        const el = container.querySelector(tag)
        expect(el).toBeInTheDocument()
        expect(el).toHaveClass(`ui-typography--${variant}`)
      }
    )

    it('renders a real <label> (with its for attribute) when as="label"', () => {
      const { container } = render(
        <Typography as="label" htmlFor="email" variant="label">
          Email
        </Typography>
      )
      const el = container.querySelector('label')
      expect(el).toBeInTheDocument()
      expect(el).toHaveAttribute('for', 'email')
      expect(el).toHaveClass('ui-typography--label')
    })

    it('renders the inherit variant as <p> with no variant modifier', () => {
      const { container } = render(
        <Typography variant="inherit">Inherited</Typography>
      )
      const el = container.querySelector('p')
      expect(el).toHaveClass('ui-typography')
      expect(el?.className).not.toContain('ui-typography--')
    })

    it('applies capability modifiers (gutterBottom, noWrap, align)', () => {
      render(
        <Typography gutterBottom noWrap align="center">
          Caps
        </Typography>
      )
      const cls = screen.getByText('Caps').className
      expect(cls).toContain('ui-typography--gutter-bottom')
      expect(cls).toContain('ui-typography--no-wrap')
      expect(cls).toContain('ui-typography--align-center')
    })
  })

  // L3 managed errors: N/A — presentational primitive, no error path.

  describe('unmanaged errors', () => {
    it('forwards arbitrary HTML attributes to the element', () => {
      render(
        <Typography data-testid="t" id="title">
          Test
        </Typography>
      )
      expect(screen.getByTestId('t')).toHaveAttribute('id', 'title')
    })
  })

  describe('edge cases', () => {
    it('overrides the element with `as` while keeping the variant styles', () => {
      const { container } = render(
        <Typography variant="h1" as="div">
          Looks like h1
        </Typography>
      )
      const el = container.querySelector('div')
      expect(el).toBeInTheDocument()
      expect(el).toHaveClass('ui-typography--h1')
    })

    it('honours a per-instance variantMapping override', () => {
      const { container } = render(
        <Typography variant="body" variantMapping={{ body: 'span' }}>
          Body as span
        </Typography>
      )
      expect(container.querySelector('span')).toBeInTheDocument()
      expect(container.querySelector('p')).not.toBeInTheDocument()
    })

    it('merges a consumer className with the resolved skin classes', () => {
      render(<Typography className="my-class">Merged</Typography>)
      const cls = screen.getByText('Merged').className
      expect(cls).toContain('ui-typography--body')
      expect(cls).toContain('my-class')
    })
  })
})
