import { useIsMobile } from '@fubaritico-ds/shared'
import clsx from 'clsx'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import CarouselCounter from './CarouselCounter'
import CarouselError from './CarouselError'
import CarouselNavigation from './CarouselNavigation'
import CarouselPagination from './CarouselPagination'

import type { ReactNode } from 'react'

/** Carousel visual variant */
export type CarouselVariant = 'standard' | 'hero' | 'lightbox'

/** Arrow position for navigation buttons */
export type CarouselArrowPosition = 'sides' | 'bottom-right'

export interface CarouselProps {
  /** Carousel items */
  children?: ReactNode
  /** Visual variant */
  variant?: CarouselVariant
  /** Show pagination dots (ignored for lightbox — counter is shown instead) */
  showPagination?: boolean
  /** Show navigation arrows */
  showArrows?: boolean
  /** Arrow position */
  arrowPosition?: CarouselArrowPosition
  /** Gap between items in pixels */
  gap?: number
  /** Additional class name */
  className?: string
  /** Class name for the hero controls container (pagination + arrows) — use to constrain width/padding */
  heroControlsClassName?: string
  /** Error message to display instead of carousel content */
  errorMessage?: string
  /** Apply rounded corners to viewport */
  rounded?: boolean
  /**
   * Initial scroll index — jumps to this item on mount without animation.
   * Use with key={index} on Carousel for URL-based navigation (lightbox).
   */
  initialIndex?: number
  /**
   * Override internal prev navigation (e.g. navigate to previous URL in lightbox).
   * When provided, replaces internal scrollPrev.
   */
  onPrev?: () => void
  /**
   * Override internal next navigation (e.g. navigate to next URL in lightbox).
   * When provided, replaces internal scrollNext.
   */
  onNext?: () => void
  /**
   * When true, all internal scroll transitions are instant (no smooth animation).
   * Use for lightbox with URL-based navigation where the Carousel remounts each time.
   */
  disableAnimation?: boolean
  /**
   * When true, user-initiated wheel/trackpad scroll is blocked on the container,
   * and currentIndex is driven entirely by initialIndex (no scroll tracking).
   * Use for URL-driven carousels (lightbox) to avoid scroll/resize desync.
   */
  disableScroll?: boolean
}

/**
 * Carousel component with horizontal scroll, pagination, and navigation.
 * Supports three variants:
 * - standard: multi-items horizontal scroll
 * - hero: single panoramic item with snap
 * - lightbox: single item per view, ghost arrows, counter (for PhotoViewer)
 */
