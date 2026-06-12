import { useEffect, useEffectEvent, useState } from 'react'

import { AVATAR_IMAGE_CLASS } from '@fubaritico-ds/variants'

import { useCascadeCandidate } from './AvatarContext'

import type { AvatarCandidateStatus, AvatarImageStatus } from './AvatarContext'
import type { ComponentProps, ReactNode } from 'react'

export interface AvatarImageProps
  extends Omit<ComponentProps<'img'>, 'src' | 'alt' | 'children'> {
  /** Image source URL. An empty/null value yields immediately to the next cascade candidate. */
  src?: string | null
  /**
   * Decorative by default (the `<Avatar>` root carries the accessible name); defaults to `''`.
   * Set a non-empty value ONLY when the root has no `aria-label`, otherwise the name is announced
   * twice (root label + image alt).
   */
  alt?: string
  /** Fired on every load-status transition (`idle`/`loading`/`loaded`/`error`). */
  onLoadingStatusChange?: (status: AvatarImageStatus) => void
  /**
   * Optional render-prop for the intermediate **loading** visual (e.g. a skeleton). Receives the
   * current status. Shown only while this image is the blocking, pending candidate.
   */
  children?: (status: AvatarImageStatus) => ReactNode
}

/**
 * Avatar image candidate. Renders the `<img>` whenever there is a `src` (so `onLoad`/`onError` can
 * fire) but keeps it hidden until it is the active, loaded candidate. While loading it is the
 * blocking candidate — the cascade shows its optional loading render-prop and holds back later
 * candidates (anti-flash). On error/empty it fails over to the next candidate.
 *
 * @param props - {@link AvatarImageProps}
 * @returns The image candidate output (image, loading affordance, or nothing).
 */
export function AvatarImage({
  ref,
  src,
  alt = '',
  onLoadingStatusChange,
  children,
  ...rest
}: Readonly<AvatarImageProps>) {
  // Track the <img> load lifecycle; seed to 'error' when there is no src (nothing to load).
  const [status, setStatus] = useState<AvatarImageStatus>(() =>
    src ? 'loading' : 'error'
  )

  // Reset the lifecycle whenever the source changes (new src → load again).
  useEffect(() => {
    setStatus(src ? 'loading' : 'error')
  }, [src])

  // Named handlers for the <img> load events (readability; no useCallback — host element, no memo).
  const handleLoad = () => {
    setStatus('loaded')
  }
  const handleError = () => {
    setStatus('error')
  }

  // Effect event: always calls the latest consumer callback without making the effect depend on its
  // (often inline) identity — so it fires on real transitions only, not on every render.
  const notify = useEffectEvent((next: AvatarImageStatus) => {
    onLoadingStatusChange?.(next)
  })
  useEffect(() => {
    notify(status)
  }, [status])

  const candidateStatus: AvatarCandidateStatus =
    status === 'loaded' ? 'ready' : status === 'error' ? 'failed' : 'pending'

  // Register in the surrounding cascade and get our render mode (show / loading / hidden).
  const mode = useCascadeCandidate(candidateStatus)

  return (
    <>
      {src ? (
        <img
          ref={ref}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={AVATAR_IMAGE_CLASS}
          hidden={mode !== 'show'}
          {...rest}
        />
      ) : null}
      {mode === 'loading' ? children?.(status) : null}
    </>
  )
}

export default AvatarImage
