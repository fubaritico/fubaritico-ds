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
  /**
   * Where the backdrop is, relative to the dialog's own box.
   *
   * - `'self'` — the dialog SPANS the viewport and the panel is a child (Modal). A click whose
   *   target is the dialog itself therefore missed the panel, and is a backdrop click.
   * - `'outside'` — the dialog IS the panel (Drawer). The target is the dialog both when the click
   *   missed it AND when it landed on the panel's own background, so the two can only be told
   *   apart geometrically, against the panel's box.
   *
   * Defaults to `'self'`.
   */
  backdropArea?: 'self' | 'outside'
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
 * - **Backdrop click.** Resolved per `backdropArea`, because a `<dialog>` reports itself as the
 *   target for backdrop clicks: that is enough when the dialog spans the viewport, and needs a
 *   geometric test when the dialog IS the panel.
 * - **Ref merging.** `ComponentProps<'dialog'>` includes `ref` in React 19, so a consumer-supplied
 *   ref would otherwise land in the rest spread and replace the internal one — leaving the
 *   component unable to call `showModal()` at all, silently and with no warning.
 *
 * @param options - {@link UseNativeDialogOptions}.
 * @param options.open - Whether the dialog is shown.
 * @param options.onClose - Called on Escape or a backdrop click.
 * @param options.onOverlayClick - Overrides the backdrop-click behaviour.
 * @param options.forwardedRef - A consumer-supplied ref to keep working.
 * @param options.backdropArea - Where the backdrop sits relative to the dialog's box.
 * @returns {@link UseNativeDialogResult} — the ref callback and the two handlers.
 */
export function useNativeDialog({
  open,
  onClose,
  onOverlayClick,
  forwardedRef,
  backdropArea = 'self',
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
   * Closes when the click landed on the backdrop rather than on the panel.
   *
   * A `<dialog>` reports ITSELF as the target for clicks on its backdrop, so `e.target` alone
   * cannot tell a backdrop click from one on the panel's own background — it only works when the
   * dialog spans the viewport and the panel is a child of it. When the dialog IS the panel, the
   * click is tested against its box instead.
   *
   * @param e - The click event on the dialog.
   */
  const handleClick = (e: MouseEvent<HTMLDialogElement>) => {
    const dialog = internalRef.current
    if (!dialog || e.target !== dialog) return

    if (backdropArea === 'outside') {
      const { top, bottom, left, right } = dialog.getBoundingClientRect()
      const insidePanel =
        e.clientX >= left &&
        e.clientX <= right &&
        e.clientY >= top &&
        e.clientY <= bottom

      if (insidePanel) return
    }

    ;(onOverlayClick ?? onClose)()
  }

  /** Mirrors the browser's own close event (Escape) back into the consumer's state. */
  const handleClose = () => {
    onClose()
  }

  return { ref, handleClick, handleClose }
}
