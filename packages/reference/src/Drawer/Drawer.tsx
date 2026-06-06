import clsx from 'clsx'
import { useCallback, useEffect, useRef } from 'react'

import { Portal } from '../Portal'

import DrawerBody from './DrawerBody'
import { DrawerContext } from './DrawerContext'
import DrawerHeader from './DrawerHeader'

import type { DrawerVariant } from './DrawerContext'
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
function Drawer({
  open,
  onClose,
  variant = 'light',
  overlay = false,
  className,
  children,
  ...rest
}: Readonly<DrawerProps>) {
  const isDark = variant === 'dark'
  const wasOpenRef = useRef(false)

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, handleEscape])

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
    } else {
      wasOpenRef.current = false
    }
  }, [open])

  if (!open) return null

  const shouldAnimate = !wasOpenRef.current

  return (
    <Portal>
      <DrawerContext.Provider value={{ variant, onClose }}>
        {overlay && (
          <div
            className="ui:fixed ui:inset-0 ui:z-50 ui:bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
        <div
          role="dialog"
          aria-modal={overlay}
          className={clsx(
            'ui:fixed ui:inset-x-0 ui:bottom-0 ui:z-50',
            'ui:flex ui:flex-col ui:max-h-[60vh]',
            'ui:rounded-t-lg ui:shadow-2xl',
            shouldAnimate && 'ui:animate-slide-up',
            isDark
              ? 'ui:bg-neutral-900 ui:text-neutral-200'
              : 'ui:bg-popover ui:text-popover-foreground',
            className
          )}
          {...rest}
        >
          {children}
        </div>
      </DrawerContext.Provider>
    </Portal>
  )
}

Drawer.Header = DrawerHeader
Drawer.Body = DrawerBody

export default Drawer
