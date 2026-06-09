import { BADGE_ICON_CLASS, badgeVariants } from '@fubaritico-ds/variants'
import clsx from 'clsx'

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
  className,
  ...rest
}: Readonly<BadgeProps>) {
  return (
    <span
      className={clsx(badgeVariants({ variant, size }), className)}
      {...rest}
    >
      {icon && (
        <Icon name={icon} size={BADGE_ICON_SIZE} className={BADGE_ICON_CLASS} />
      )}
      {children}
    </span>
  )
}

export default Badge
