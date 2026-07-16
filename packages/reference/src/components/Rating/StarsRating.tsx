import {
  RATING_STARS_CLASS,
  RATING_STARS_FILL_CLASS,
  RATING_STARS_TRACK_CLASS,
  RATING_VALUE_CLASS,
} from '@fubaritico-ds/variants'

import { Icon } from '../Icon'

import type { IconSize } from '../Icon'
import type { RatingSize } from '@fubaritico-ds/variants'
import type { CSSProperties } from 'react'

/**
 * Per-size star icon dimension (pixels). Like the ring geometry, the icon px is an inline per-instance
 * value (the skin owns only the fill/empty colours), mirroring the IconButton `iconSizeMap` precedent.
 */
const starsSizeMap: Record<RatingSize, IconSize> = {
  sm: 16,
  md: 20,
  lg: 24,
}

/** The five star slots — a stable key list for both the empty and filled rows. */
const STAR_SLOTS = [1, 2, 3, 4, 5] as const

export interface StarsRatingProps {
  /** Percentage (0–100) driving the clipped fill of the filled row. */
  percent: number
  /** Size of the stars. */
  size: RatingSize
  /** Whether to render the trailing numeric value. */
  showValue: boolean
  /** The (clamped) rating value, used for display. */
  value: number
  /** Maximum rating value, used for display formatting. */
  max: number
}

/**
 * Stars look of {@link Rating} — a baseline row of empty stars overlaid by a clipped row of filled
 * stars, with a trailing value.
 *
 * The fill/empty colours come from the native skin (`.ui-rating__stars-*`); only the clip fraction is
 * inline. Both star rows are decorative (the `Icon` is `aria-hidden` by default) — the accessible name
 * lives on the `Rating` root.
 *
 * @param props - Stars rating options.
 * @param props.percent - Fill percentage (0–100).
 * @param props.size - Star size.
 * @param props.showValue - Whether to render the trailing value.
 * @param props.value - Clamped rating value.
 * @param props.max - Maximum rating value.
 * @returns The rendered stars.
 */
export function StarsRating({
  percent,
  size,
  showValue,
  value,
  max,
}: Readonly<StarsRatingProps>) {
  const iconSize = starsSizeMap[size]
  // The skin owns the clip DIRECTION (LTR vs RTL); the component passes only the fill fraction.
  const fillStyle = { '--ui-rating-fill': `${percent}%` } as CSSProperties

  return (
    <div className={RATING_STARS_CLASS}>
      <div className={RATING_STARS_TRACK_CLASS}>
        {STAR_SLOTS.map((slot) => (
          <Icon key={slot} name="Star" size={iconSize} />
        ))}
      </div>
      <div className={RATING_STARS_FILL_CLASS} style={fillStyle}>
        {STAR_SLOTS.map((slot) => (
          <Icon key={slot} name="Star" size={iconSize} />
        ))}
      </div>
      {showValue ? (
        <span className={RATING_VALUE_CLASS}>
          {max === 100 ? (value / 10).toFixed(1) : value.toFixed(1)}
        </span>
      ) : null}
    </div>
  )
}

export default StarsRating