function Carousel({
  children,
  variant = 'standard',
  showPagination = true,
  showArrows = true,
  arrowPosition = 'sides',
  gap = 16,
  className,
  heroControlsClassName,
  errorMessage,
  rounded = true,
  initialIndex,
  onPrev,
  onNext,
  disableAnimation = false,
  disableScroll = false,
}: Readonly<CarouselProps>) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [totalPositions, setTotalPositions] = useState(1)

  /**
   * Internal scroll-tracked index — updated by handleScroll on every scroll event.
   * Only used when disableScroll=false (scroll-driven mode).
   */
  const [scrollIndex, setScrollIndex] = useState(initialIndex ?? 0)

  /**
   * Effective current index.
   * - disableScroll=true  → driven by initialIndex prop (URL-driven, no scroll tracking)
   * - disableScroll=false → driven by scroll events via scrollIndex state
   * This separation prevents ResizeObserver/snap drift from corrupting the index
   * in URL-driven carousels (lightbox).
   */
  const currentIndex = disableScroll ? (initialIndex ?? 0) : scrollIndex

  const isMobile = useIsMobile()
  const isHero = variant === 'hero'
  const isLightbox = variant === 'lightbox'
  /** Hero and lightbox both use container width for per-item scroll calculation */
  const isFullWidth = isHero || isLightbox

  /**
   * Calculates the total number of scroll positions based on container and item dimensions.
   * For hero/lightbox: positions = number of items (one per slide).
   * For standard: positions = ceil(maxScrollLeft / itemWidth) + 1.
   */
  const calculatePositions = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    const items = container.children

    if (isFullWidth) {
      setTotalPositions(items.length)
      return
    }

    const firstItem = items[0] as HTMLElement | undefined
    if (!firstItem) {
      setTotalPositions(1)
      return
    }

    const itemWidth = firstItem.offsetWidth
    const maxScrollLeft = container.scrollWidth - container.offsetWidth

    if (maxScrollLeft <= 0) {
      setTotalPositions(1)
    } else if (itemWidth > 0) {
      const positions = Math.round(maxScrollLeft / (itemWidth + gap)) + 1
      setTotalPositions(Math.max(1, positions))
    }
  }, [gap, isFullWidth])

  /**
   * Effect: Recalculates positions when children or calculatePositions function changes.
   */
  useEffect(() => {
    calculatePositions()
  }, [children, calculatePositions])

  /**
   * Effect: Sets up ResizeObserver to recalculate positions on viewport/container resize.
   */
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      calculatePositions()
    })

    resizeObserver.observe(container)
    return () => {
      resizeObserver.disconnect()
    }
  }, [calculatePositions])

  /**
   * Effect: Jumps to initialIndex on mount AND when it changes.
   * For URL-driven carousels (lightbox with disableScroll + disableAnimation),
   * this allows prop-driven navigation without remounting via key={}.
   */
  useLayoutEffect(() => {
    const index = initialIndex ?? 0
    if (index <= 0) return
    const container = scrollRef.current
    if (!container) return
    const firstItem = container.children[0] as HTMLElement | undefined
    const itemWidth = isFullWidth
      ? container.offsetWidth
      : (firstItem?.offsetWidth ?? 0)
    container.style.scrollBehavior = 'auto'
    container.scrollLeft = index * (itemWidth + (isFullWidth ? 0 : gap))
    container.style.scrollBehavior = ''
  }, [initialIndex, isFullWidth, gap])

  /**
   * Effect: Tracks scroll position to update currentIndex.
   * Skipped entirely when disableScroll=true (currentIndex comes from initialIndex).
   */
  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    const scrollLeft = container.scrollLeft
    const firstItem = container.children[0] as HTMLElement | undefined
    const itemWidth = isFullWidth
      ? container.offsetWidth
      : (firstItem?.offsetWidth ?? 0)

    if (itemWidth > 0) {
      const index = Math.round(scrollLeft / (itemWidth + gap))
      setScrollIndex(Math.min(index, totalPositions - 1))
    }
  }, [gap, isFullWidth, totalPositions])

  /**
   * Effect: Attaches scroll listener to update scrollIndex.
   * Skipped when disableScroll=true — currentIndex is driven by initialIndex prop instead.
   */
  useEffect(() => {
    if (disableScroll) return
    const container = scrollRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [disableScroll, handleScroll])

  /**
   * Effect: Blocks wheel/trackpad scroll when disableScroll=true.
   * Uses preventDefault on wheel events — must be non-passive to work.
   */
  useEffect(() => {
    if (!disableScroll) return
    const container = scrollRef.current
    if (!container) return

    const preventScroll = (e: WheelEvent) => {
      e.preventDefault()
    }

    container.addEventListener('wheel', preventScroll, { passive: false })
    return () => {
      container.removeEventListener('wheel', preventScroll)
    }
  }, [disableScroll])

  /**
   * Scrolls to a specific position index with smooth animation.
   */
  const scrollTo = useCallback(
    (index: number) => {
      const container = scrollRef.current
      if (!container) return

      const firstItem = container.children[0] as HTMLElement | undefined
      const itemWidth = isFullWidth
        ? container.offsetWidth
        : (firstItem?.offsetWidth ?? 0)

      const isLastPosition = index === totalPositions - 1
      const scrollLeft = isLastPosition
        ? container.scrollWidth - container.offsetWidth
        : index * (itemWidth + gap)

      container.scrollTo({
        left: scrollLeft,
        behavior: disableAnimation ? 'auto' : 'smooth',
      })
    },
    [gap, isFullWidth, totalPositions, disableAnimation]
  )

  /** Scrolls to the previous position (internal fallback when onPrev is not provided) */
  const scrollPrev = useCallback(() => {
    if (currentIndex > 0) {
      scrollTo(currentIndex - 1)
    }
  }, [currentIndex, scrollTo])

  /** Scrolls to the next position (internal fallback when onNext is not provided) */
  const scrollNext = useCallback(() => {
    if (currentIndex < totalPositions - 1) {
      scrollTo(currentIndex + 1)
    }
  }, [currentIndex, totalPositions, scrollTo])

  /** Effective prev handler: external callback takes priority over internal scroll */
  const handlePrev = onPrev ?? scrollPrev
  /** Effective next handler: external callback takes priority over internal scroll */
  const handleNext = onNext ?? scrollNext

  /**
   * Refs that always point to the latest handlePrev/handleNext.
   * Allows the keyboard effect to use a stable listener (empty deps) without stale closures.
   */
  const handlePrevRef = useRef(handlePrev)
  const handleNextRef = useRef(handleNext)
  useEffect(() => {
    handlePrevRef.current = handlePrev
    handleNextRef.current = handleNext
  })

  /**
   * Effect: Keyboard navigation — ArrowLeft/ArrowRight trigger prev/next.
   * Listens on document so it works in lightbox (fullscreen) without requiring focus.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevRef.current()
      if (e.key === 'ArrowRight') handleNextRef.current()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  /**
   * Effect: Touch swipe navigation — swipe left/right triggers next/prev.
   * Uses a 50px threshold to distinguish swipes from taps.
   * Tracks touch start position and compares with touch end.
   */
  const touchStartXRef = useRef<number | null>(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const onTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.touches[0].clientX
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartXRef.current === null) return
      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current
      touchStartXRef.current = null

      if (Math.abs(deltaX) < 50) return

      if (deltaX < 0) {
        handleNextRef.current()
      } else {
        handlePrevRef.current()
      }
    }

    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  if (errorMessage) {
    return <CarouselError message={errorMessage} />
  }

  const canScrollPrev = currentIndex > 0
  const canScrollNext = currentIndex < totalPositions - 1
  const showControls = totalPositions > 1

  return (
    <div className={clsx('ui:relative', isLightbox && 'ui:h-full', className)}>
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className={clsx(
          'ui:flex ui:overflow-x-auto ui:scroll-smooth ui:scrollbar-none ui:touch-action-pan-x',
          isFullWidth && 'ui:snap-x ui:snap-mandatory',
          isLightbox && 'ui:h-full',
          rounded && 'ui:rounded-lg ui:overflow-hidden'
        )}
        style={{ gap: `${String(gap)}px` }}
        {...(isFullWidth && {
          tabIndex: 0,
          role: 'region',
          'aria-label': 'Image gallery',
        })}
      >
        {children}
      </div>

      {/* Standard: Arrows on sides (desktop only) */}
      {showControls &&
        showArrows &&
        !isMobile &&
        arrowPosition === 'sides' &&
        !isHero &&
        !isLightbox && (
          <CarouselNavigation
            onPrev={handlePrev}
            onNext={handleNext}
            canPrev={canScrollPrev}
            canNext={canScrollNext}
            size="md"
            position="sides"
          />
        )}

      {/* Hero: single container — pagination centered, arrows right-aligned (desktop only) */}
      {showControls && isHero && (showPagination || showArrows) && (
        <div
          className={clsx(
            'ui:absolute ui:bottom-4 ui:left-1/2 ui:-translate-x-1/2 ui:w-full ui:z-10 ui:flex ui:items-end',
            isMobile ? 'ui:justify-center' : '',
            heroControlsClassName
          )}
        >
          {!isMobile && <div className="ui:flex-1" />}
          {showPagination && (
            <CarouselPagination
              total={totalPositions}
              current={currentIndex}
              light
            />
          )}
          {!isMobile && (
            <div className="ui:flex-1 ui:flex ui:justify-end">
              {showArrows && (
                <CarouselNavigation
                  onPrev={handlePrev}
                  onNext={handleNext}
                  canPrev={canScrollPrev}
                  canNext={canScrollNext}
                  size="sm"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Standard: Pagination + Arrows below */}
      {showControls &&
      !isHero &&
      !isLightbox &&
      ((showArrows && arrowPosition === 'bottom-right') || showPagination) ? (
        <div
          className={clsx(
            'ui:mt-4 ui:flex ui:items-center',
            arrowPosition === 'bottom-right'
              ? 'ui:justify-end ui:gap-4'
              : 'ui:justify-center'
          )}
        >
          {showPagination && (
            <CarouselPagination total={totalPositions} current={currentIndex} />
          )}
          {showArrows && !isMobile && arrowPosition === 'bottom-right' && (
            <CarouselNavigation
              onPrev={handlePrev}
              onNext={handleNext}
              canPrev={canScrollPrev}
              canNext={canScrollNext}
              size="sm"
            />
          )}
        </div>
      ) : null}

      {/* Lightbox: Counter top-right, ghost arrows on sides */}
      {showControls && isLightbox && (
        <div className="ui:absolute ui:top-4 ui:right-4 ui:z-10">
          <CarouselCounter current={currentIndex} total={totalPositions} />
        </div>
      )}
      {showControls && isLightbox && showArrows && !isMobile && (
        <CarouselNavigation
          onPrev={handlePrev}
          onNext={handleNext}
          canPrev={canScrollPrev}
          canNext={canScrollNext}
          size="md"
          position="sides-inset"
          iconVariant="ghost"
        />
      )}
    </div>
  )
}

export default Carousel
