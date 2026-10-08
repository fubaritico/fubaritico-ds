import clsx from 'clsx'
import { useEffect, useRef } from 'react'

import { MODAL_CLASS } from '@fubaritico-ds/variants'

import type { ComponentProps, MouseEvent } from 'react'

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
  ...rest
}: Readonly<ModalProps>) {
  const ref = useRef<HTMLDialogElement>(null)

  // Drive the native dialog imperatively — `showModal()` is what grants the top layer, the focus
  // trap and the backdrop; the `open` attribute alone gives none of them. Scroll lock is manual
  // because `<dialog>` does not lock the page itself, and the previous inline value is restored
  // rather than blanked, so a host that set its own `overflow` keeps it.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    const previousOverflow = document.body.style.overflow

    if (isOpen) {
      dialog.showModal()
      document.body.style.overflow = 'hidden'
    } else {
      dialog.close()
      document.body.style.overflow = previousOverflow
    }

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

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
      className={clsx(MODAL_CLASS, className)}
      {...rest}
    >
      {children}
    </dialog>
  )
}

export default Modal
