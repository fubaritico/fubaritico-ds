import clsx from 'clsx'

import type { HTMLAttributes } from 'react'

export type CardVariant = 'default' | 'outline' | 'elevated' | 'ghost'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant of the card */
  variant?: CardVariant
}

const variantStyles: Record<CardVariant, string> = {
  default:
    'ui:rounded-md ui:p-4 ui:bg-card ui:text-card-foreground ui:shadow-md',
  outline: 'ui:rounded-md ui:p-4 ui:border ui:border-border ui:bg-transparent',
  elevated:
    'ui:rounded-lg ui:p-6 ui:bg-card ui:text-card-foreground ui:shadow-lg',
  ghost: 'ui:rounded-md',
}

function Card({
  className,
  variant = 'default',
  children,
  ...rest
}: Readonly<CardProps>) {
  return (
    <div className={clsx(variantStyles[variant], className)} {...rest}>
      {children}
    </div>
  )
}

export default Card
