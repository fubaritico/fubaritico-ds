import { useEffect, useRef } from 'react'

import { useMergedRef } from './useMergedRef'

import type { MouseEvent, Ref } from 'react'

/** Options of {@link useNativeDialog}. */
export interface UseNativeDialogOptions {
  /** Whether the dialog is shown. */
  open: boolean
  /** Called when the dialog should close — Escape, or a click on the backdrop. */
  onClose: () => void
  /** Called instead of `onClose` on a backdrop click, to opt out of click-outside closing. */
  onOverlayClick?: () => void
  /** A `ref` the consumer passed through to the underlying element, if any. */
  forwardedRef?: Ref<HTMLDialogElement>
}

/** What {@link useNativeDialog} hands back to the component. */
export interface UseNativeDialogResult {
  /** Ref callback for the `<dialog>`; feeds both the internal ref and the consumer's. */
  ref: (node: HTMLDialogElement | null) => void
  /** `onClick` handler closing the dialog when the click lands on the backdrop. */
  handleClick: (e: MouseEvent<HTMLDialogElement>) => void
  /** `onClose` handler mirroring the browser's own close event back to the consumer. */
  handleClose: () => void
}

/**
 * Drives a native `<dialog>` as a true modal.
 *
 * Shared by every dialog-based component (`Modal`, `Drawer`) so the lifecycle exists ONCE: an
 * edge case fixed here is fixed for all of them, instead of being fixed in one and left broken in
 * the other.
 *
 * What it owns:
 * - **Imperative open/close.** `showModal()` is what grants the top layer, the focus trap, the
 *   inertness of the rest of the page and the backdrop; the `open` attribute alone grants none of
 *   them, which is why the element is never driven declaratively.
 * - **Scroll lock.** `<dialog>` does not lock the page itself. The previous inline value is
 *   RESTORED rather than blanked, so a host that set its own `overflow` keeps it.
 * - **Backdrop click.** `e.target` is the dialog only when the click missed the content: clicks
 *   inside bubble from a child, so they never match.
 * - **Ref merging.** `ComponentProps<'dialog'>` includes `ref` in React 19, so a consumer-supplied
 *   ref would otherwise land in the rest spread and replace the internal one — leaving the
 *   component unable to call `showModal()` at all, silently and with no warning.
 *
 * @param options - {@link UseNativeDialogOptions}.
 * @param options.open - Whether the dialog is shown.
 * @param options.onClose - Called on Escape or a backdrop click.
 * @param options.onOverlayClick - Overrides the backdrop-click behaviour.
 * @param options.forwardedRef - A consumer-supplied ref to keep working.
 * @returns {@link UseNativeDialogResult} — the ref callback and the two handlers.
 */
export function useNativeDialog({
  open,
  onClose,
  onOverlayClick,
  forwardedRef,
}: UseNativeDialogOptions): UseNativeDialogResult {
  // Imperative handle on the <dialog> node: drives showModal()/close() and identifies backdrop
  // clicks by comparing against the event target.
  const internalRef = useRef<HTMLDialogElement>(null)

  // Feeds the internal ref AND the consumer's, so neither displaces the other.
  const ref = useMergedRef(internalRef, forwardedRef)

  // Open or close the real dialog, and lock the page while it is up.
  useEffect(() => {
    const dialog = internalRef.current
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

  /**
   * Closes on a click landing on the dialog box itself, i.e. the backdrop area.
   *
   * @param e - The click event on the dialog.
   */
  const handleClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === internalRef.current) (onOverlayClick ?? onClose)()
  }

  /** Mirrors the browser's own close event (Escape) back into the consumer's state. */
  const handleClose = () => {
    onClose()
  }

  return { ref, handleClick, handleClose }
}
