import type { IconName } from '../Icon'
import type { SharedToaster } from '@fubaritico/behaviors'
import type { ToastVariant, ToasterPosition } from '@fubaritico/variants'
import type { ComponentProps, ReactNode } from 'react'

/**
 * The free content of a React toast, as the machine stores it (`custom.value`): a node, and whether
 * it brings its own surface.
 */
export interface ReactToastContent {
  /** What to render in place of the message. */
  node: ReactNode
  /** Drops the toast's surface (padding, border, background) — for an `Alert`. */
  bare: boolean
}

/** The toaster a React adapter drives: the page's shared one, or one injected (tests, stories). */
export type ReactToaster = SharedToaster<ReactToastContent>

/** Options every toast takes. */
export interface ToastOptions {
  /**
   * A stable id: showing it again while the toast is on screen replaces its content and restarts its
   * timer (a « Saving… » that becomes « Saved »).
   */
  id?: string
  /** How long it stays, in ms; `Infinity` until dismissed. Defaults to the Toaster's `duration`. */
  duration?: number
  /** Whether the user can close it (a close button, Escape); defaults to `true`. */
  dismissible?: boolean
  /** Interrupts the screen reader rather than waiting for a pause; defaults to `false`. */
  urgent?: boolean
}

/** Options of a toast made of a message — {@link ToastOptions} plus its text and intent. */
export interface ToastMessageOptions extends ToastOptions {
  /** The text under the title. */
  description?: string
  /** The intent; defaults to `'neutral'`. Colours the border and picks the default glyph. */
  variant?: ToastVariant
  /**
   * Replaces the intent's glyph. There is no way to drop it: the glyph carries the intent by shape,
   * not hue alone (WCAG 1.4.1); a `neutral` toast has none.
   */
  icon?: IconName
}

/** Options of a toast made of free content — {@link ToastOptions} plus its shell. */
export interface ToastCustomOptions extends ToastOptions {
  /** Drops the toast's surface, for content that brings its own (an `Alert`); defaults to `false`. */
  bare?: boolean
  /**
   * The toast's accessible name — free content has no title element, so this names the toast and
   * its close button (« Close Upload »). Required: a focusable toast without a name fails WCAG 4.1.2.
   */
  label: string
}

/** Props of the {@link Toaster}. */
export interface ToasterProps
  extends Omit<ComponentProps<'section'>, 'children' | 'role' | 'popover'> {
  /** Where the stack sits; defaults to `'bottom-end'`. */
  position?: ToasterPosition
  /** How many toasts are shown at once (the next evicts the oldest); defaults to `5`. */
  max?: number
  /** Default lifetime of a toast, in ms; defaults to `5000`. */
  duration?: number
  /** Accessible name of the stack, its hotkey appended; defaults to `'Notifications'`. */
  label?: string
  /** Accessible name of each close button; defaults to `'Close'`. */
  closeLabel?: string
  /** The key that moves focus into the stack; defaults to `'F8'`. */
  hotkey?: string
  /**
   * The toaster to render — the page's shared one by default. Inject one of your own
   * (`createToaster`) for a test, a story, or a page running untrusted scripts. Read once, at
   * mount: to switch toasters, remount the Toaster (a new `key`).
   */
  toaster?: ReactToaster
}
