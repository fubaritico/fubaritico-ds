import { AVATAR_ICON_CLASS } from '@fubaritico-ds/variants'

import { Icon } from '../Icon'

import { useAvatarConfig, useResolverCandidate } from './AvatarContext'

import type { IconName, IconSize } from '../Icon'
import type { AvatarSize } from '@fubaritico-ds/variants'

export interface AvatarIconProps {
  /** Icon name (typed → autocompletion; cannot be mistyped). Defaults to `'User'`. */
  name?: IconName
}

/**
 * Fallback-icon pixel size per avatar size. The Icon takes a numeric `size` prop (not a class), so
 * this bridge lives here — it reads the avatar `size` from context and maps it to a valid icon size.
 * `xs` uses 16 (the smallest valid icon size) inside its 1.5rem footprint.
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

/**
 * Infallible terminal candidate. Reads the avatar `size` from the config context, maps it to a pixel
 * icon size, and renders a decorative (`aria-hidden`) heroicon. Always viable — a safe last resort.
 *
 * @param props - {@link AvatarIconProps}
 * @returns The icon when this candidate wins; otherwise nothing.
 */
export function AvatarIcon({ name = 'User' }: Readonly<AvatarIconProps>) {
  // Read the size that trickles down from the root (stable config context) → maps to an icon px size.
  const { size } = useAvatarConfig()
  // Always viable → the infallible terminal candidate; the resolver decides show vs hidden.
  const mode = useResolverCandidate('ready')

  if (mode !== 'show') return null

  return (
    <Icon
      name={name}
      size={AVATAR_ICON_SIZE[size]}
      className={AVATAR_ICON_CLASS}
    />
  )
}

export default AvatarIcon
