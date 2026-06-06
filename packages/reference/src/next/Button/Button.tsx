import Link from 'next/link'

import {
  getButtonClasses,
  getButtonDisabledClasses,
  iconSizeMap,
} from '../../Button/Button.utils'
import { Icon } from '../../Icon'

import type { NextButtonProps } from './Button.types'

function Button(props: Readonly<NextButtonProps>) {
  const {
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    className,
    children,
  } = props

  const classes = getButtonClasses({ variant, size, iconPosition, className })

  const content = (
    <>
      {icon && <Icon name={icon} size={iconSizeMap[size]} />}
      {children}
    </>
  )

  if (props.as === 'link') {
    const {
      as: _,
      variant: _v,
      size: _s,
      icon: _i,
      iconPosition: _ip,
      className: _c,
      children: _ch,
      ...linkProps
    } = props

    return (
      <Link className={classes} {...linkProps}>
        {content}
      </Link>
    )
  }

  if (props.as === 'zone-link') {
    const {
      as: _,
      variant: _v,
      size: _s,
      icon: _i,
      iconPosition: _ip,
      className: _c,
      children: _ch,
      ...anchorProps
    } = props

    return (
      <a className={classes} {...anchorProps}>
        {content}
      </a>
    )
  }

  const {
    as: _,
    variant: _v,
    size: _s,
    icon: _i,
    iconPosition: _ip,
    className: _c,
    children: _ch,
    ...buttonProps
  } = props

  return (
    <button className={getButtonDisabledClasses(classes)} {...buttonProps}>
      {content}
    </button>
  )
}

export default Button
