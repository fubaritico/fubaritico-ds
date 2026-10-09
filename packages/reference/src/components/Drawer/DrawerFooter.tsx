import clsx from 'clsx'

import { DRAWER_FOOTER_CLASS } from '@fubaritico/variants'

import type { ComponentProps } from 'react'

/** Props of {@link DrawerFooter}. */
export type DrawerFooterProps = ComponentProps<'div'>

/**
 * The Drawer's trailing action bar — a pinned row for the panel's buttons.
 *
 * Sits below the scrollable body, so the actions stay reachable however long the content is.
 *
 * @param props - {@link DrawerFooterProps}.
 * @returns The rendered footer.
 */
export function DrawerFooter({
  className,
  children,
  ...rest
}: Readonly<DrawerFooterProps>) {
  return (
    <div className={clsx(DRAWER_FOOTER_CLASS, className)} {...rest}>
      {children}
    </div>
  )
}

export default DrawerFooter
