import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Typography from './Typography'

import type { TypographyVariant } from './Typography'

describe('Typography', () => {
  it('should render with default tag for each variant', () => {
    const variants: TypographyVariant[] = [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'body',
      'body-sm',
      'body-lg',
      'lead',
      'caption',
      'label',
      'muted',
      'blockquote',
    ]

    variants.forEach((variant) => {
      const { container } = render(
        <Typography variant={variant}>Test content</Typography>
      )
      expect(container.firstChild).toBeInTheDocument()
      expect(container.textContent).toBe('Test content')
    })
  })

  it('should render h1 with correct tag and classes', () => {
    const { container } = render(
      <Typography variant="h1">Heading 1</Typography>
    )
    const element = container.querySelector('h1')
    expect(element).toBeInTheDocument()
    expect(element).toHaveClass('ui:text-xl')
    expect(element).toHaveClass('ui:lg:text-4xl')
    expect(element).toHaveClass('ui:font-bold')
    expect(element).toHaveClass('ui:leading-tight')
  })

  it('should render body with p tag', () => {
    const { container } = render(
      <Typography variant="body">Body text</Typography>
    )
    const element = container.querySelector('p')
    expect(element).toBeInTheDocument()
    expect(element).toHaveClass('ui:text-xs')
    expect(element).toHaveClass('ui:md:text-base')
    expect(element).toHaveClass('ui:leading-relaxed')
  })

  it('should override tag with as prop', () => {
    const { container } = render(
      <Typography variant="h1" as="p">
        Looks like h1 but is p
      </Typography>
    )
    const element = container.querySelector('p')
    expect(element).toBeInTheDocument()
    expect(element).toHaveClass('ui:text-xl')
    expect(element).toHaveClass('ui:lg:text-4xl')
    expect(element).toHaveClass('ui:font-bold')
  })

  it('should apply additional className', () => {
    render(
      <Typography variant="body" className="custom-class">
        Custom styled
      </Typography>
    )
    const element = screen.getByText('Custom styled')
    expect(element).toHaveClass('ui:text-xs')
    expect(element).toHaveClass('ui:md:text-base')
    expect(element).toHaveClass('custom-class')
  })

  it('should pass through HTML attributes', () => {
    render(
      <Typography variant="body" data-testid="test-typography" id="test-id">
        Test
      </Typography>
    )
    const element = screen.getByTestId('test-typography')
    expect(element).toHaveAttribute('id', 'test-id')
  })

  it('should render caption with span tag', () => {
    const { container } = render(
      <Typography variant="caption">Caption text</Typography>
    )
    const element = container.querySelector('span')
    expect(element).toBeInTheDocument()
    expect(element).toHaveClass('ui:text-xs')
    expect(element).toHaveClass('ui:sm:text-sm')
    expect(element).toHaveClass('ui:text-muted-foreground')
  })

  it('should render label with label tag', () => {
    const { container } = render(
      <Typography variant="label">Label text</Typography>
    )
    const element = container.querySelector('label')
    expect(element).toBeInTheDocument()
    expect(element).toHaveClass('ui:text-xs')
    expect(element).toHaveClass('ui:sm:text-sm')
    expect(element).toHaveClass('ui:font-medium')
  })

  it('should render blockquote with correct styles', () => {
    const { container } = render(
      <Typography variant="blockquote">Quote text</Typography>
    )
    const element = container.querySelector('blockquote')
    expect(element).toBeInTheDocument()
    expect(element).toHaveClass('ui:border-l-4')
    expect(element).toHaveClass('ui:pl-4')
    expect(element).toHaveClass('ui:italic')
  })

  it('should render all heading variants with correct tags', () => {
    const headings: { variant: TypographyVariant; tag: string }[] = [
      { variant: 'h1', tag: 'h1' },
      { variant: 'h2', tag: 'h2' },
      { variant: 'h3', tag: 'h3' },
      { variant: 'h4', tag: 'h4' },
      { variant: 'h5', tag: 'h5' },
      { variant: 'h6', tag: 'h6' },
    ]

    headings.forEach(({ variant, tag }) => {
      const { container } = render(
        <Typography variant={variant}>Heading</Typography>
      )
      const element = container.querySelector(tag)
      expect(element).toBeInTheDocument()
    })
  })
})
