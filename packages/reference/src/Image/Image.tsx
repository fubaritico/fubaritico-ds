import { getBlurDataUrl } from '@fubaritico-ds/shared'
import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Icon } from '../Icon'

import type { ImgHTMLAttributes, ReactNode } from 'react'

export type ImageState = 'loading' | 'loaded' | 'error'

export type AspectRatio = '2/3' | '16/9' | '1/1' | '4/3' | '3/2'

export type ImageLoading = 'lazy' | 'eager'

export interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> {
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

function Image({
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
    <div className="ui:flex ui:h-full ui:w-full ui:items-center ui:justify-center ui:bg-muted">
      <Icon
        name="Photo"
        size={48}
        className="ui:text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  )

  return (
    <div
      ref={containerRef}
      className={clsx('ui:relative ui:overflow-hidden ui:bg-muted', className)}
      style={aspectRatio ? { aspectRatio } : undefined}
      data-state={state}
    >
      {state === 'error' ? (
        (fallback ?? defaultFallback)
      ) : (
        <>
          {effectiveBlur && state === 'loading' && (
            <img
              src={effectiveBlur}
              alt=""
              aria-hidden="true"
              className="ui:absolute ui:inset-0 ui:h-full ui:w-full ui:scale-105 ui:object-cover"
            />
          )}

          {blurReady && isVisible && (
            <img
              ref={imgRef}
              src={src}
              alt={alt}
              onLoad={handleLoad}
              onError={handleError}
              className={clsx(
                'ui:absolute ui:inset-0 ui:h-full ui:w-full ui:object-cover ui:transition-opacity ui:duration-300',
                state === 'loaded' ? 'ui:opacity-100' : 'ui:opacity-0'
              )}
              {...rest}
            />
          )}
        </>
      )}
    </div>
  )
}

export default Image
