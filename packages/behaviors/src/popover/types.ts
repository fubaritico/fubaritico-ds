/** Options of a PopoverService. Every one may be changed later through `setOptions`. */
export interface PopoverOptions {
  /** Namespace of the generated ids and anchor name. Inject a value unique per instance. */
  uid: string
  /**
   * Controlled open state. The **presence** of the key means controlled; absent or `undefined` =
   * uncontrolled.
   */
  open?: boolean
  /** Initial open state when uncontrolled; defaults to `false`. */
  defaultOpen?: boolean
  /**
   * Accessible name of the popover surface. Give one unless the content starts with a heading the
   * adapter links with `aria-labelledby`.
   */
  label?: string
  /**
   * Called when the open state changes: the trigger, an imperative call, or the browser closing it
   * on its own (Escape, a click outside).
   */
  onOpenChange?: (open: boolean) => void
}

/** Immutable snapshot of a PopoverService. */
export interface PopoverSnapshot {
  /** Whether the popover should be shown. */
  open: boolean
}

/** What the browser reports in a popover's `toggle` event. */
export type PopoverToggleState = 'open' | 'closed'
