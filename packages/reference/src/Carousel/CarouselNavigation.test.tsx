import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import CarouselNavigation from './CarouselNavigation'

describe('CarouselNavigation', () => {
  describe('inline variant (default)', () => {
    it('renders Previous and Next buttons', () => {
      render(
        <CarouselNavigation
          onPrev={vi.fn()}
          onNext={vi.fn()}
          canPrev={true}
          canNext={true}
        />
      )
      expect(screen.getAllByRole('button')).toHaveLength(2)
    })

    it('applies custom className', () => {
      const { container } = render(
        <CarouselNavigation
          onPrev={vi.fn()}
          onNext={vi.fn()}
          canPrev={true}
          canNext={true}
          className="ui:custom"
        />
      )
      expect(container.firstChild).toHaveClass('ui:custom')
    })
  })

  describe('sides variant', () => {
    it('renders absolute positioned buttons', () => {
      const { container } = render(
        <CarouselNavigation
          position="sides"
          onPrev={vi.fn()}
          onNext={vi.fn()}
          canPrev={true}
          canNext={true}
        />
      )
      const absoluteWrappers = container.querySelectorAll('[class*="absolute"]')
      expect(absoluteWrappers.length).toBeGreaterThan(0)
    })
  })

  describe('sides-inset variant', () => {
    it('renders absolutely positioned buttons with inset', () => {
      const { container } = render(
        <CarouselNavigation
          position="sides-inset"
          onPrev={vi.fn()}
          onNext={vi.fn()}
          canPrev={true}
          canNext={true}
        />
      )
      const absoluteWrappers = container.querySelectorAll('[class*="absolute"]')
      expect(absoluteWrappers.length).toBeGreaterThan(0)
    })
  })

  describe('callbacks', () => {
    it('calls onPrev when Previous button clicked', async () => {
      const onPrev = vi.fn()
      render(
        <CarouselNavigation
          onPrev={onPrev}
          onNext={vi.fn()}
          canPrev={true}
          canNext={true}
        />
      )
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[0])
      expect(onPrev).toHaveBeenCalled()
    })

    it('calls onNext when Next button clicked', async () => {
      const onNext = vi.fn()
      render(
        <CarouselNavigation
          onPrev={vi.fn()}
          onNext={onNext}
          canPrev={true}
          canNext={true}
        />
      )
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[1])
      expect(onNext).toHaveBeenCalled()
    })
  })

  describe('disabled state', () => {
    it('disables Previous button when canPrev=false', async () => {
      const onPrev = vi.fn()
      render(
        <CarouselNavigation
          canPrev={false}
          onPrev={onPrev}
          onNext={vi.fn()}
          canNext={true}
        />
      )
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[0])
      expect(onPrev).not.toHaveBeenCalled()
    })

    it('disables Next button when canNext=false', async () => {
      const onNext = vi.fn()
      render(
        <CarouselNavigation
          canNext={false}
          onPrev={vi.fn()}
          onNext={onNext}
          canPrev={true}
        />
      )
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[1])
      expect(onNext).not.toHaveBeenCalled()
    })
  })
})
