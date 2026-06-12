import clsx from 'clsx'

import { iconButtonVariants } from '@fubaritico-ds/variants'

import { Button } from '../Button'

import type { ButtonProps } from '../Button'
import type { IconName } from '../Icon'
import type { ButtonVariant } from '@fubaritico-ds/variants'

/**
 * Props for {@link IconButton} — Button's props minus the label-oriented ones, with an icon
 * made required and the on-dark `ghost-dark` variant added.
 */
export interface IconButtonProps
  extends Omit<ButtonProps, 'variant' | 'icon' | 'iconPosition' | 'children'> {
  /** Icon to render, centered inside the circular button (required — IconButton is icon-only). */
  icon: IconName
  /**
   * Visual variant. Reuses every Button variant plus the IconButton-only on-dark `ghost-dark`.
   * Defaults to `'ghost'`.
   */
  variant?: ButtonVariant | 'ghost-dark'
  /**
   * Accessible label — required: the icon is decorative (`aria-hidden`), so the button's
   * accessible name comes solely from here.
   */
  'aria-label': string
}

/**
 * IconButton — a circular, icon-only **extension of {@link Button}** (Open/Closed): it renders a
 * `Button` (reusing its variants, hover, focus, disabled and the icon-size map) and layers on the
 * icon-fitting shape via `@fubaritico-ds/variants` (`.ui-icon-button`). The IconButton-only
 * `ghost-dark` on-dark variant redefines the reused `--ui-button-*` vars; Button is never modified.
 *
 * @param props - {@link IconButtonProps}
 * @returns The rendered circular icon button.
 */
export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  className,
  ...rest
}: Readonly<IconButtonProps>) {
  return (
    <Button
      icon={icon}
      size={size}
      // Button stays closed: ghost-dark is not in its API, so we drop the variant prop and let the
      // ghost-dark shape class redefine the colour vars on top of Button's (primary) base.
      variant={variant === 'ghost-dark' ? undefined : variant}
      className={clsx(
        iconButtonVariants({ size, ghostDark: variant === 'ghost-dark' }),
        className
      )}
      {...rest}
    />
  )
}

export default IconButton
