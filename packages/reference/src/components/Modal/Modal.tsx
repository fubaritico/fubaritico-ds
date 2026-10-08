import clsx from 'clsx'

import { MODAL_CLASS } from '@fubaritico-ds/variants'

import { useNativeDialog } from '../../hooks'

import type { ComponentProps } from 'react'

/** Props of the {@link Modal}. */
export interface ModalProps
  extends Omit<ComponentProps<'dialog'>, 'aria-label' | 'open'> {
  /** Whether the modal is open. */
  isOpen: boolean
  /** Called when the modal should close — Escape, or a click on the backdrop. */
  onClose: () => void
  /**
   * Accessible name of the dialog — **required**: a `<dialog>` has no implicit name, and the
   * content inside it is the consumer's, so nothing can be inferred.
   */
  'aria-label': string
  /** Called instead of `onClose` when the backdrop is clicked, to opt out of click-outside closing. */
  onOverlayClick?: () => void
}

/**
 * Modal — a native `<dialog>` opened in the browser's top layer.
 *
 * The element is a transparent, full-viewport SHELL: it guarantees the content paints above every
 * stacking context (no `z-index`, immune to a host's `overflow`/`transform` traps) and paints the
 * backdrop. The visible panel is yours to compose inside — a `Card`, a form, anything.
 *
 * Focus trapping, the Escape key and inertness of the rest of the page come free from `showModal()`.
 *
 * @param props - {@link ModalProps}.
 * @param props.isOpen - Whether the dialog is shown.
 * @param props.onClose - Called on Escape or a backdrop click.
 * @param props.onOverlayClick - Overrides the backdrop-click behaviour.
 * @returns The rendered dialog.
 */
export function Modal({
  isOpen,
  onClose,
  children,
  'aria-label': ariaLabel,
  className,
  onOverlayClick,
  ref: forwardedRef,
  ...rest
}: Readonly<ModalProps>) {
  // The whole native-dialog lifecycle — showModal/close, scroll lock, backdrop click, ref merging
  // — lives in one shared hook, so Modal and Drawer cannot drift apart.
  const { ref, handleClick, handleClose } = useNativeDialog({
    open: isOpen,
    onClose,
    onOverlayClick,
    forwardedRef,
  })

  return (
    <dialog
      ref={ref}
      aria-label={ariaLabel}
      aria-modal="true"
      onClick={handleClick}
      onClose={handleClose}
      className={clsx(MODAL_CLASS, className)}
      {...rest}
    >
      {children}
    </dialog>
  )
}

export default Modal
