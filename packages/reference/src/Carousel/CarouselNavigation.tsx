import clsx from 'clsx'
import { useEffect, useRef } from 'react'

import { IconButton } from '../IconButton'

import type { RefObject } from 'react'

/** Position mode for navigation buttons */
export type CarouselNavigationPosition = 'inline' | 'sides' | 'sides-inset'

export interface CarouselNavigationProps {
  /** Callback for previous button */
  onPrev: () => void
  /** Callback for next button */
  onNext: () => void
  /** Whether previous is disabled */
  canPrev: boolean
  /** Whether next is disabled */
  canNext: boolean
  /** Button size */
  size?: 'sm' | 'md'
  /** Position mode */
  position?: CarouselNavigationPosition
  /** Icon button visual variant — ghost for lightbox (white arrows on dark bg) */
  iconVariant?: 'secondary' | 'ghost'
  /** Additional class name */
  className?: string
}

/**
 * When a nav button becomes disabled after being clicked,
 * move focus to the opposite button.
 */
function useFocusTransfer(
  prevRef: RefObject<HTMLButtonElement | null>,
  nextRef: RefObject<HTMLButtonElement | null>,
  canPrev: boolean,
  canNext: boolean,
  lastClicked: RefObject<'prev' | 'next' | null>
) {
  useEffect(() => {
    if (!canPrev && lastClicked.current === 'prev') {
      lastClicked.current = null
      nextRef.current?.focus()
    }
  }, [canPrev, nextRef, lastClicked])

  useEffect(() => {
    if (!canNext && lastClicked.current === 'next') {
      lastClicked.current = null
      prevRef.current?.focus()
    }
  }, [canNext, prevRef, lastClicked])
}

/**
 * Navigation buttons for Carousel (previous/next).
 * - inline: side by side (for bottom-right layout)
 * - sides: absolute, centered on the carousel edges (overhangs container — standard carousel)
 * - sides-inset: absolute, inside the container with padding (lightbox, fullscreen contexts)
 */
function CarouselNavigation({
  onPrev,
  onNext,
  canPrev,
  canNext,
  size = 'sm',
  position = 'inline',
  iconVariant = 'secondary',
  className,
}: Readonly<CarouselNavigationProps>) {
  const prevRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const lastClicked = useRef<'prev' | 'next' | null>(null)

  useFocusTransfer(prevRef, nextRef, canPrev, canNext, lastClicked)

  const handlePrev = () => {
    lastClicked.current = 'prev'
    onPrev()
  }

  const handleNext = () => {
    lastClicked.current = 'next'
    onNext()
  }

  if (position === 'sides') {
    return (
      <>
        <div className="ui:absolute ui:left-0 ui:top-1/2 ui:-translate-x-1/2 ui:-translate-y-1/2">
          <IconButton
            ref={prevRef}
            icon="ChevronLeft"
            variant={iconVariant}
            size={size}
            onClick={handlePrev}
            disabled={!canPrev}
            aria-label="Previous"
          />
        </div>
        <div className="ui:absolute ui:right-0 ui:top-1/2 ui:-translate-y-1/2 ui:translate-x-1/2">
          <IconButton
            ref={nextRef}
            icon="ChevronRight"
            variant={iconVariant}
            size={size}
            onClick={handleNext}
            disabled={!canNext}
            aria-label="Next"
          />
        </div>
      </>
    )
  }

  if (position === 'sides-inset') {
    return (
      <>
        <div className="ui:absolute ui:left-4 ui:top-1/2 ui:-translate-y-1/2 ui:z-10 ui:text-white">
          <IconButton
            ref={prevRef}
            icon="ChevronLeft"
            variant={iconVariant}
            size={size}
            onClick={handlePrev}
            disabled={!canPrev}
            aria-label="Previous"
            className="ui:bg-white/20 ui:hover:bg-white/55"
          />
        </div>
        <div className="ui:absolute ui:right-4 ui:top-1/2 ui:-translate-y-1/2 ui:z-10 ui:text-white">
          <IconButton
            ref={nextRef}
            icon="ChevronRight"
            variant={iconVariant}
            size={size}
            onClick={handleNext}
            disabled={!canNext}
            aria-label="Next"
            className="ui:bg-white/20 ui:hover:bg-white/55"
          />
        </div>
      </>
    )
  }

  return (
    <div className={clsx('ui:flex ui:gap-2', className)}>
      <IconButton
        ref={prevRef}
        icon="ChevronLeft"
        variant={iconVariant}
        size={size}
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous"
      />
      <IconButton
        ref={nextRef}
        icon="ChevronRight"
        variant={iconVariant}
        size={size}
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next"
      />
    </div>
  )
}

export default CarouselNavigation
