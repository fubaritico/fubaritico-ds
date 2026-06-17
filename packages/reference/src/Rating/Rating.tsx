import clsx from 'clsx'

import { ratingVariants } from '@fubaritico-ds/variants'

import CircleRating from './CircleRating'
import StarsRating from './StarsRating'

import type { RatingSize, RatingVariant } from '@fubaritico-ds/variants'
import type { ComponentProps } from 'react'

export type { RatingSize, RatingVariant } from '@fubaritico-ds/variants'

export interface RatingProps extends Omit<ComponentProps<'div'>, 'role'> {
  /** Rating value (0–10 by default, or 0–100 when `max` is 100). Clamped to `[0, max]`. */
  value: number
  /** Maximum value (default: 10 — a TMDB-style score). */
  max?: number
  /** Visual look — a progress ring (`circle`) or a row of stars (`stars`). */
  variant?: RatingVariant
  /** Size of the rating. */
  size?: RatingSize
  /** Show the numeric value (centred in the ring, or trailing the stars). */
  showValue?: boolean
}

/**
 * Rating — a display-only, grayscale score readout (no interaction, no state).
 *
 * Renders `role="img"` with a computed accessible name (e.g. "Rating: 7.5 out of 10") so the score is
 * announced even when `showValue` is false; pass `aria-label` to localise/override it. The visual
 * (ring or stars) is decorative (`aria-hidden`). The score is conveyed by the fill proportion AND the
 * numeric value — never by colour alone.
 *
 * @param props - Rating options.
 * @param props.value - The score; clamped to `[0, max]`.
 * @param props.max - Maximum value; defaults to `10`.
 * @param props.variant - Visual look; defaults to `'circle'`.
 * @param props.size - Size; defaults to `'md'`.
 * @param props.showValue - Whether to render the numeric value; defaults to `true`.
 * @returns The rendered rating.
 */
export function Rating({
  value,
  max = 10,
  variant = 'circle',
  size = 'md',
  showValue = true,
  className,
  'aria-label': ariaLabel,
  ...rest
}: Readonly<RatingProps>) {
  const clampedValue = Math.max(0, Math.min(value, max))
  const percent = max > 0 ? (clampedValue / max) * 100 : 0
  // Match the visible number's precision so the announced name and the on-screen value agree (WCAG
  // 1.3.1): a `/10`-style score reads with one decimal, a percentage scale reads as a whole number.
  const displayValue = max === 100 ? clampedValue : clampedValue.toFixed(1)
  const label = ariaLabel ?? `Rating: ${displayValue} out of ${max}`

  return (
    <div
      className={clsx(ratingVariants({ variant, size }), className)}
      role="img"
      aria-label={label}
      {...rest}
    >
      {variant === 'circle' ? (
        <CircleRating
          percent={percent}
          size={size}
          showValue={showValue}
          value={clampedValue}
          max={max}
        />
      ) : (
        <StarsRating
          percent={percent}
          size={size}
          showValue={showValue}
          value={clampedValue}
          max={max}
        />
      )}
    </div>
  )
}

export default Rating
