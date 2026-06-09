import { useState } from 'react'

import { getOptimizedImageUrl } from '@fubaritico-ds/shared'

import { Skeleton } from '../Skeleton'

export interface HeroImageProps {
  /** Backdrop path from TMDB API */
  backdropPath?: string | null
  /** Alt text for the image */
  title?: string | null
}

/**
 * HeroImage component for displaying optimized backdrop images with responsive sources
 * and gradient overlay. Used in hero sections across the application.
 */
function HeroImage({ backdropPath, title }: Readonly<HeroImageProps>) {
  const [loading, setLoading] = useState(true)

  const backdropPathMobile = backdropPath
    ? getOptimizedImageUrl(backdropPath, 'w300', 60)
    : undefined

  const backdropPathTablet = backdropPath
    ? getOptimizedImageUrl(backdropPath, 'w300', 60)
    : undefined

  const backdropPathDesktop = backdropPath
    ? getOptimizedImageUrl(backdropPath, 'w780', 60)
    : undefined

  const backdropPathUltraWide = backdropPath
    ? getOptimizedImageUrl(backdropPath, 'w1280', 60)
    : undefined

  return (
    <>
      {loading && (
        <Skeleton
          data-testid="hero-image-skeleton"
          variant="rectangle"
          width="ui:relative ui:w-full ui:h-full ui:hero-height ui:z-0"
          aspectRatio="21/9"
          rounded={false}
        />
      )}
      <picture>
        {backdropPathMobile && (
          <source media="(max-width: 639px)" srcSet={backdropPathMobile} />
        )}
        {backdropPathTablet && (
          <source media="(max-width: 1023px)" srcSet={backdropPathTablet} />
        )}
        {backdropPathDesktop && (
          <source media="(max-width: 1535px)" srcSet={backdropPathDesktop} />
        )}
        {backdropPathUltraWide && (
          <source media="(min-width: 1536px)" srcSet={backdropPathUltraWide} />
        )}
        {backdropPathMobile && (
          <img
            src={backdropPathMobile}
            fetchPriority="high"
            onLoad={() => {
              setLoading(false)
            }}
            alt={title ?? 'Unknown'}
            className="ui:absolute ui:w-full ui:object-cover ui:object-center ui:z-0 ui:h-auto! ui:top-1/2 ui:-translate-y-1/2 ui:xl:top-0 ui:xl:-translate-y-0"
          />
        )}
      </picture>
      {/* Gradient Overlay */}
      <div className="ui:absolute ui:inset-0 ui:bg-gradient-to-t ui:from-black/80 ui:via-black/40 ui:to-transparent ui:z-1 ui:top-0 ui:left-0 ui:right-0 ui:bottom-0" />
    </>
  )
}

export default HeroImage
