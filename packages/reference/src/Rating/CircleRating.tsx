import clsx from 'clsx'

import type { RatingSize } from './Rating'

const circleSizeMap: Record<
  RatingSize,
  { size: number; stroke: number; fontSize: string }
> = {
  sm: { size: 32, stroke: 3, fontSize: 'ui:text-xs' },
  md: { size: 48, stroke: 4, fontSize: 'ui:text-sm' },
  lg: { size: 64, stroke: 5, fontSize: 'ui:text-base' },
}

const getColorClass = (percent: number): string => {
  if (percent >= 70) return 'ui:text-green-600'
  if (percent >= 40) return 'ui:text-amber-600'
  return 'ui:text-red-500'
}

export interface CircleRatingProps {
  /** Percentage value (0-100) for the progress ring */
  percent: number
  /** Size of the rating circle */
  size: RatingSize
  /** Whether to display the numeric value in the center */
  showValue: boolean
  /** The actual rating value (used for display) */
  value: number
  /** Maximum rating value (used for display formatting) */
  max: number
  /** Custom class for the background track circle */
  trackClassName?: string
}

function CircleRating({
  percent,
  size,
  showValue,
  value,
  max,
  trackClassName,
}: Readonly<CircleRatingProps>) {
  const { size: svgSize, stroke, fontSize } = circleSizeMap[size]
  const radius = (svgSize - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="ui:relative ui:inline-flex ui:items-center ui:justify-center">
      <svg width={svgSize} height={svgSize} className="ui:-rotate-90">
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className={trackClassName ?? 'ui:text-gray-200'}
        />
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={clsx(
            'ui:transition-all ui:duration-500',
            getColorClass(percent)
          )}
        />
      </svg>
      {showValue && (
        <span
          className={clsx(
            'ui:absolute ui:font-bold',
            fontSize,
            getColorClass(percent)
          )}
        >
          {max === 100 ? Math.round(percent) : value.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export default CircleRating
