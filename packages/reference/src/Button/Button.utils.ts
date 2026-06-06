import clsx from 'clsx'

import type { IconName } from '../Icon'
import type { ReactNode } from 'react'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export const iconSizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
} as const

export interface ButtonVisualInput {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: IconName
  iconPosition?: 'left' | 'right'
  className?: string
  children?: ReactNode
}

export function getButtonClasses({
  variant = 'primary',
  size = 'md',
  iconPosition = 'left',
  className,
}: ButtonVisualInput) {
  return clsx(
    'ui:inline-flex ui:items-center ui:justify-center ui:cursor-pointer ui:gap-2 ui:font-roboto ui:font-medium ui:transition-colors',
    'ui:rounded ui:border ui:border-transparent',
    'ui:focus:outline-none ui:focus:ring-2 ui:focus:ring-ring ui:focus:ring-offset-2',
    {
      'ui:flex-row': iconPosition === 'left',
      'ui:flex-row-reverse': iconPosition === 'right',
    },
    {
      'ui:bg-primary ui:text-primary-foreground ui:hover:bg-primary/90':
        variant === 'primary',
      'ui:bg-secondary ui:text-secondary-foreground ui:hover:bg-secondary/80':
        variant === 'secondary',
      'ui:bg-destructive ui:text-destructive-foreground ui:hover:bg-destructive/90':
        variant === 'destructive',
      'ui:border-input ui:bg-background ui:hover:bg-accent ui:hover:text-accent-foreground':
        variant === 'outline',
      'ui:hover:bg-accent ui:hover:text-accent-foreground': variant === 'ghost',
    },
    {
      'ui:h-8 ui:px-3 ui:text-sm': size === 'sm',
      'ui:h-10 ui:px-4 ui:text-base': size === 'md',
      'ui:h-12 ui:px-6 ui:text-lg': size === 'lg',
    },
    className
  )
}

export function getButtonDisabledClasses(classes: string) {
  return clsx(classes, 'ui:disabled:pointer-events-none ui:disabled:opacity-50')
}
