import clsx from 'clsx'

import type { ComponentProps, FC, ReactNode } from 'react'

/** Props for the Drawer.Body sub-component */
export interface DrawerBodyProps extends ComponentProps<'div'> {
  children?: ReactNode
}

/**
 * Scrollable content area of the Drawer.
 *
 * Fills remaining vertical space and scrolls when content overflows.
 * Uses flex-col layout so children stack vertically.
 */
const DrawerBody: FC<DrawerBodyProps> = ({ className, children, ...rest }) => {
  return (
    <div
      className={clsx(
        'ui:flex ui:flex-1 ui:flex-col ui:overflow-y-auto ui:px-4 ui:py-3',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export default DrawerBody
