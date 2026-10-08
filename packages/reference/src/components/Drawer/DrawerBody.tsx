import clsx from 'clsx'

import { DRAWER_BODY_CLASS } from '@fubaritico-ds/variants'

import type { ComponentProps } from 'react'

/** Props of {@link DrawerBody}. */
export type DrawerBodyProps = ComponentProps<'div'>

/**
 * The Drawer's scrollable content area.
 *
 * Takes the space the header leaves and scrolls on overflow, so the sheet never grows past its
 * maximum height.
 *
 * @param props - {@link DrawerBodyProps}.
 * @returns The rendered body.
 */
export function DrawerBody({
  className,
  children,
  ...rest
}: Readonly<DrawerBodyProps>) {
  return (
    <div className={clsx(DRAWER_BODY_CLASS, className)} {...rest}>
      {children}
    </div>
  )
}

export default DrawerBody
