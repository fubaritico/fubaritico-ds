import { useCallback, useEffect, useRef } from 'react'

import { useMergedRef } from './useMergedRef'

import type { MouseEvent, Ref, RefObject, SyntheticEvent } from 'react'

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
  /**
   * Whether the dialog is modal; defaults to `true`.
   *
   * - `true` — `showModal()`: top layer, focus trap, the rest of the page inert, `::backdrop`,
   *   Escape handled by the browser, page scroll locked.
   * - `false` — the element must carry `popover="manual"`: `showPopover()` puts it in the top layer
   *   WITHOUT making it modal — the page stays usable, no backdrop, no scroll lock. Escape and
   *   click-outside are then the component's to handle (a manual popover has neither).
   */
  modal?: boolean
}

/** What {@link useNativeDialog} hands back to the component. */
export interface UseNativeDialogResult {
  /** Ref callback for the `<dialog>`; feeds both the internal ref and the consumer's. */
  ref: (node: HTMLDialogElement | null) => void
  /** The `<dialog>` node, for a component that must test a target against it. */
  dialogRef: RefObject<HTMLDialogElement | null>
  /** `onClick` handler closing the dialog when the click lands on the backdrop. */
  handleClick: (e: MouseEvent<HTMLDialogElement>) => void
  /** `onClose` handler mirroring the browser's own close event back to the consumer. */
  handleClose: (e: SyntheticEvent<HTMLDialogElement>) => void
}

/**
 * Drives a native `<dialog>` in the top layer — as a true modal, or as a non-modal surface.
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
 * @param options.modal - `showModal()` (default) or a non-modal `showPopover()`.
 * @returns {@link UseNativeDialogResult} — the ref callback, the node and the two handlers.
 */
export function useNativeDialog({
  open,
  onClose,
  onOverlayClick,
  forwardedRef,
  backdropArea = 'self',
  modal = true,
}: UseNativeDialogOptions): UseNativeDialogResult {
  // Imperative handle on the <dialog> node: drives showModal()/close() and identifies backdrop
  // clicks by comparing against the event target.
  const internalRef = useRef<HTMLDialogElement>(null)

  // Feeds the internal ref AND the consumer's, so neither displaces the other.
  const mergedRef = useMergedRef(internalRef, forwardedRef)

  // Set right before every close() this hook performs, consumed by the native `close` event: it
  // tells a close the hook did (the prop went `false`, an unmount, StrictMode's simulated unmount)
  // from one the browser did (Escape). Inferring it from the current prop would race: `close` is
  // dispatched as a queued task, by which time a re-run may have reopened the dialog.
  const closedByHookRef = useRef(false)

  // The last node seen. A component that remounts its dialog on every opening (BottomSheet) closes
  // the old node as it is detached: that `close` event never reaches React, and the flag above
  // would stay set and swallow the next Escape. A NEW node therefore starts with a clean flag;
  // StrictMode re-attaches the SAME node, so its queued close is still recognised.
  const lastNodeRef = useRef<HTMLDialogElement | null>(null)
  const ref = useCallback(
    (node: HTMLDialogElement | null) => {
      if (node && node !== lastNodeRef.current) {
        lastNodeRef.current = node
        closedByHookRef.current = false
      }
      mergedRef(node)
    },
    [mergedRef]
  )

  // Open or close the real dialog, and lock the page while — and only while — it is up.
  useEffect(() => {
    const dialog = internalRef.current
    if (!dialog) return

    /** Closes the dialog, flagging the resulting `close` event as the hook's own. */
    const closeFromHook = () => {
      if (!dialog.open) return
      closedByHookRef.current = true
      dialog.close()
    }

    if (!open) {
      closeFromHook()
      return
    }

    // Non-modal: the top layer only. A popover fires no `close` event, so there is nothing to flag;
    // every show is paired with its cleanup's hide, StrictMode's re-run included. An environment
    // without the Popover API (an old browser, jsdom) only renders the markup.
    if (!modal) {
      if (typeof dialog.showPopover !== 'function') return
      dialog.showPopover()
      return () => {
        dialog.hidePopover()
      }
    }

    // Captured at opening, restored at closing or unmount. A closed dialog never touches the
    // page: it would otherwise write back a stale value over whatever the host set meanwhile.
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'

    return () => {
      closeFromHook()
      document.body.style.overflow = previousOverflow
    }
  }, [open, modal])

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

  /**
   * Mirrors a close the BROWSER started (Escape) back into the consumer's state.
   *
   * `close` also fires when this hook closes the dialog itself — the prop went `false` after a
   * backdrop click, the close button or the consumer's own state change, or the component
   * unmounted. Reporting those would call `onClose` for a close the consumer already knows about.
   *
   * The browser closes the dialog BEFORE this runs, so the consumer must set its state to `false`
   * here; `cancel` is deliberately not intercepted — Chromium lets a page veto Escape only after a
   * user activation, and a second Escape always goes through.
   *
   * @param e - The `close` event; ignored unless this dialog is its target.
   */
  const handleClose = (e: SyntheticEvent<HTMLDialogElement>) => {
    // React propagates `close` through the React tree although the DOM event does not bubble: a
    // dialog nested in this one (a sheet opened from a Modal) would otherwise close this one too.
    if (e.target !== e.currentTarget) return
    if (closedByHookRef.current) {
      closedByHookRef.current = false
      return
    }
    onClose()
  }

  return { ref, dialogRef: internalRef, handleClick, handleClose }
}
