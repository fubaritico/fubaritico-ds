import clsx from 'clsx'

import type { HTMLAttributes } from 'react'

export interface CarouselItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether this is a hero item (full width with snap) */
  isHero?: boolean
  /** Whether this is a lightbox item (full width with snap, same layout as hero) */
  isLightbox?: boolean
}

/**
 * Wrapper for individual carousel items.
 * For hero and lightbox variants, items take full width and snap to center.
 */
function CarouselItem({
  children,
  isHero = false,
  isLightbox = false,
  className,
  ...rest
}: Readonly<CarouselItemProps>) {
  return (
    <div
      className={clsx(
        'ui:flex-shrink-0',
        (isHero || isLightbox) && 'ui:w-full ui:snap-center',
        isLightbox && 'ui:flex ui:items-center ui:justify-center ui:h-full',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export default CarouselItem
