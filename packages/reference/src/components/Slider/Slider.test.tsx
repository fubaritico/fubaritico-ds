import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Slider } from './Slider'

/** Reads the thumb position the component handed to the skin. */
const progressOf = (container: HTMLElement) =>
  container
    .querySelector<HTMLElement>('.ui-slider')
    ?.style.getPropertyValue('--ui-slider-progress')

describe('Slider', () => {
  describe('happy path', () => {
    it('renders a named slider carrying its value', () => {
      render(<Slider defaultValue={40} aria-label="Volume" />)

      const slider = screen.getByRole('slider', { name: 'Volume' })
      expect(slider).toHaveValue('40')
    })

    it('hands the thumb position to the skin as a percentage', () => {
      const { container } = render(<Slider defaultValue={40} aria-label="V" />)

      expect(progressOf(container)).toBe('40%')
    })

    it('renders the track, the range and the thumb', () => {
      const { container } = render(<Slider defaultValue={40} aria-label="V" />)

      expect(container.querySelector('.ui-slider__track')).toBeInTheDocument()
      expect(container.querySelector('.ui-slider__range')).toBeInTheDocument()
      expect(container.querySelector('.ui-slider__thumb')).toBeInTheDocument()
    })
  })

  describe('variants', () => {
    it.each([
      ['sm', 'ui-slider--sm'],
      ['lg', 'ui-slider--lg'],
    ] as const)('applies the %s size', (size, modifier) => {
      const { container } = render(
        <Slider defaultValue={10} size={size} aria-label="V" />
      )

      expect(container.querySelector('.ui-slider')).toHaveClass(modifier)
    })

    it('emits no size modifier for the default md', () => {
      const { container } = render(<Slider defaultValue={10} aria-label="V" />)

      expect(container.querySelector('.ui-slider')?.className).toBe('ui-slider')
    })

    it('maps a custom range onto the percentage', () => {
      const { container } = render(
        <Slider value={5} min={0} max={20} aria-label="V" />
      )

      expect(progressOf(container)).toBe('25%')
      expect(screen.getByRole('slider')).toHaveAttribute('max', '20')
    })

    it('carries a track image and steps the filled range aside', () => {
      const image = 'linear-gradient(to right, red, blue)'
      const { container } = render(
        <Slider defaultValue={50} trackImage={image} aria-label="Hue" />
      )
      const root = container.querySelector<HTMLElement>('.ui-slider')

      expect(root).toHaveClass('ui-slider--imaged')
      expect(root?.style.getPropertyValue('--ui-slider-track-image')).toBe(
        image
      )
    })

    it('announces a formatted value rather than the bare number', () => {
      render(
        <Slider
          value={210}
          min={0}
          max={360}
          formatValue={(v) => `hue ${String(v)} degrees, blue`}
          aria-label="Hue"
        />
      )

      expect(screen.getByRole('slider')).toHaveAttribute(
        'aria-valuetext',
        'hue 210 degrees, blue'
      )
    })

    it('marks the control disabled', () => {
      const { container } = render(
        <Slider defaultValue={10} disabled aria-label="V" />
      )

      expect(container.querySelector('.ui-slider')).toHaveClass(
        'ui-slider--disabled'
      )
      expect(screen.getByRole('slider')).toBeDisabled()
    })
  })

  // The arrow / Home / End model belongs to the native range input, i.e. to the browser — jsdom
  // implements none of it, so `userEvent` cannot drive this control and the keyboard itself is
  // verified in Storybook rather than here. What IS ours, and tested below, is the wiring: the
  // value-to-percentage mapping, and which callback fires on which DOM event.
  describe('managed errors', () => {
    it('reports every intermediate value through onChange', () => {
      const onChange = vi.fn()
      render(<Slider defaultValue={50} onChange={onChange} aria-label="V" />)

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '51' } })
      fireEvent.change(slider, { target: { value: '52' } })

      expect(onChange).toHaveBeenCalledTimes(2)
      expect(onChange).toHaveBeenLastCalledWith(52)
    })

    it('moves the thumb as the value changes', () => {
      const { container } = render(<Slider defaultValue={50} aria-label="V" />)

      fireEvent.change(screen.getByRole('slider'), { target: { value: '75' } })

      expect(progressOf(container)).toBe('75%')
    })

    it('reports the settled value only when the interaction ends', () => {
      const onChange = vi.fn()
      const onChangeComplete = vi.fn()
      render(
        <Slider
          defaultValue={50}
          onChange={onChange}
          onChangeComplete={onChangeComplete}
          aria-label="V"
        />
      )

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '60' } })
      expect(onChangeComplete).not.toHaveBeenCalled()

      fireEvent.mouseUp(slider)
      expect(onChangeComplete).toHaveBeenCalledWith(60)
    })

    it('commits on key release too, not only on pointer release', () => {
      const onChangeComplete = vi.fn()
      render(
        <Slider
          defaultValue={50}
          onChangeComplete={onChangeComplete}
          aria-label="V"
        />
      )

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '55' } })
      fireEvent.keyUp(slider, { key: 'ArrowRight' })

      expect(onChangeComplete).toHaveBeenCalledWith(55)
    })

    it('disables the underlying control, so the platform ignores every input', () => {
      render(<Slider defaultValue={50} disabled aria-label="V" />)

      expect(screen.getByRole('slider')).toBeDisabled()
    })
  })

  describe('unmanaged errors', () => {
    it('renders an empty track instead of NaN when min equals max', () => {
      const { container } = render(
        <Slider value={5} min={5} max={5} aria-label="V" />
      )

      expect(progressOf(container)).toBe('0%')
    })

    it('clamps a value above max', () => {
      const { container } = render(
        <Slider value={150} max={100} aria-label="V" />
      )

      expect(progressOf(container)).toBe('100%')
    })

    it('clamps a value below min', () => {
      const { container } = render(
        <Slider value={-20} min={0} aria-label="V" />
      )

      expect(progressOf(container)).toBe('0%')
    })
  })

  describe('edge cases', () => {
    it('starts at min when no value is given', () => {
      render(<Slider min={10} max={20} aria-label="V" />)

      expect(screen.getByRole('slider')).toHaveValue('10')
    })

    it('lets the controlled value win over the internal copy', async () => {
      const user = userEvent.setup()
      render(<Slider value={30} onChange={vi.fn()} aria-label="V" />)

      const slider = screen.getByRole('slider')
      await user.click(slider)
      await user.keyboard('{ArrowRight}')

      // The parent never fed a new value back, so the slider must not drift on its own.
      expect(slider).toHaveValue('30')
    })

    it('merges a consumer className without dropping the block class', () => {
      const { container } = render(
        <Slider defaultValue={10} className="custom" aria-label="V" />
      )
      const root = container.querySelector('.ui-slider')

      expect(root).toHaveClass('ui-slider')
      expect(root).toHaveClass('custom')
    })

    it('keeps a consumer style alongside the position property', () => {
      const { container } = render(
        <Slider
          defaultValue={25}
          style={{ '--ui-slider-range-color': 'rebeccapurple' } as never}
          aria-label="V"
        />
      )
      const root = container.querySelector<HTMLElement>('.ui-slider')

      expect(root?.style.getPropertyValue('--ui-slider-range-color')).toBe(
        'rebeccapurple'
      )
      expect(root?.style.getPropertyValue('--ui-slider-progress')).toBe('25%')
    })

    it('forwards rest props to the native input', () => {
      render(
        <Slider defaultValue={10} aria-label="V" data-testid="s" id="volume" />
      )

      expect(screen.getByTestId('s')).toHaveAttribute('id', 'volume')
    })
  })
})
