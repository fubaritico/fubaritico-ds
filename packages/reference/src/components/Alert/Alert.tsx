import clsx from 'clsx'

import {
  ALERT_CONTENT_CLASS,
  ALERT_DESCRIPTION_CLASS,
  ALERT_DISMISS_CLASS,
  ALERT_ICON_CLASS,
  ALERT_TITLE_CLASS,
  alertVariants,
} from '@fubaritico-ds/variants'

import { Icon } from '../Icon'
import { IconButton } from '../IconButton'

import type { AlertVariant } from '@fubaritico-ds/variants'
import type { ComponentProps, ReactNode } from 'react'

export type { AlertVariant } from '@fubaritico-ds/variants'

/** Pixel size of the leading intent glyph. */
const ICON_SIZE = 20

/**
 * Glyph per intent.
 *
 * The icon differs for every intent, so the meaning is carried by SHAPE as well as colour — an
 * alert must stay readable to someone who cannot distinguish the hues (WCAG 1.4.1).
 */
const VARIANT_ICON: Record<AlertVariant, ComponentProps<typeof Icon>['name']> =
  {
    info: 'InformationCircle',
    success: 'Check',
    warning: 'ExclamationTriangle',
    error: 'ExclamationCircle',
  }

/**
 * Live-region politeness per intent.
 *
 * `alert` interrupts the screen-reader user, which is right for a problem and rude for a
 * confirmation; `status` waits for a pause. Override with the `role` prop when the alert is
 * rendered statically on load rather than in response to an action.
 */
const VARIANT_ROLE: Record<AlertVariant, 'alert' | 'status'> = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  error: 'alert',
}

/** Props of the {@link Alert}. */
export interface AlertProps extends Omit<ComponentProps<'div'>, 'title'> {
  /** Message intent; defaults to `'info'` (neutral). */
  variant?: AlertVariant
  /**
   * Optional heading above the message.
   *
   * Repurposes the native `title` attribute (a plain-string tooltip), which is omitted: a tooltip
   * duplicating the alert's own text would be noise, and the heading needs to accept nodes.
   */
  title?: ReactNode
  /** Replaces the intent glyph; pass `null` to drop it entirely. */
  icon?: ReactNode
  /** Shows a dismiss button and is called when it is pressed. */
  onDismiss?: () => void
  /** Accessible name of the dismiss button; defaults to `'Dismiss'`. */
  dismissLabel?: string
  /** The message. */
  children?: ReactNode
}

/**
 * Alert — a standing message block with an intent glyph and an optional dismiss control.
 *
 * Presentational and stateless: dismissing calls `onDismiss`, it does not remove itself. The intent
 * colours the border and the glyph only, never the surface, so the text keeps full contrast.
 *
 * The live-region politeness follows the intent (`error` / `warning` interrupt, `info` / `success`
 * wait) and can be overridden with `role`.
 *
 * @param props - {@link AlertProps}.
 * @param props.variant - Message intent; defaults to `'info'`.
 * @param props.title - Optional heading.
 * @param props.icon - Custom glyph, or `null` for none.
 * @param props.onDismiss - Enables and handles the dismiss button.
 * @param props.dismissLabel - Accessible name of that button.
 * @returns The rendered alert.
 */
export function Alert({
  variant = 'info',
  title,
  icon,
  onDismiss,
  dismissLabel = 'Dismiss',
  className,
  children,
  role,
  ...rest
}: Readonly<AlertProps>) {
  // `icon === undefined` means "no opinion" → use the intent default; `null` means "no glyph".
  const glyph =
    icon === undefined ? (
      <Icon name={VARIANT_ICON[variant]} size={ICON_SIZE} aria-hidden="true" />
    ) : (
      icon
    )

  return (
    <div
      role={role ?? VARIANT_ROLE[variant]}
      className={clsx(alertVariants({ variant }), className)}
      {...rest}
    >
      {glyph ? <span className={ALERT_ICON_CLASS}>{glyph}</span> : null}

      <div className={ALERT_CONTENT_CLASS}>
        {title ? <span className={ALERT_TITLE_CLASS}>{title}</span> : null}
        {children ? (
          <span className={ALERT_DESCRIPTION_CLASS}>{children}</span>
        ) : null}
      </div>

      {onDismiss ? (
        <IconButton
          icon="XMark"
          size="sm"
          variant="ghost"
          aria-label={dismissLabel}
          className={ALERT_DISMISS_CLASS}
          onClick={onDismiss}
        />
      ) : null}
    </div>
  )
}

export default Alert
