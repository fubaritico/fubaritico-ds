import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { DRAWER_OVERLAY_CLASS, drawerVariants } from '@fubaritico-ds/variants'

import { Portal } from '../Portal'

import { DrawerBody } from './DrawerBody'
import { DrawerContext } from './DrawerContext'
import { DrawerHeader } from './DrawerHeader'

import type { DrawerVariant } from '@fubaritico-ds/variants'
import type { ComponentProps, ReactNode } from 'react'

/** Props for the Drawer root component */
export interface DrawerProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Whether the drawer is visible */
  open: boolean
  /** Called when the drawer should close (close button, Escape, overlay click) */
  onClose: () => void
  /** Color scheme matching Menu/Listbox conventions */
  variant?: DrawerVariant
  /** Show a backdrop overlay behind the drawer (default: false) */
  overlay?: boolean
  /** Compound children: Drawer.Header, Drawer.Body */
  children: ReactNode
}

/**
 * Drawer compound component — bottom sheet panel rendered in a Portal.
 *
 * Slides up from the bottom of the viewport on first open, then stays
 * in place while content updates. Closes via the close button, Escape
 * key, or overlay click (when `overlay` is enabled).
 *
 * Uses the same `variant` convention as Menu and Listbox (`light`/`dark`)
 * with colors derived from design tokens.
 *
 * @example
 * ```tsx
 * <Drawer open={isOpen} onClose={close} variant="dark">
 *   <Drawer.Header>Results</Drawer.Header>
 *   <Drawer.Body>{children}</Drawer.Body>
 * </Drawer>
 * ```
 */
export function Drawer({
  open,
  onClose,
  variant = 'light',
  overlay = false,
  className,
  children,
  ...rest
}: Readonly<DrawerProps>) {
  const wasOpenRef = useRef(false)

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  // Escape closes the sheet. The listener is document-level because the panel is portalled and
  // may not hold focus, so a key handler on the element itself would miss.
  useEffect(() => {
    if (!open) return

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, handleEscape])

  // Remember that the sheet has been shown, so the entrance slide plays on the FIRST open only and
  // a content update inside an open sheet does not replay it.
  useEffect(() => {
    wasOpenRef.current = open
  }, [open])

  // Memoised so the two regions do not re-render on every parent render.
  const contextValue = useMemo(() => ({ variant, onClose }), [variant, onClose])

  if (!open) return null

  const shouldAnimate = !wasOpenRef.current

  return (
    <Portal>
      <DrawerContext value={contextValue}>
        {overlay ? (
          <div
            className={DRAWER_OVERLAY_CLASS}
            onClick={onClose}
            aria-hidden="true"
          />
        ) : null}
        <div
          role="dialog"
          aria-modal={overlay}
          className={clsx(
            drawerVariants({ variant, animated: shouldAnimate }),
            className
          )}
          {...rest}
        >
          {children}
        </div>
      </DrawerContext>
    </Portal>
  )
}

Drawer.Header = DrawerHeader
Drawer.Body = DrawerBody

export default Drawer
