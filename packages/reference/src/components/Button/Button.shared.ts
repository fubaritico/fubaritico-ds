import clsx from 'clsx'

import { buttonVariants } from '@fubaritico-ds/variants'

import type { IconName } from '../Icon'
import type {
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@fubaritico-ds/variants'

/** Presentational props shared by every Button-family component (plain, link, next-link). */
export interface ButtonVisualProps {
  /** Visual variant. */
  variant?: ButtonVariant
  /** Size. */
  size?: ButtonSize
  /** Optional leading/trailing icon. */
  icon?: IconName
  /** Icon side relative to the label (the side flip is handled by the skin). */
  iconPosition?: ButtonIconPosition
}

/** Pixel size of the optional Button icon, per size — kept in sync with the skin's font sizes. */
export const iconSizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
} as const

/**
 * Resolves the Button skin classes (variant/size/icon-position) merged with a consumer className.
 *
 * @param props - Visual props plus an optional consumer `className`.
 * @param props.variant - Visual variant.
 * @param props.size - Button size.
 * @param props.iconPosition - Icon side.
 * @param props.className - Extra class names to merge.
 * @returns The space-separated BEM class string.
 */
export function buttonClassName({
  variant,
  size,
  iconPosition,
  className,
}: ButtonVisualProps & { className?: string }): string {
  return clsx(buttonVariants({ variant, size, iconPosition }), className)
}
