import { Icon } from '../Icon'

import { buttonClassName, iconSizeMap } from './Button.shared'

import type { ButtonProps } from './Button.types'

/**
 * Button — the design-system plain `<button>` wearing the native skin. The primitive: zero
 * routing/data coupling. Variant/size resolve to BEM classes via `@fubaritico-ds/variants`;
 * disabled/focus are handled by the skin (`:disabled`, `:focus-visible`).
 *
 * @param props - {@link ButtonProps}
 * @returns The rendered button element.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className,
  children,
  ...rest
}: Readonly<ButtonProps>) {
  return (
    <button
      className={buttonClassName({ variant, size, iconPosition, className })}
      {...rest}
    >
      {icon && <Icon name={icon} size={iconSizeMap[size]} />}
      {children}
    </button>
  )
}

export default Button
