import type { IconName } from '../../Icon'
import type { LinkProps } from 'next/link'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonVisualProps {
  /** Visual variant of the button */
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg'
  /** Icon name to display */
  icon?: IconName
  /** Icon position relative to children */
  iconPosition?: 'left' | 'right'
}

export type NextButtonAsButton = ButtonVisualProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button' | undefined
  }

export type NextButtonAsLink = ButtonVisualProps &
  Omit<LinkProps, 'as'> & {
    as: 'link'
    className?: string
    children?: React.ReactNode
  }

export type NextButtonAsZoneLink = ButtonVisualProps & {
  /** Render as a plain anchor for cross-zone navigation (multi-zones). */
  as: 'zone-link'
  /** Navigation URL */
  href: string
  className?: string
  children?: React.ReactNode
}

export type NextButtonProps =
  | NextButtonAsButton
  | NextButtonAsLink
  | NextButtonAsZoneLink
