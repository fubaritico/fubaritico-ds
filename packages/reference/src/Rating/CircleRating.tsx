import {
  RATING_CIRCLE_CLASS,
  RATING_INDICATOR_CLASS,
  RATING_SVG_CLASS,
  RATING_TRACK_CLASS,
  RATING_VALUE_CENTERED_CLASS,
  RATING_VALUE_CLASS,
} from '@fubaritico-ds/variants'

import type { RatingSize } from '@fubaritico-ds/variants'

/**
 * Per-size SVG geometry (pixels). Geometry is NOT a skin concern (the skin only owns colour/motion),
 * so the ring's dimensions live here as inline SVG attributes — mirroring the Skeleton precedent.
 */
const circleSizeMap: Record<RatingSize, { size: number; stroke: number }> = {
  sm: { size: 32, stroke: 3 },
  md: { size: 48, stroke: 4 },
  lg: { size: 64, stroke: 5 },
}

export interface CircleRatingProps {
  /** Percentage (0–100) driving the progress arc fill. */
  percent: number
  /** Size of the ring. */
  size: RatingSize
  /** Whether to render the centred numeric value. */
  showValue: boolean
  /** The (clamped) rating value, used for display. */
  value: number
  /** Maximum rating value, used for display formatting. */
  max: number
}

/**
 * Circle look of {@link Rating} — an SVG progress ring with a centred value.
 *
 * The track + indicator colours and the rotation come from the native skin (`.ui-rating__*`); only the
 * computed geometry (radius, circumference, dash offset) is inline. The whole SVG is `aria-hidden` —
 * the accessible name lives on the `Rating` root.
 *
 * @param props - Circle rating options.
 * @param props.percent - Progress percentage (0–100).
 * @param props.size - Ring size.
 * @param props.showValue - Whether to render the centred value.
 * @param props.value - Clamped rating value.
 * @param props.max - Maximum rating value.
 * @returns The rendered ring.
 */
export function CircleRating({
  percent,
  size,
  showValue,
  value,
  max,
}: Readonly<CircleRatingProps>) {
  const { size: svgSize, stroke } = circleSizeMap[size]
  const radius = (svgSize - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className={RATING_CIRCLE_CLASS}>
      <svg
        className={RATING_SVG_CLASS}
        width={svgSize}
        height={svgSize}
        aria-hidden
      >
        <circle
          className={RATING_TRACK_CLASS}
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className={RATING_INDICATOR_CLASS}
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {showValue ? (
        <span
          className={`${RATING_VALUE_CLASS} ${RATING_VALUE_CENTERED_CLASS}`}
        >
          {max === 100 ? Math.round(percent) : value.toFixed(1)}
        </span>
      ) : null}
    </div>
  )
}

export default CircleRating
