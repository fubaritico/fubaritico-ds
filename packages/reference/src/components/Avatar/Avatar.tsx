import clsx from 'clsx'
import { useMemo } from 'react'

import { avatarVariants } from '@fubaritico-ds/variants'

import { AvatarConfigContext } from './AvatarContext'
import { AvatarFallback } from './AvatarFallback'
import { AvatarIcon } from './AvatarIcon'
import { AvatarImage } from './AvatarImage'
import { AvatarInitials } from './AvatarInitials'

import type { AvatarSize } from '@fubaritico-ds/variants'
import type { ComponentProps } from 'react'

export type { AvatarSize }

export interface AvatarProps extends ComponentProps<'div'> {
  /** Avatar size; defaults to `'md'`. Trickles to candidates via the config context. */
  size?: AvatarSize
  /**
   * **Required.** The accessible name of the whole avatar (the person). The root carries it via
   * `role="img"` + `aria-label`, so the name holds across every fallback tier (image, initials, icon).
   */
  'aria-label': string
}

/**
 * Avatar root — native BEM skin (`@fubaritico-ds/styles`) + the compound's stable config context.
 * Compose the content with the sub-components: `Avatar.Image`, `Avatar.Fallback`, `Avatar.Initials`,
 * `Avatar.Icon`. The root always exposes the accessible name (`role="img"` + `aria-label`); inner
 * images are decorative.
 *
 * @param props - {@link AvatarProps}
 * @returns The avatar root element wrapping its candidates.
 */
export function Avatar({
  ref,
  className,
  size = 'md',
  children,
  ...rest
}: Readonly<AvatarProps>) {
  // Stable per-avatar config (size) — memoized so the context isn't re-published every render.
  const config = useMemo(() => ({ size }), [size])

  return (
    <div
      ref={ref}
      role="img"
      className={clsx(avatarVariants({ size }), className)}
      {...rest}
    >
      <AvatarConfigContext value={config}>{children}</AvatarConfigContext>
    </div>
  )
}

Avatar.Image = AvatarImage
Avatar.Fallback = AvatarFallback
Avatar.Initials = AvatarInitials
Avatar.Icon = AvatarIcon

export default Avatar
