import { useEffect } from 'react'

import type { ReactToaster } from './Toast.types'
import type { ToastAnnouncement } from '@fubaritico/behaviors'

/**
 * The text a screen reader would read in a node: its text, minus what is hidden from assistive
 * technology (`aria-hidden`, `hidden`) — a decorative glyph's `<title>`, a visually-only helper.
 *
 * @param node - A node of the toast.
 * @returns Its spoken text, unnormalised.
 */
function spokenText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
  if (!(node instanceof Element)) return ''
  if (node.getAttribute('aria-hidden') === 'true' || node.hasAttribute('hidden'))
    return ''
  return Array.from(node.childNodes, spokenText).join(' ')
}

/**
 * The spoken text of a toast, found by its DOM id.
 *
 * @param domId - The toast's DOM id.
 * @returns Its text, collapsed to single spaces; empty when it is no longer on the page.
 */
function spokenTextOf(domId: string): string {
  const node = document.getElementById(domId)
  return node ? spokenText(node).replace(/\s+/g, ' ').trim() : ''
}

/**
 * The adapter's share of the announcements (the rules are the machine's): read the text of each
 * queued toast once it is rendered — the next frame, NVDA misses a same-frame write — and hand it
 * back. A cancelled frame (StrictMode's double run, a re-render) leaves the toast queued, so the
 * next run reads it.
 *
 * @param toaster - The toaster.
 * @param pending - `snapshot.announcements`.
 */
export function useToastAnnouncer(
  toaster: ReactToaster,
  pending: readonly ToastAnnouncement[]
): void {
  // Reads and hands back the queued texts on the next frame; nothing to do while none waits.
  useEffect(() => {
    if (pending.length === 0) return
    const frame = requestAnimationFrame(() => {
      for (const { seq, domId } of pending)
        toaster.announce(seq, spokenTextOf(domId))
    })
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [toaster, pending])
}

export default useToastAnnouncer
