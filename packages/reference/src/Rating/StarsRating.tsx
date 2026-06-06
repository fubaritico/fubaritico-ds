import clsx from 'clsx'

import { Icon } from '../Icon'

import type { IconSize } from '../Icon'
import type { RatingSize } from './Rating'

const starsSizeMap: Record<RatingSize, IconSize> = {
  sm: 16,
  md: 20,
  lg: 24,
}

export interface StarsRatingProps {
  /** Percentage value (0-100) for the star fill */
  percent: number
  /** Size of the stars */
  size: RatingSize
  /** Whether to display the numeric value next to stars */
  showValue: boolean
  /** The actual rating value (used for display) */
  value: number
  /** Maximum rating value (used for display formatting) */
  max: number
}

function StarsRating({
  percent,
  size,
  showValue,
  value,
  max,
}: Readonly<StarsRatingProps>) {
  const iconSize = starsSizeMap[size]

  return (
    <div className="ui:inline-flex ui:items-center ui:gap-1">
      <div className="ui:relative">
        {/* Empty stars */}
        <div className="ui:flex ui:text-gray-300">
          {[1, 2, 3, 4, 5].map((i) => (
            <Icon key={i} name="Star" size={iconSize} />
          ))}
        </div>
        {/* Filled stars with clip */}
        <div
          className="ui:absolute ui:inset-0 ui:flex ui:text-yellow-400"
          style={{ clipPath: `inset(0 ${String(100 - percent)}% 0 0)` }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <Icon key={i} name="Star" size={iconSize} />
          ))}
        </div>
      </div>
      {showValue && (
        <span
          className={clsx(
            'ui:font-medium ui:text-muted-foreground',
            size === 'sm' && 'ui:text-xs',
            size === 'md' && 'ui:text-sm',
            size === 'lg' && 'ui:text-base'
          )}
        >
          {max === 100 ? (value / 10).toFixed(1) : value.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export default StarsRating
