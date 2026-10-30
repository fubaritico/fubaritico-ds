import clsx from 'clsx'

import {
  BADGE_ICON_CLASS,
  BADGE_LABEL_CLASS,
  BADGE_REMOVE_CLASS,
  badgeVariants,
} from '@fubaritico/variants'

import { Icon } from '../Icon'
import { TruncatedText } from '../TruncatedText'

import type { IconName } from '../Icon'
import type { BadgeSize, BadgeVariant } from '@fubaritico/variants'
import type { ComponentProps, MouseEvent } from 'react'

export type { BadgeSize, BadgeVariant }

/** Leading-icon size, in pixels. */
const BADGE_ICON_SIZE = 16

/** Remove-glyph size, in pixels (the hit area around it is 24px — WCAG 2.5.8). */
const BADGE_REMOVE_ICON_SIZE = 16

/** Props every Badge takes, removable or not. */
export interface BadgeBaseProps extends ComponentProps<'span'> {
  /** Visual variant. */
  variant?: BadgeVariant
  /** Size. */
  size?: BadgeSize
  /** Optional leading icon. Decorative (aria-hidden); `children` must convey the meaning in text. */
  icon?: IconName
  /**
   * When `true`, caps the badge to its container width and ellipsis-truncates the label (the leading
   * icon stays visible). Use in tight layouts (e.g. a fixed-width table column). The full text stays
   * in the DOM (announced by screen readers); a string or number label, once actually cut, is also revealed in
   * a tooltip on hover or keyboard focus. Defaults to `false` (the badge sizes to its content).
   */
  canTruncate?: boolean
}

/** A removable badge: a remove button at its inline end, which needs an accessible name. */
export interface RemovableBadgeProps {
  /** Called when the remove button is pressed (click, Enter or Space). Renders the button. */
  onRemove: (event: MouseEvent<HTMLButtonElement>) => void
  /** Accessible name of the remove button, e.g. `Remove Port` — the glyph alone says nothing. */
  removeLabel: string
  /** Extra attributes of the remove button (`ref`, `disabled`, `aria-*`…). */
  removeButtonProps?: Omit<
    ComponentProps<'button'>,
    'onClick' | 'children' | 'aria-label'
  >
}

/** A badge with no remove button. */
export interface StaticBadgeProps {
  /** Not removable. */
  onRemove?: undefined
  /** Only with `onRemove`. */
  removeLabel?: undefined
  /** Only with `onRemove`. */
  removeButtonProps?: undefined
}

/** Props of the {@link Badge}: removable (`onRemove` + `removeLabel`) or not. */
export type BadgeProps = BadgeBaseProps &
  (RemovableBadgeProps | StaticBadgeProps)

/**
 * Badge — native BEM skin (`@fubaritico/styles`). Variant/size resolve to BEM classes via
 * {@link badgeVariants}; colours and paddings are driven by the overridable `--ui-badge-*`
 * component variables. Forwards any extra `span` attributes (`id`, `aria-*`, `onClick`, …).
 *
 * With `onRemove` it becomes removable: a native `<button>` at its inline end, named by
 * `removeLabel`, with a 24px hit area. The badge itself stays a plain `<span>`.
 *
 * @param props - {@link BadgeProps}
 * @returns The rendered badge element.
 * @throws If `onRemove` is given without a `removeLabel` (an unnamed button).
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  canTruncate = false,
  className,
  onRemove,
  removeLabel,
  removeButtonProps,
  ...rest
}: Readonly<BadgeProps>) {
  // The type requires the label; plain JavaScript can still forget it, and an unnamed button is a
  // broken contract, not a degraded mode.
  if (onRemove && !removeLabel) {
    throw new Error('Badge: `onRemove` needs a `removeLabel` (the button name)')
  }

  return (
    <span
      className={clsx(badgeVariants({ variant, size, canTruncate }), className)}
      {...rest}
    >
      {icon ? (
        <Icon name={icon} size={BADGE_ICON_SIZE} className={BADGE_ICON_CLASS} />
      ) : null}
      {canTruncate ? (
        typeof children === 'string' || typeof children === 'number' ? (
          // Measured: a tooltip and a tab stop only once the label is really cut.
          <TruncatedText className={BADGE_LABEL_CLASS}>
            {String(children)}
          </TruncatedText>
        ) : (
          // Rich content cannot be repeated in the bubble: visual clip only.
          <span className={BADGE_LABEL_CLASS}>{children}</span>
        )
      ) : (
        children
      )}
      {onRemove ? (
        <button
          type="button"
          {...removeButtonProps}
          className={clsx(BADGE_REMOVE_CLASS, removeButtonProps?.className)}
          aria-label={removeLabel}
          onClick={onRemove}
        >
          <Icon name="XMark" size={BADGE_REMOVE_ICON_SIZE} />
        </button>
      ) : null}
    </span>
  )
}

export default Badge
