import type { IconName } from '../../Icon'
import type { ButtonHTMLAttributes } from 'react'
import type { LinkProps } from 'react-router-dom'

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

export type ButtonAsButton = ButtonVisualProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button' | undefined
  }

export type ButtonAsLink = ButtonVisualProps &
  LinkProps & {
    as: 'link'
  }

export type ButtonProps = ButtonAsButton | ButtonAsLink
