import type { TimerScheduler } from '../common/types.js'

/**
 * Where the one stack sits on the screen: an edge (`top` / `bottom`) and an inline alignment, in
 * logical terms (`start` / `end` follow the text direction).
 */
export type ToastPosition = (typeof TOAST_POSITIONS)[number]

/** The six positions of the stack. Checked at run time. */
export const TOAST_POSITIONS = [
  'top-start',
  'top-center',
  'top-end',
  'bottom-start',
  'bottom-center',
  'bottom-end',
] as const

/**
 * A toast's lifecycle step. `visible` counts towards the `max`; `leaving` is the exit transition,
 * after which the toast is removed.
 */
export type ToastPhase = 'visible' | 'leaving'

/**
 * Why the timers are paused (WCAG 2.2.1 Timing Adjustable). They run again only once every reason is
 * gone.
 */
export type ToastPauseReason = 'pointer' | 'focus' | 'document'

/** How a screen reader announces a toast: `polite` waits for a pause, `assertive` interrupts. */
export type ToastPoliteness = 'polite' | 'assertive'

/** The intents of a toast's message — the `Alert`'s, plus a neutral default. Checked at run time. */
export const TOAST_VARIANTS = [
  'neutral',
  'info',
  'success',
  'warning',
  'error',
] as const

/** The intent of a toast's message. */
export type ToastVariant = (typeof TOAST_VARIANTS)[number]

/**
 * The timers the machine delays with, plus a clock — to know what is left of a paused timer.
 * Defaults to the global `setTimeout` / `clearTimeout` / `Date.now`.
 */
export interface ToastScheduler extends TimerScheduler {
  /** The current time in milliseconds. */
  now: () => number
}

/**
 * The framework-neutral content of a toast: plain data every adapter renders the same way — which
 * is what lets a bundle of one framework send a toast to a stack another framework renders.
 */
export interface ToastMessage {
  /** The headline. */
  title?: string
  /** The text under the headline. */
  description?: string
  /** The name of an icon of the design system's set (`'Check'`, `'InformationCircle'`…). */
  icon?: string
  /** The intent; defaults to `'neutral'`. */
  variant?: ToastVariant
}

/**
 * Free content — a node of one framework — labelled with the framework that can render it. An
 * adapter renders only its own `kind`, and throws on another's: a React node cannot be rendered by
 * a Web Component stack.
 */
export interface ToastCustomContent<C> {
  /** The framework that rendered it: `'react'`, `'web-component'`, `'angular'`, `'vue'`. */
  kind: string
  /** The node, opaque to the machine. */
  value: C
}

/**
 * What a caller passes to show a toast — a `message`, a `custom` content, or both (the custom
 * content then replaces the message's rendering; the message still names the toast).
 */
export interface ToastInput<C> {
  /** The framework-neutral content. */
  message?: ToastMessage
  /** Free content, rendered instead of the message. */
  custom?: ToastCustomContent<C>
  /**
   * A stable id. Showing a toast with the id of one still on screen replaces its content and
   * restarts its timer (a « Saving… » that becomes « Saved »). Generated when absent.
   */
  id?: string
  /**
   * How long it stays, in ms: a positive number, or `Infinity` to stay until dismissed. Defaults to
   * the toaster's `duration`.
   */
  duration?: number
  /** Whether the user can close it (a close button, Escape); defaults to `true`. */
  dismissible?: boolean
  /** Announced assertively (it interrupts) rather than politely; defaults to `false`. */
  urgent?: boolean
}

/** One toast, as the snapshot hands it to the views. Immutable: a change makes a new record. */
export interface ToastRecord<C> {
  /** Its id — the one given, or a generated one. */
  id: string
  /**
   * Its DOM id: namespaced by the toaster's `uid` and numbered by the machine, never derived from
   * `id`, so two ids that read the same once made HTML-safe (`'a b'`, `'a-b'`) never collide.
   */
  domId: string
  /** The framework-neutral content, if any. */
  message: ToastMessage | undefined
  /** The free content, if any. */
  custom: ToastCustomContent<C> | undefined
  /** How long it stays once shown, in ms (`Infinity`: until dismissed). */
  duration: number
  /** Whether the user can close it. */
  dismissible: boolean
  /** Whether it is announced assertively. */
  urgent: boolean
  /** Its lifecycle step. */
  phase: ToastPhase
}

/** Options of a toaster. All but `uid` and `scheduler` may be changed later (`setOptions`). */
export interface ToasterOptions {
  /** Namespace of the generated ids. Inject a value unique per instance. */
  uid: string
  /** How many toasts are shown at once; the next one evicts the oldest. A positive integer; `5`. */
  max?: number
  /** Default lifetime of a toast, in ms: a positive number or `Infinity`; defaults to `5000`. */
  duration?: number
  /**
   * How long a dismissed toast stays in its `leaving` phase before removal, in ms — the length of
   * the skin's exit transition (`--ui-toast-leave-duration`); defaults to `200`. `0` removes at once.
   */
  leaveDuration?: number
  /** Where the stack sits; defaults to `'bottom-end'`. */
  position?: ToastPosition
  /** Accessible name of the stack's region, the hotkey appended; defaults to `'Notifications'`. */
  label?: string
  /** Accessible name of a toast's close button; defaults to `'Close'`. */
  closeLabel?: string
  /** The `KeyboardEvent.key` that moves focus into the stack; defaults to `'F8'`. */
  hotkey?: string
  /**
   * The framework the stack's adapter renders (`'react'`…). Declared, a `custom` content of another
   * framework throws in `show()` — in the caller's bundle, not in the stack's render.
   */
  renderer?: string
  /** Timer port; defaults to the global timers. Fixed at creation. */
  scheduler?: ToastScheduler
}

/**
 * What `setOptions` accepts: every option but the ones fixed at creation — the timer port, and the
 * `uid` every bundle's DOM ids are namespaced by.
 */
export type ToasterOptionsPatch = Partial<
  Omit<ToasterOptions, 'scheduler' | 'uid'>
>

/** Immutable snapshot of a toaster. */
export interface ToasterSnapshot<C> {
  /**
   * The toasts in DISPLAY order, top to bottom: the newest nearest the screen centre — last at the
   * top of the screen, first at the bottom. Leaving toasts included, until removed.
   */
  toasts: readonly ToastRecord<C>[]
  /** Where the stack sits. */
  position: ToastPosition
  /** Whether the timers are paused. */
  paused: boolean
  /**
   * Bumped when the hotkey asks for focus to move into the stack. An adapter focuses when it
   * CHANGES, never because it is non-zero.
   */
  focusToken: number
}
