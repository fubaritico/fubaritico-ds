import clsx from 'clsx'

import { IconButton } from '../IconButton'

import { useDrawerContext } from './DrawerContext'

import type { ComponentProps, FC, ReactNode } from 'react'

/** Props for the Drawer.Header sub-component */
export interface DrawerHeaderProps extends ComponentProps<'div'> {
  children?: ReactNode
}

/**
 * Header area of the Drawer with an integrated close button.
 *
 * Renders children on the left and a close (×) button on the right.
 * Uses design tokens consistent with the current `variant`.
 */
const DrawerHeader: FC<DrawerHeaderProps> = ({
  className,
  children,
  ...rest
}) => {
  const { variant, onClose } = useDrawerContext()
  const isDark = variant === 'dark'

  return (
    <div
      className={clsx(
        'ui:flex ui:items-center ui:justify-between ui:px-4 ui:py-3 ui:border-b',
        isDark ? 'ui:border-neutral-700' : 'ui:border-border',
        className
      )}
      {...rest}
    >
      <div className="ui:flex-1">{children}</div>
      <IconButton
        icon="XMark"
        aria-label="Close"
        size="sm"
        variant={isDark ? 'ghost-dark' : 'ghost'}
        onClick={onClose}
      />
    </div>
  )
}

export default DrawerHeader
