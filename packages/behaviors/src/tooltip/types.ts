/** A timer handle, as returned by the scheduler. Opaque: only handed back to `clear`. */
export type TimerHandle = unknown

/**
 * The timers the service delays with — a port, so tests drive time synchronously and a framework
 * may plug its own. Defaults to the global `setTimeout` / `clearTimeout`.
 */
export interface TooltipScheduler {
  /** Runs `callback` after `delay` milliseconds. */
  set: (callback: () => void, delay: number) => TimerHandle
  /** Cancels a pending `set`. */
  clear: (handle: TimerHandle) => void
}

/** Options of a TooltipService. Every one may be changed later through `setOptions`. */
export interface TooltipOptions {
  /** Namespace of the generated ids. Inject a value unique per instance. */
  uid: string
  /**
   * Controlled open state. The **presence** of the key means controlled; absent or `undefined` =
   * uncontrolled.
   */
  open?: boolean
  /** Initial open state when uncontrolled; defaults to `false`. */
  defaultOpen?: boolean
  /** Delay before a hovered trigger opens the bubble, in ms; defaults to `300`. Focus is immediate. */
  openDelay?: number
  /**
   * Grace delay before the bubble closes once the pointer leaves the trigger or the bubble, in ms;
   * defaults to `150` — long enough to travel from the trigger onto the bubble (WCAG 1.4.13).
   */
  closeDelay?: number
  /**
   * Whether the bubble describes its trigger (`aria-describedby`); defaults to `true`. Turn it off
   * when the bubble repeats text assistive technology already reads (a truncated label): the
   * bubble is then `aria-hidden` and the trigger carries no description.
   */
  describe?: boolean
  /** Never opens while `true` (and closes if open): e.g. a label that is not truncated. */
  disabled?: boolean
  /** Called when the open state changes (pointer, focus, Escape, an imperative call). */
  onOpenChange?: (open: boolean) => void
  /** Timer port; defaults to the global timers. */
  scheduler?: TooltipScheduler
}

/** Immutable snapshot of a TooltipService. */
export interface TooltipSnapshot {
  /** Whether the bubble should be shown. */
  open: boolean
}
