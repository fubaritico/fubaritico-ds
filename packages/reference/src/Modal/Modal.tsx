import clsx from 'clsx'
import { useEffect, useRef } from 'react'

import type { MouseEvent, ReactNode } from 'react'

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when modal should close (ESC key, backdrop click) */
  onClose: () => void
  /** Modal content */
  children: ReactNode
  /** Accessible label for screen readers (required) */
  'aria-label': string
  /** Additional class name for the dialog element */
  className?: string
  /** Optional callback for backdrop click. Falls back to onClose if not provided. */
  onOverlayClick?: () => void
}

function Modal({
  isOpen,
  onClose,
  children,
  'aria-label': ariaLabel,
  className,
  onOverlayClick,
}: Readonly<ModalProps>) {
  const ref = useRef<HTMLDialogElement>(null)

  /**
   * Effect: Opens or closes the native <dialog> element and locks body scroll.
   * - showModal() places dialog in the top layer (above all MFE remotes, no z-index needed).
   * - Scroll lock is manual — <dialog> does not lock scroll natively.
   * - Cleanup restores overflow in case the component unmounts while open.
   */
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
      document.body.style.overflow = 'hidden'
    } else {
      dialog.close()
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  /**
   * Closes the modal when clicking the <dialog> element itself (the backdrop area).
   * e.target === ref.current only when clicking outside the dialog content,
   * since content clicks bubble up to a child, not to the dialog element directly.
   */
  const handleClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) (onOverlayClick ?? onClose)()
  }

  /**
   * Syncs the native ESC key close event (fired by the browser on <dialog>)
   * with the onClose callback, so parent state stays in sync.
   */
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
      className={clsx(
        'ui:backdrop:bg-black/80',
        'ui:bg-transparent ui:border-0 ui:p-0',
        'ui:max-w-none ui:max-h-none ui:w-full ui:h-full',
        className
      )}
    >
      {children}
    </dialog>
  )
}

export default Modal
