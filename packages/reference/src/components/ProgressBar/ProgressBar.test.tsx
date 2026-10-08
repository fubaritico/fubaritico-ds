import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ProgressBar } from './ProgressBar'

/** Reads the fill percentage the component handed to the skin. */
const fillOf = (container: HTMLElement) =>
  container
    .querySelector<HTMLElement>('.ui-progress-bar__indicator')
    ?.style.getPropertyValue('--ui-progress-bar-value')

describe('ProgressBar', () => {
  describe('happy path', () => {
    it('renders a named progressbar carrying its value', () => {
      render(<ProgressBar value={62} aria-label="Upload" />)

      const bar = screen.getByRole('progressbar', { name: 'Upload' })
      expect(bar).toHaveAttribute('aria-valuenow', '62')
      expect(bar).toHaveAttribute('aria-valuemin', '0')
      expect(bar).toHaveAttribute('aria-valuemax', '100')
    })

    it('passes the fill fraction to the skin as a percentage', () => {
      const { container } = render(
        <ProgressBar value={62} aria-label="Upload" />
      )
      expect(fillOf(container)).toBe('62%')
    })

    it('lets aria-labelledby win over aria-label, per ARIA precedence', () => {
      render(
        <>
          <span id="pb-label">Sync</span>
          <ProgressBar
            value={10}
            aria-label="fallback name"
            aria-labelledby="pb-label"
          />
        </>
      )

      expect(
        screen.getByRole('progressbar', { name: 'Sync' })
      ).toBeInTheDocument()
    })
  })

  describe('variants', () => {
    it.each([
      ['default', null],
      ['success', 'ui-progress-bar--success'],
      ['destructive', 'ui-progress-bar--destructive'],
    ] as const)('applies the %s variant', (variant, modifier) => {
      const { container } = render(
        <ProgressBar value={50} variant={variant} aria-label="P" />
      )
      const root = container.querySelector('.ui-progress-bar')

      if (modifier) expect(root).toHaveClass(modifier)
      else expect(root?.className).toBe('ui-progress-bar')
    })

    it.each([
      ['sm', 'ui-progress-bar--sm'],
      ['lg', 'ui-progress-bar--lg'],
    ] as const)('applies the %s size', (size, modifier) => {
      const { container } = render(
        <ProgressBar value={50} size={size} aria-label="P" />
      )
      expect(container.querySelector('.ui-progress-bar')).toHaveClass(modifier)
    })

    it('scales the fill against a custom max', () => {
      const { container } = render(
        <ProgressBar value={3} max={4} aria-label="Steps" />
      )

      expect(fillOf(container)).toBe('75%')
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuemax',
        '4'
      )
    })

    it('renders both legend slots when provided', () => {
      render(
        <ProgressBar
          value={62}
          aria-label="Upload"
          metaStart="62%"
          metaEnd="3 days left"
        />
      )

      expect(screen.getByText('62%')).toBeInTheDocument()
      expect(screen.getByText('3 days left')).toBeInTheDocument()
    })

    it('omits the legend row entirely when neither slot is given', () => {
      const { container } = render(
        <ProgressBar value={62} aria-label="Upload" />
      )
      expect(container.querySelector('.ui-progress-bar__meta')).toBeNull()
    })

    it('exposes a human-readable value through aria-valuetext', () => {
      render(
        <ProgressBar
          value={3}
          max={7}
          valueText="step 3 of 7"
          aria-label="Wizard"
        />
      )

      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuetext',
        'step 3 of 7'
      )
    })
  })

  describe('managed errors', () => {
    it('clamps a value above max', () => {
      const { container } = render(<ProgressBar value={150} aria-label="P" />)

      expect(fillOf(container)).toBe('100%')
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        '100'
      )
    })

    it('clamps a negative value to zero', () => {
      const { container } = render(<ProgressBar value={-20} aria-label="P" />)

      expect(fillOf(container)).toBe('0%')
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        '0'
      )
    })

    it('renders an empty bar instead of NaN when max is zero', () => {
      const { container } = render(
        <ProgressBar value={5} max={0} aria-label="P" />
      )

      expect(fillOf(container)).toBe('0%')
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        '0'
      )
    })

    it('renders an empty bar for a negative max', () => {
      const { container } = render(
        <ProgressBar value={5} max={-10} aria-label="P" />
      )
      expect(fillOf(container)).toBe('0%')
    })

    it('never publishes aria-valuemax below aria-valuemin', () => {
      render(<ProgressBar value={5} max={-5} aria-label="P" />)
      const bar = screen.getByRole('progressbar')

      // ARIA invariant: valuemin <= valuenow <= valuemax.
      expect(bar).toHaveAttribute('aria-valuemin', '0')
      expect(bar).toHaveAttribute('aria-valuenow', '0')
      expect(bar).toHaveAttribute('aria-valuemax', '0')
    })
  })

  describe('unmanaged errors', () => {
    it('does not emit NaN when value is NaN', () => {
      const { container } = render(<ProgressBar value={NaN} aria-label="P" />)
      expect(fillOf(container)).not.toContain('NaN')
    })

    it('clamps Infinity to max rather than overflowing the track', () => {
      const { container } = render(
        <ProgressBar value={Infinity} aria-label="P" />
      )
      expect(fillOf(container)).toBe('100%')
    })
  })

  describe('edge cases', () => {
    it('renders a zero-value bar', () => {
      const { container } = render(<ProgressBar value={0} aria-label="P" />)
      expect(fillOf(container)).toBe('0%')
    })

    it('renders a complete bar', () => {
      const { container } = render(<ProgressBar value={100} aria-label="P" />)
      expect(fillOf(container)).toBe('100%')
    })

    it('keeps a fractional percentage rather than rounding it away', () => {
      const { container } = render(
        <ProgressBar value={1} max={3} aria-label="P" />
      )
      expect(fillOf(container)).toContain('33.33')
    })

    it('renders the legend row when only one slot is given', () => {
      const { container } = render(
        <ProgressBar value={10} aria-label="P" metaEnd="soon" />
      )

      expect(container.querySelector('.ui-progress-bar__meta')).not.toBeNull()
      expect(screen.getByText('soon')).toBeInTheDocument()
    })

    it('merges a consumer className onto the root without dropping the base', () => {
      const { container } = render(
        <ProgressBar value={10} aria-label="P" className="custom" />
      )
      const root = container.querySelector('.ui-progress-bar')

      expect(root).toHaveClass('ui-progress-bar')
      expect(root).toHaveClass('custom')
    })

    it('forwards rest props to the root element', () => {
      const { container } = render(
        <ProgressBar value={10} aria-label="P" data-testid="pb" id="upload" />
      )

      expect(container.querySelector('#upload')).toBe(screen.getByTestId('pb'))
    })

    it('accepts rich nodes in the legend slots', () => {
      render(
        <ProgressBar
          value={10}
          aria-label="P"
          metaStart={<strong>10%</strong>}
          metaEnd={<em>almost</em>}
        />
      )

      expect(screen.getByText('10%').tagName).toBe('STRONG')
      expect(screen.getByText('almost').tagName).toBe('EM')
    })
  })
})
