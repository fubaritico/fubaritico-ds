import clsx from 'clsx'
import { useState } from 'react'

import {
  AVATAR_ICON_CLASS,
  AVATAR_IMAGE_CLASS,
  AVATAR_INITIALS_CLASS,
  avatarVariants,
} from '@fubaritico-ds/variants'

import { Icon } from '../Icon'

import type { IconSize } from '../Icon'
import type { AvatarSize } from '@fubaritico-ds/variants'
import type { ComponentProps } from 'react'

export type { AvatarSize }

/**
 * Fallback-icon pixel size per avatar size. The Icon takes a numeric `size` prop (not a class), so
 * this mapping lives here rather than in the framework-agnostic resolver. Values stay within
 * {@link IconSize}; `xs` uses 16 (the smallest valid icon size) inside its 1.5rem footprint.
 */
const AVATAR_ICON_SIZE: Record<AvatarSize, IconSize> = {
  xs: 16,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
}

export interface AvatarProps extends Omit<ComponentProps<'img'>, 'src'> {
  /** Image source URL. When absent or it fails to load, the fallback (initials, then icon) shows. */
  src?: string | null
  /** Alt text describing the person — required even when an image may be missing. */
  alt: string
  /** Avatar size; defaults to `'md'`. */
  size?: AvatarSize
  /** Fallback initials shown when there is no image (truncated to the first 2 characters). */
  initials?: string
}

/**
 * Avatar — native BEM skin (`@fubaritico-ds/styles`). A circular media slot that resolves, in order:
 * the image, then the consumer initials, then the `User` icon. Size resolves to a BEM class via
 * {@link avatarVariants}; colours and the footprint are driven by the overridable `--ui-avatar-*`
 * component variables. Extra `img` attributes (`id`, `data-*`, `loading`, …) are forwarded to the
 * `<img>` element when an image is rendered.
 *
 * @param props - {@link AvatarProps}
 * @returns The rendered avatar element.
 */
export function Avatar({
  className,
  src,
  alt,
  size = 'md',
  initials,
  ...rest
}: Readonly<AvatarProps>) {
  const [hasError, setHasError] = useState(false)

  const showImage = Boolean(src) && !hasError

  const handleError = () => {
    setHasError(true)
  }

  return (
    <div
      // When an image renders, its own `alt` is the accessible name. In the initials/icon fallback
      // there is no <img>, so the container itself carries the name (the icon is aria-hidden).
      {...(showImage ? {} : { role: 'img', 'aria-label': alt })}
      className={clsx(avatarVariants({ size }), className)}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt={alt}
          onError={handleError}
          className={AVATAR_IMAGE_CLASS}
          {...rest}
        />
      ) : initials ? (
        <span className={AVATAR_INITIALS_CLASS}>{initials.slice(0, 2)}</span>
      ) : (
        <Icon
          name="User"
          size={AVATAR_ICON_SIZE[size]}
          className={AVATAR_ICON_CLASS}
        />
      )}
    </div>
  )
}

export default Avatar
