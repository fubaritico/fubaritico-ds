import clsx from 'clsx'
import { useEffect, useMemo, useRef } from 'react'

import { drawerVariants } from '@fubaritico-ds/variants'

import { DrawerBody } from './DrawerBody'
import { DrawerContext } from './DrawerContext'
import { DrawerFooter } from './DrawerFooter'
import { DrawerHeader } from './DrawerHeader'

import type {
  DrawerSide,
  DrawerSize,
  DrawerVariant,
} from '@fubaritico-ds/variants'
import type { ComponentProps, MouseEvent } from 'react'

export type {
  DrawerSide,
  DrawerSize,
  DrawerVariant,
} from '@fubaritico-ds/variants'

/** Props of the {@link Drawer} root. */
export interface DrawerProps
  extends Omit<ComponentProps<'dialog'>, 'aria-label' | 'open'> {
  /** Whether the panel is shown. */
  open: boolean
  /** Called when the panel should close — the close button, Escape, or a backdrop click. */
  onClose: () => void
  /** Edge the panel is anchored to; defaults to `'start'`. Logical, so it flips in RTL. */
  side?: DrawerSide
  /** Extent across the anchored edge; defaults to `'md'`. */
  size?: DrawerSize
  /** Colour scheme; defaults to `'light'`. */
  variant?: DrawerVariant
  /**
   * Accessible name of the panel — **required**: a `<dialog>` has no implicit name, and the
   * content inside it is the consumer's, so nothing can be inferred.
   */
  'aria-label': string
  /** Called instead of `onClose` on a backdrop click, to opt out of click-outside closing. */
  onOverlayClick?: () => void
}

/**
 * Drawer — an edge-anchored panel built on a native `<dialog>`.
 *
 * Unlike `BottomSheet`, which floats a partial-height card over the page, a Drawer FILLS the edge
 * it is attached to and is genuinely modal: `showModal()` grants the top layer, a focus trap, the
 * inertness of the rest of the page and the Escape key — none of which a portalled `<div>` can
 * provide.
 *
 * Anchoring is logical, so `side="start"` is the left edge in English and the right edge in
 * Arabic; the entrance slide follows.
 *
 * @param props - {@link DrawerProps}.
 * @param props.open - Whether the panel is shown.
 * @param props.onClose - Called on Escape, the close button, or a backdrop click.
 * @param props.side - Anchored edge; defaults to `'start'`.
 * @param props.size - Extent across that edge; defaults to `'md'`.
 * @param props.variant - Colour scheme; defaults to `'light'`.
 * @param props.onOverlayClick - Overrides the backdrop-click behaviour.
 * @returns The rendered drawer.
 */
export function Drawer({
  open,
  onClose,
  side = 'start',
  size = 'md',
  variant = 'light',
  'aria-label': ariaLabel,
  onOverlayClick,
  className,
  children,
  ...rest
}: Readonly<DrawerProps>) {
  const ref = useRef<HTMLDialogElement>(null)

  // Drive the dialog imperatively: `showModal()` is what grants the top layer, the focus trap and
  // the backdrop — the `open` attribute alone gives none of them. The previous body overflow is
  // restored rather than blanked, so a host that set its own keeps it.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    const previousOverflow = document.body.style.overflow

    if (open) {
      dialog.showModal()
      document.body.style.overflow = 'hidden'
    } else {
      dialog.close()
      document.body.style.overflow = previousOverflow
    }

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  // Memoised so the regions do not re-render on every parent render.
  const contextValue = useMemo(() => ({ variant, onClose }), [variant, onClose])

  /**
   * Closes on a click landing on the dialog box itself, i.e. the backdrop area.
   *
   * `e.target` is the dialog only when the click missed the content: clicks inside bubble from a
   * child, so they never match.
   *
   * @param e - The click event on the dialog.
   */
  const handleClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) (onOverlayClick ?? onClose)()
  }

  /** Mirrors the browser's own close event (Escape) back into the consumer's state. */
  const handleClose = () => {
    onClose()
  }

  return (
    <dialog
      ref={ref}
      aria-label={ariaLabel}
      aria-modal="true"
      onClick={handleClick}
      onClose={handleClose}
      className={clsx(drawerVariants({ side, size, variant }), className)}
      {...rest}
    >
      <DrawerContext value={contextValue}>{children}</DrawerContext>
    </dialog>
  )
}

Drawer.Header = DrawerHeader
Drawer.Body = DrawerBody
Drawer.Footer = DrawerFooter

export default Drawer
