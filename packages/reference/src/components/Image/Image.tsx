import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'

import { getBlurDataUrl } from '../../utils'

import {
  IMAGE_BLUR_CLASS,
  IMAGE_CLASS,
  IMAGE_FALLBACK_CLASS,
  imageVariants,
} from '@fubaritico/variants'

import { Icon } from '../Icon'

import type { ComponentProps, ReactNode } from 'react'

/** Pixel size of the placeholder glyph shown when the source fails. */
const FALLBACK_ICON_SIZE = 48

/** Loading lifecycle of the {@link Image}. */
export type ImageState = 'loading' | 'loaded' | 'error'

export type AspectRatio = '2/3' | '16/9' | '1/1' | '4/3' | '3/2'

export type ImageLoading = 'lazy' | 'eager'

export interface ImageProps
  extends Omit<ComponentProps<'img'>, 'placeholder' | 'onLoad' | 'onError'> {
  /** Image source URL */
  src: string
  /** Alt text for accessibility */
  alt: string
  /** Pre-generated blur data URL (base64) */
  blurDataUrl?: string
  /** Auto-generate blur placeholder from src using Canvas API */
  autoBlur?: boolean
  /** Size of blur canvas (smaller = more blur). Default: 16 */
  blurSize?: number
  /** JPEG quality for blur (0-1). Default: 0.3 */
  blurQuality?: number
  /** Aspect ratio of the image container */
  aspectRatio?: AspectRatio | (string & {})
  /** Fallback content when image fails to load */
  fallback?: ReactNode
  /** Callback when image loads successfully */
  onLoad?: () => void
  /** Callback when image fails to load */
  onError?: () => void
  /** Load strategy: 'lazy' waits for viewport visibility, 'eager' loads immediately. Default: 'eager' */
  loading?: ImageLoading
}

export function Image({
  src,
  alt,
  blurDataUrl,
  autoBlur = false,
  blurSize = 16,
  blurQuality = 0.3,
  aspectRatio = '2/3',
  fallback,
  className,
  onLoad,
  onError,
  loading = 'eager',
  ...rest
}: Readonly<ImageProps>) {
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<ImageState>('loading')
  const [generatedBlur, setGeneratedBlur] = useState<string | undefined>(
    undefined
  )
  const [blurReady, setBlurReady] = useState(!autoBlur || !!blurDataUrl)
  const [isVisible, setIsVisible] = useState(loading === 'eager')

  const effectiveBlur = blurDataUrl ?? generatedBlur

  // Lazy load with IntersectionObserver
  useEffect(() => {
    if (loading === 'eager' || !containerRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '50px' }
    )

    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [loading])

  useEffect(() => {
    if (!autoBlur || blurDataUrl) {
      setBlurReady(true)
      return
    }

    setBlurReady(false)

    getBlurDataUrl(src, blurSize, blurQuality)
      .then((base64) => {
        setGeneratedBlur(base64)
        setBlurReady(true)
      })
      .catch(() => {
        setBlurReady(true)
      })
  }, [autoBlur, src, blurDataUrl, blurSize, blurQuality])

  useEffect(() => {
    setState('loading')
    setGeneratedBlur(undefined)

    // Check if image is already loaded from cache
    if (imgRef.current?.complete && imgRef.current.naturalHeight !== 0) {
      setState('loaded')
    }
  }, [src])

  const handleLoad = useCallback(() => {
    setState('loaded')
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setState('error')
    onError?.()
  }, [onError])

  const defaultFallback = (
    <div className={IMAGE_FALLBACK_CLASS}>
      <Icon name="Photo" size={FALLBACK_ICON_SIZE} aria-hidden="true" />
    </div>
  )

  return (
    <div
      ref={containerRef}
      className={clsx(IMAGE_CLASS, className)}
      style={aspectRatio ? { aspectRatio } : undefined}
      data-state={state}
    >
      {state === 'error' ? (
        (fallback ?? defaultFallback)
      ) : (
        <>
          {effectiveBlur && state === 'loading' ? (
            <img
              src={effectiveBlur}
              alt=""
              aria-hidden="true"
              className={IMAGE_BLUR_CLASS}
            />
          ) : null}

          {blurReady && isVisible ? (
            <img
              ref={imgRef}
              src={src}
              alt={alt}
              onLoad={handleLoad}
              onError={handleError}
              className={imageVariants({ loaded: state === 'loaded' })}
              {...rest}
            />
          ) : null}
        </>
      )}
    </div>
  )
}

export default Image
