import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Talent from './Talent'

describe('Talent', () => {
  describe('name and role fallbacks', () => {
    it('renders name and role when both provided', () => {
      render(<Talent name="Tom Hanks" role="Actor" />)
      expect(screen.getByText('Tom Hanks')).toBeInTheDocument()
      expect(screen.getByText('Actor')).toBeInTheDocument()
    })

    it('renders "Unknown" when name is undefined', () => {
      render(<Talent role="Actor" />)
      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })

    it('renders "N/A" when role is undefined', () => {
      render(<Talent name="Tom Hanks" />)
      expect(screen.getByText('N/A')).toBeInTheDocument()
    })

    it('renders both fallbacks when both are undefined', () => {
      render(<Talent />)
      expect(screen.getByText('Unknown')).toBeInTheDocument()
      expect(screen.getByText('N/A')).toBeInTheDocument()
    })
  })

  describe('layout variants', () => {
    it('applies flex-col for vertical variant (default)', () => {
      const { container } = render(<Talent />)
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('ui:flex-col')
    })

    it('applies flex-row for horizontal variant', () => {
      const { container } = render(<Talent variant="horizontal" />)
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('ui:flex-row')
      expect(wrapper).not.toHaveClass('ui:flex-col')
    })
  })

  describe('avatar', () => {
    it('renders avatar with image when imageSrc provided', () => {
      render(<Talent imageSrc="/avatar.jpg" />)
      const img = screen.getByRole('img')
      expect(img).toBeInTheDocument()
    })

    it('renders avatar fallback when no imageSrc', () => {
      const { container } = render(<Talent />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('additional props', () => {
    it('forwards className', () => {
      const { container } = render(<Talent className="ui:custom" />)
      expect(container.firstChild).toHaveClass('ui:custom')
    })

    it('forwards data-testid', () => {
      render(<Talent data-testid="talent-card" />)
      expect(screen.getByTestId('talent-card')).toBeInTheDocument()
    })
  })
})
