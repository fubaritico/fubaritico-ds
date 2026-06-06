import clsx from 'clsx'
import { useState } from 'react'

import { Icon } from '../Icon'

import type { ComponentProps } from 'react'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

export interface AvatarProps extends Omit<ComponentProps<'img'>, 'src'> {
  /** Image source URL */
  src?: string | null
  /** Alt text for the image */
  alt: string
  /** Size of the avatar */
  size?: AvatarSize
  /** Fallback initials to display when no image */
  initials?: string
  /** For testing purposes */
  testId?: string
}

/**
 * A map defining styles and sizes for different avatar sizes.
 *
 * The `sizeMap` object links predefined avatar size keys to their corresponding
 * stylistic properties, including container dimensions, icon size, and text styles.
 *
 * Each avatar size is represented as a key-value pair, where the key is a string
 * corresponding to the avatar size (e.g., 'xs', 'md', 'xl'), and the value is an
 * object containing the following properties:
 *
 * - `container`: A string representing the CSS classes for the avatar's container dimensions.
 * - `icon`: A number indicating the size of the icon in the avatar (in pixels).
 * - `text`: A string specifying the CSS classes for text size.
 *
 * This map enables consistent and scalable styling for avatars across different sizes.
 */
const sizeMap: Record<
  AvatarSize,
  { container: string; icon: number; text: string }
> = {
  xs: { container: 'ui:h-6 ui:w-6', icon: 12, text: 'ui:text-xs' },
  sm: { container: 'ui:h-8 ui:w-8', icon: 16, text: 'ui:text-sm' },
  md: { container: 'ui:h-10 ui:w-10', icon: 20, text: 'ui:text-base' },
  lg: { container: 'ui:h-12 ui:w-12', icon: 24, text: 'ui:text-lg' },
  xl: { container: 'ui:h-16 ui:w-16', icon: 32, text: 'ui:text-xl' },
  '2xl': { container: 'ui:h-24 ui:w-24', icon: 48, text: 'ui:text-2xl' },
  '3xl': { container: 'ui:h-32 ui:w-32', icon: 64, text: 'ui:text-3xl' },
}

function Avatar({
  className,
  src,
  alt,
  size = 'md',
  initials,
  testId,
  ...rest
}: Readonly<AvatarProps>) {
  const [hasError, setHasError] = useState(false)
  const { container, icon, text } = sizeMap[size]

  const showImage = src && !hasError
  const showInitials = !showImage && initials
  const showFallback = !showImage && !initials

  const handleError = () => {
    setHasError(true)
  }

  return (
    <div
      className={clsx(
        'ui:relative ui:inline-flex ui:items-center ui:justify-center ui:overflow-hidden ui:rounded-full',
        'ui:bg-muted ui:text-muted-foreground',
        container,
        className
      )}
    >
      {showImage && (
        <img
          src={src}
          alt={alt}
          onError={handleError}
          className="ui:h-full ui:w-full ui:object-cover"
          data-testid={testId}
          {...rest}
        />
      )}
      {showInitials && (
        <span className={clsx('ui:font-medium ui:uppercase', text)}>
          {initials.slice(0, 2)}
        </span>
      )}
      {showFallback && (
        <Icon name="User" size={icon as 16 | 20 | 24 | 32 | 48 | 64} />
      )}
    </div>
  )
}

export default Avatar
