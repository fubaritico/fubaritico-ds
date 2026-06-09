import { Link } from 'react-router-dom'

import { Icon } from '../Icon'

import { buttonClassName, iconSizeMap } from '../Button/Button.shared'

import type { LinkButtonProps } from './LinkButton.types'

/**
 * LinkButton — a react-router `<Link>` wearing the Button skin (a routing adapter around the Button
 * presentational core). Use the plain `Button` when you don't need a link.
 *
 * @param props - {@link LinkButtonProps}
 * @returns The rendered router link styled as a button.
 */
export function LinkButton({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className,
  children,
  ...rest
}: Readonly<LinkButtonProps>) {
  return (
    <Link
      className={buttonClassName({ variant, size, iconPosition, className })}
      {...rest}
    >
      {icon && <Icon name={icon} size={iconSizeMap[size]} />}
      {children}
    </Link>
  )
}

export default LinkButton
