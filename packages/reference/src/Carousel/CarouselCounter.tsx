import clsx from 'clsx'

export interface CarouselCounterProps {
  /** Current index (0-based) — displayed as 1-based */
  current: number
  /** Total number of items */
  total: number
  /** Additional class name */
  className?: string
}

/**
 * Counter for Carousel lightbox variant.
 * Displays current position as "3 / 20" (1-indexed).
 */
function CarouselCounter({
  current,
  total,
  className,
}: Readonly<CarouselCounterProps>) {
  return (
    <div
      className={clsx(
        'ui:bg-black/70 ui:rounded-full ui:px-3 ui:py-1',
        'ui:text-white/90 ui:text-sm ui:font-medium ui:tabular-nums',
        className
      )}
    >
      {current + 1} / {total}
    </div>
  )
}

export default CarouselCounter
