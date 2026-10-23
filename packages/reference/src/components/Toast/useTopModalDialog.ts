import { useSyncExternalStore } from 'react'

/**
 * The open modal `<dialog>` to render into: the last matching `:modal` in document order — a dialog
 * nested in another (a Modal opened from a Drawer) follows it, and is the one on top.
 *
 * DEGRADED MODE (declared): an environment that does not know `:modal` (an old browser, jsdom)
 * throws on the selector; no dialog can be told modal there, so the toasts stay in place.
 *
 * @returns The dialog, or `null` when none is open modally.
 */
function readTopModalDialog(): HTMLDialogElement | null {
  const open = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog[open]'))
  const modal = open.filter((dialog) => {
    try {
      return dialog.matches(':modal')
    } catch {
      // A browser without `:modal` (or jsdom): no modal dialog can be told apart, so none is.
      return false
    }
  })
  return modal.at(-1) ?? null
}

/**
 * Whether a node is, or holds, a dialog.
 *
 * @param node - An added or removed node.
 * @returns `true` for a `<dialog>` or an element containing one.
 */
const holdsDialog = (node: Node): boolean =>
  node instanceof Element &&
  (node.tagName === 'DIALOG' || node.querySelector('dialog') !== null)

/**
 * Whether a mutation can change which dialog is open: a dialog's `open` attribute, or a dialog
 * added or removed — not the page's every other change (a table re-rendering, the toasts).
 *
 * @param record - A mutation record.
 * @returns `true` when it touches a dialog.
 */
const touchesDialog = (record: MutationRecord): boolean =>
  record.type === 'attributes'
    ? record.target instanceof Element && record.target.tagName === 'DIALOG'
    : [...record.addedNodes, ...record.removedNodes].some(holdsDialog)

/**
 * Subscribes to the opening and closing of dialogs anywhere in the document.
 *
 * @param onChange - Called when a dialog opens, closes, mounts or unmounts.
 * @returns The unsubscribe function.
 */
function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver((records) => {
    if (records.some(touchesDialog)) onChange()
  })
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['open'],
  })
  return () => {
    observer.disconnect()
  }
}

/**
 * The open modal dialog the page's toasts must render into. A modal `<dialog>` makes everything
 * outside it inert — a toast stack in the top layer included: it stays painted, but neither the
 * pointer nor the focus reach it (proven in Chromium). Rendered INSIDE the dialog, it is above it,
 * focusable and clickable.
 *
 * @returns The topmost modal dialog, or `null` on the server and while none is open.
 */
export function useTopModalDialog(): HTMLDialogElement | null {
  // Re-read on every dialog change; `null` on the server, where no dialog is open.
  return useSyncExternalStore(subscribe, readTopModalDialog, () => null)
}

export default useTopModalDialog
