'use client'

import NextLink from 'next/link'

import { Icon } from '../Icon'

import { buttonClassName, iconSizeMap } from '../Button/Button.shared'

import type { NextLinkButtonProps } from './NextLinkButton.types'

/**
 * NextLinkButton — a Next.js `<Link>` (or a plain `<a>` for cross-zone navigation) wearing the Button
 * skin (a routing adapter around the Button presentational core). Use the plain `Button` for actions.
 *
 * @param props - {@link NextLinkButtonProps}
 * @returns The rendered next/link (or anchor) styled as a button.
 */
export function NextLinkButton(props: Readonly<NextLinkButtonProps>) {
  const {
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    className,
    children,
  } = props

  const classes = buttonClassName({ variant, size, iconPosition, className })
  const content = (
    <>
      {icon && <Icon name={icon} size={iconSizeMap[size]} />}
      {children}
    </>
  )

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
    ...linkProps
  } = props

  return (
    <NextLink className={classes} {...linkProps}>
      {content}
    </NextLink>
  )
}

export default NextLinkButton
