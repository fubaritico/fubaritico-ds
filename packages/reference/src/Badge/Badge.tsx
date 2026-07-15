import clsx from 'clsx'

import {
  BADGE_ICON_CLASS,
  BADGE_LABEL_CLASS,
  badgeVariants,
} from '@fubaritico-ds/variants'

import { Icon } from '../Icon'

import type { IconName } from '../Icon'
import type { BadgeSize, BadgeVariant } from '@fubaritico-ds/variants'
import type { ComponentProps } from 'react'

export type { BadgeSize, BadgeVariant }

/** Leading-icon size, in pixels. */
const BADGE_ICON_SIZE = 16

export interface BadgeProps extends ComponentProps<'span'> {
  /** Visual variant. */
  variant?: BadgeVariant
  /** Size. */
  size?: BadgeSize
  /** Optional leading icon. Decorative (aria-hidden); `children` must convey the meaning in text. */
  icon?: IconName
  /**
   * When `true`, caps the badge to its container width and ellipsis-truncates the label (the leading
   * icon stays visible). Use in tight layouts (e.g. a fixed-width table column). The full text stays
   * in the DOM (announced by screen readers). Defaults to `false` (the badge sizes to its content).
   */
  canTruncate?: boolean
}

/**
 * Badge — native BEM skin (`@fubaritico-ds/styles`). Variant/size resolve to BEM classes via
 * {@link badgeVariants}; colours and paddings are driven by the overridable `--ui-badge-*`
 * component variables. Forwards any extra `span` attributes (`id`, `aria-*`, `onClick`, …).
 *
 * @param props - {@link BadgeProps}
 * @returns The rendered badge element.
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  canTruncate = false,
  className,
  ...rest
}: Readonly<BadgeProps>) {
  return (
    <span
      className={clsx(badgeVariants({ variant, size, canTruncate }), className)}
      {...rest}
    >
      {icon ? (
        <Icon name={icon} size={BADGE_ICON_SIZE} className={BADGE_ICON_CLASS} />
      ) : null}
      {canTruncate ? (
        <span className={BADGE_LABEL_CLASS}>{children}</span>
      ) : (
        children
      )}
    </span>
  )
}

export default Badge
