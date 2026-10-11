import clsx from 'clsx'
import { useEffect, useEffectEvent, useMemo } from 'react'

import { bottomSheetVariants } from '@fubaritico/variants'

import { useNativeDialog } from '../../hooks'

import { BottomSheetBody } from './BottomSheetBody'
import { BottomSheetContext } from './BottomSheetContext'
import { BottomSheetHeader } from './BottomSheetHeader'

import type { BottomSheetVariant } from '@fubaritico/variants'
import type { ComponentProps, MouseEvent, ReactNode } from 'react'

/** Props for the BottomSheet root component */
export interface BottomSheetProps
  extends Omit<
    ComponentProps<'dialog'>,
    'children' | 'open' | 'popover' | 'aria-label'
  > {
  /** Accessible name of the sheet — a `<dialog>` has none of its own. **Required.** */
  'aria-label': string
  /** Whether the bottom-sheet is visible */
  open: boolean
  /** Called when the bottom-sheet should close (close button, Escape, a click outside) */
  onClose: () => void
  /** Color scheme matching Menu/Listbox conventions */
  variant?: BottomSheetVariant
  /**
   * Make the sheet MODAL, with a dimmed backdrop (default: false): focus is trapped in it and the
   * rest of the page is inert until it closes. Without it the page stays usable behind the sheet.
   */
  overlay?: boolean
  /** Compound children: BottomSheet.Header, BottomSheet.Body */
  children: ReactNode
}

/**
 * Whether an event belongs to ANOTHER top-layer surface opened above the sheet (a Modal opened
 * from it, a menu, a popover) — that layer owns the press or the Escape, not the sheet. A layer
 * that CONTAINS the sheet (the Modal it was opened from) does not count.
 *
 * @param target - The event target.
 * @param panel - The sheet's `<dialog>`, if mounted.
 * @returns `true` when the target sits in a dialog / popover that is neither the sheet nor one of
 *   its ancestors.
 */
function inOtherLayer(target: Node, panel: HTMLDialogElement | null) {
  const element = target instanceof Element ? target : target.parentElement
  const layer = element?.closest('dialog[open], [popover]')
  return !!layer && !!panel && layer !== panel && !layer.contains(panel)
}

/**
 * BottomSheet compound component — a panel pinned to the bottom edge, in the browser's top layer.
 *
 * A native `<dialog>` rendered in place. With `overlay` it is opened with `showModal()`: a real
 * modal — focus trapped, the page inert, a `::backdrop`, Escape from the browser. Without it, it
 * is a `popover="manual"`: on top of everything, the page still usable. Either way it is above every
 * `z-index` and — unlike a portal — usable inside a `Modal` it is opened from. Slides up on first
 * open, then stays in place while content updates. Closes via the close button, Escape, or a click
 * outside it (the backdrop when `overlay` is on).
 *
 * Uses the same `variant` convention as Menu and Listbox (`light`/`dark`)
 * with colors derived from design tokens.
 *
 * @example
 * ```tsx
 * <BottomSheet open={isOpen} onClose={close} variant="dark" aria-label="Results">
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
  'aria-label': ariaLabel,
  className,
  children,
  ref: forwardedRef,
  onClick,
  ...rest
}: Readonly<BottomSheetProps>) {
  // The dialog lifecycle shared with Modal and Drawer: showModal() with `overlay`, a non-modal
  // showPopover() without. The dialog IS the panel, so the backdrop is everything outside its box.
  const { ref, dialogRef, handleClick, handleClose } = useNativeDialog({
    open,
    onClose,
    forwardedRef,
    backdropArea: 'outside',
    modal: overlay,
  })

  // Read at event time, so the listeners below need not re-subscribe when the callback changes.
  const requestClose = useEffectEvent(() => {
    onClose()
  })

  // Non-modal only — a manual popover has neither Escape nor light dismiss of its own, and the
  // backdrop does both for the modal sheet. Document-level, because focus may be anywhere on the
  // still-usable page. Escape is consumed, so a surrounding `Modal` does not close too. A press
  // outside closes it too — without it the sheet would be closable by Escape alone, a dead end for
  // a touch-only user; `mousedown`, so a press begun inside and released outside does not.
  useEffect(() => {
    if (!open || overlay) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      if (e.target instanceof Node && inOtherLayer(e.target, dialogRef.current))
        return
      e.preventDefault()
      requestClose()
    }
    const handlePointerDown = (e: globalThis.MouseEvent) => {
      const target = e.target
      if (!(target instanceof Node)) return
      const panel = dialogRef.current
      if (panel?.contains(target) || inOtherLayer(target, panel)) return
      requestClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [open, overlay, dialogRef])

  // Memoised so the two regions do not re-render on every parent render.
  const contextValue = useMemo(() => ({ variant, onClose }), [variant, onClose])

  if (!open) return null

  return (
    <dialog
      {...rest}
      // A new element per mode: the `popover` attribute must never be toggled on a shown dialog
      // (removing it hides the popover, and hiding a non-popover then throws).
      key={overlay ? 'modal' : 'popover'}
      ref={ref}
      aria-label={ariaLabel}
      popover={overlay ? undefined : 'manual'}
      aria-modal={overlay ? true : undefined}
      // The consumer's handler first; a prevented click does not close the modal sheet.
      onClick={(e: MouseEvent<HTMLDialogElement>) => {
        onClick?.(e)
        if (overlay && !e.defaultPrevented) handleClick(e)
      }}
      onClose={handleClose}
      // Mounted fresh on every open, so the entrance slide plays once per opening and never
      // replays while the content updates.
      className={clsx(
        bottomSheetVariants({ variant, animated: true }),
        className
      )}
    >
      <BottomSheetContext value={contextValue}>{children}</BottomSheetContext>
    </dialog>
  )
}

BottomSheet.Header = BottomSheetHeader
BottomSheet.Body = BottomSheetBody

export default BottomSheet
