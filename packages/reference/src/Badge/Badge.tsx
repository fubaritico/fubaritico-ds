import clsx from 'clsx'

import { Icon } from '../Icon'

import type { IconName } from '../Icon'
import type { ReactNode } from 'react'

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'
export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps {
  /** Badge content */
  children: ReactNode
  /** Visual variant */
  variant?: BadgeVariant
  /** Size */
  size?: BadgeSize
  /** Optional icon (left) */
  icon?: IconName
  /** Custom text color class (overrides variant color) */
  textClassName?: string
  /** Additional class name */
  className?: string
}

const sizeMap: Record<
  BadgeSize,
  { padding: string; text: string; iconSize: 16 }
> = {
  sm: { padding: 'ui:px-2 ui:py-0.5', text: 'ui:text-xs', iconSize: 16 },
  md: { padding: 'ui:px-2.5 ui:py-0.5', text: 'ui:text-sm', iconSize: 16 },
  lg: { padding: 'ui:px-3 ui:py-1', text: 'ui:text-sm', iconSize: 16 },
}

function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  textClassName,
  className,
}: Readonly<BadgeProps>) {
  const { padding, text, iconSize } = sizeMap[size]

  return (
    <span
      className={clsx(
        'ui:inline-flex ui:items-center ui:gap-1 ui:rounded-full ui:font-medium',
        padding,
        text,
        {
          'ui:bg-primary': variant === 'default',
          'ui:text-primary-foreground': variant === 'default' && !textClassName,
          'ui:bg-secondary': variant === 'secondary',
          'ui:text-secondary-foreground':
            variant === 'secondary' && !textClassName,
          'ui:border ui:border-input ui:bg-transparent': variant === 'outline',
          'ui:bg-destructive': variant === 'destructive',
          'ui:text-destructive-foreground':
            variant === 'destructive' && !textClassName,
        },
        textClassName,
        className
      )}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
    </span>
  )
}

export default Badge
