import { useEffect, useRef } from 'react'

import type { ReactToaster } from './Toast.types'
import type { FocusEvent, PointerEvent, RefObject } from 'react'

/** The stack's pointer and focus handlers, the consumer's own run first. */
export interface StackPauseHandlers {
  /** Holds the timers while the pointer is on the stack. */
  onPointerEnter: (event: PointerEvent<HTMLElement>) => void
  /** Runs them again when it leaves. */
  onPointerLeave: (event: PointerEvent<HTMLElement>) => void
  /** Holds the timers while focus is in the stack. */
  onFocus: (event: FocusEvent<HTMLElement>) => void
  /** Runs them again when focus leaves the stack (not when it moves between two toasts). */
  onBlur: (event: FocusEvent<HTMLElement>) => void
}

/**
 * Wires the stack's pointer and focus to the machine's pause reasons (WCAG 2.2.1), and tracks
 * whether focus is inside — a remount fires no blur, so that fact must outlive the node.
 *
 * @param toaster - The toaster.
 * @param consumer - The handlers the consumer passed, called first.
 * @returns The handlers to spread on the stack, and whether focus is inside it.
 */
export function useStackPause(
  toaster: ReactToaster,
  consumer: Partial<StackPauseHandlers>
): { handlers: StackPauseHandlers; focusInside: RefObject<boolean> } {
  // Whether focus is inside the stack — survives a remount, which fires no blur.
  const focusInside = useRef(false)
  const handlers: StackPauseHandlers = {
    onPointerEnter: (event) => {
      consumer.onPointerEnter?.(event)
      toaster.pause('pointer')
    },
    onPointerLeave: (event) => {
      consumer.onPointerLeave?.(event)
      toaster.resume('pointer')
    },
    onFocus: (event) => {
      consumer.onFocus?.(event)
      focusInside.current = true
      toaster.pause('focus')
    },
    onBlur: (event) => {
      consumer.onBlur?.(event)
      // Focus moving between two toasts stays inside: the timers keep waiting.
      if (event.currentTarget.contains(event.relatedTarget)) return
      focusInside.current = false
      toaster.resume('focus')
    },
  }
  return { handlers, focusInside }
}

/**
 * Moves focus into the stack when the machine's focus token CHANGES (the hotkey) — never on mount.
 *
 * @param focusToken - `snapshot.focusToken`.
 * @param regionRef - The stack's node.
 */
export function useHotkeyFocus(
  focusToken: number,
  regionRef: RefObject<HTMLElement | null>
): void {
  // The last token seen.
  const last = useRef(focusToken)
  // Focuses the stack on a new token.
  useEffect(() => {
    if (focusToken === last.current) return
    last.current = focusToken
    regionRef.current?.focus()
  }, [focusToken, regionRef])
}

/**
 * Reports a move of the stack into or out of a modal dialog to the machine (it replays the
 * announcements and releases the pause reasons a remount leaves behind), and gives focus back to
 * the new node when it was inside the old one.
 *
 * @param toaster - The toaster.
 * @param dialog - The dialog the stack renders into, or `null`.
 * @param regionRef - The stack's node.
 * @param focusInside - Whether focus was inside the stack.
 */
export function useStackMove(
  toaster: ReactToaster,
  dialog: HTMLDialogElement | null,
  regionRef: RefObject<HTMLElement | null>,
  focusInside: RefObject<boolean>
): void {
  // The dialog the stack was last rendered into.
  const last = useRef(dialog)
  // Runs after each move.
  useEffect(() => {
    if (dialog === last.current) return
    last.current = dialog
    toaster.regionRemounted(focusInside.current)
    if (focusInside.current) regionRef.current?.focus()
  }, [toaster, dialog, regionRef, focusInside])
}
