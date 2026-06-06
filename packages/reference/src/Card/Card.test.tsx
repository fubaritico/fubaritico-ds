import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Card from './Card'

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies default variant by default', () => {
    render(<Card data-testid="card">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('ui:bg-card')
    expect(card.className).toContain('ui:shadow-md')
  })

  it('applies outline variant', () => {
    render(
      <Card variant="outline" data-testid="card">
        Content
      </Card>
    )
    const card = screen.getByTestId('card')
    expect(card.className).toContain('ui:border')
    expect(card.className).toContain('ui:bg-transparent')
  })

  it('passes additional className', () => {
    render(
      <Card className="custom-class" data-testid="card">
        Content
      </Card>
    )
    const card = screen.getByTestId('card')
    expect(card.className).toContain('custom-class')
  })

  it('passes additional props', () => {
    render(<Card data-testid="custom-card">Test</Card>)
    expect(screen.getByTestId('custom-card')).toBeInTheDocument()
  })
})
