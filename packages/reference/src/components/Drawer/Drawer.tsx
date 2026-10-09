import clsx from 'clsx'
import { useMemo } from 'react'

import { drawerVariants } from '@fubaritico/variants'

import { useNativeDialog } from '../../hooks'

import { DrawerBody } from './DrawerBody'
import { DrawerContext } from './DrawerContext'
import { DrawerFooter } from './DrawerFooter'
import { DrawerHeader } from './DrawerHeader'

import type {
  DrawerSide,
  DrawerSize,
  DrawerVariant,
} from '@fubaritico/variants'
import type { ComponentProps } from 'react'

export type {
  DrawerSide,
  DrawerSize,
  DrawerVariant,
} from '@fubaritico/variants'

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
  ref: forwardedRef,
  ...rest
}: Readonly<DrawerProps>) {
  // The whole native-dialog lifecycle — showModal/close, scroll lock, backdrop click, ref merging
  // — lives in one shared hook, so Modal and Drawer cannot drift apart.
  const { ref, handleClick, handleClose } = useNativeDialog({
    open,
    onClose,
    onOverlayClick,
    forwardedRef,
    // The <dialog> IS the panel here, so the backdrop is everything OUTSIDE its box — unlike the
    // Modal, whose dialog spans the viewport.
    backdropArea: 'outside',
  })

  // Memoised so the regions do not re-render on every parent render.
  const contextValue = useMemo(() => ({ variant, onClose }), [variant, onClose])

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
