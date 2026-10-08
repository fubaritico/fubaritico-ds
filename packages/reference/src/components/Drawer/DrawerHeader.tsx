import clsx from 'clsx'

import { DRAWER_HEADER_CLASS, DRAWER_TITLE_CLASS } from '@fubaritico-ds/variants'

import { IconButton } from '../IconButton'

import { useDrawerContext } from './DrawerContext'

import type { ComponentProps } from 'react'

/** Props of {@link DrawerHeader}. */
export interface DrawerHeaderProps extends ComponentProps<'div'> {
  /** Accessible name of the close button; defaults to `'Close'`. */
  closeLabel?: string
}

/**
 * The Drawer's title bar, with the close button built in.
 *
 * Children fill the inline-start side; the close control stays pinned to the inline-end edge and
 * switches to the on-dark button variant when the panel is dark.
 *
 * Must be rendered inside a `<Drawer>`.
 *
 * @param props - {@link DrawerHeaderProps}.
 * @param props.closeLabel - Accessible name of the close button.
 * @returns The rendered header.
 */
export function DrawerHeader({
  closeLabel = 'Close',
  className,
  children,
  ...rest
}: Readonly<DrawerHeaderProps>) {
  // The colour scheme picks the close button's variant; the handler is the panel's own.
  const { variant, onClose } = useDrawerContext()

  return (
    <div className={clsx(DRAWER_HEADER_CLASS, className)} {...rest}>
      <div className={DRAWER_TITLE_CLASS}>{children}</div>
      <IconButton
        icon="XMark"
        aria-label={closeLabel}
        size="sm"
        variant={variant === 'dark' ? 'ghost-dark' : 'ghost'}
        onClick={onClose}
      />
    </div>
  )
}

export default DrawerHeader
