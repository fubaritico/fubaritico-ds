import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { BOTTOM_SHEET_OVERLAY_CLASS, bottomSheetVariants } from '@fubaritico-ds/variants'

import { Portal } from '../Portal'

import { BottomSheetBody } from './BottomSheetBody'
import { BottomSheetContext } from './BottomSheetContext'
import { BottomSheetHeader } from './BottomSheetHeader'

import type { BottomSheetVariant } from '@fubaritico-ds/variants'
import type { ComponentProps, ReactNode } from 'react'

/** Props for the BottomSheet root component */
export interface BottomSheetProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Whether the bottom-sheet is visible */
  open: boolean
  /** Called when the bottom-sheet should close (close button, Escape, overlay click) */
  onClose: () => void
  /** Color scheme matching Menu/Listbox conventions */
  variant?: BottomSheetVariant
  /** Show a backdrop overlay behind the bottom-sheet (default: false) */
  overlay?: boolean
  /** Compound children: BottomSheet.Header, BottomSheet.Body */
  children: ReactNode
}

/**
 * BottomSheet compound component — bottom sheet panel rendered in a Portal.
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
 * <BottomSheet open={isOpen} onClose={close} variant="dark">
 *   <BottomSheet.Header>Results</BottomSheet.Header>
 *   <BottomSheet.Body>{children}</BottomSheet.Body>
 * </BottomSheet>
 * ```
 */
export function BottomSheet({
  open,
  onClose,
  variant = 'light',
  overlay = false,
  className,
  children,
  ...rest
}: Readonly<BottomSheetProps>) {
  const wasOpenRef = useRef(false)

  // The panel node, so a click can be tested as inside or outside it.
  const panelRef = useRef<HTMLDivElement>(null)

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

  // Dismiss on a click outside the panel. With an overlay the scrim catches it; WITHOUT one there
  // is nothing to click, so the sheet would otherwise be closable by Escape alone — a dead end for
  // a touch-only user. `mousedown` rather than `click`, so a press that began inside the panel and
  // released outside does not dismiss it.
  useEffect(() => {
    if (!open || overlay) return

    const handlePointerDown = (e: globalThis.MouseEvent) => {
      const panel = panelRef.current
      if (panel && !panel.contains(e.target as Node)) onClose()
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [open, overlay, onClose])

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
      <BottomSheetContext value={contextValue}>
        {overlay ? (
          <div
            className={BOTTOM_SHEET_OVERLAY_CLASS}
            onClick={onClose}
            aria-hidden="true"
          />
        ) : null}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal={overlay}
          className={clsx(
            bottomSheetVariants({ variant, animated: shouldAnimate }),
            className
          )}
          {...rest}
        >
          {children}
        </div>
      </BottomSheetContext>
    </Portal>
  )
}

BottomSheet.Header = BottomSheetHeader
BottomSheet.Body = BottomSheetBody

export default BottomSheet
