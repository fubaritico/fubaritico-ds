import { Store } from '../internal/store.js'

import type {
  PopoverOptions,
  PopoverSnapshot,
  PopoverToggleState,
} from './types.js'
import type { DomAttributes } from '../common/types.js'

/**
 * Makes a string safe inside an HTML id and a CSS dashed ident.
 *
 * @param value - Any string (a framework-generated id…).
 * @returns The string with every character outside `[A-Za-z0-9_-]` replaced by `-`.
 */
const slug = (value: string): string => value.replace(/[^\w-]/g, '-')

/** Focusable descendants, in DOM order — what receives focus when the surface opens. */
const INITIAL_FOCUS_SELECTOR = [
  'input:not([disabled]):not([tabindex="-1"])',
  'button:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex="0"]',
].join(', ')

/**
 * Popover behaviour as a framework-agnostic service, built on the platform's `popover` attribute:
 * the browser renders the surface in the TOP LAYER (above every z-index and outside every
 * `overflow: hidden`, with no portal), closes it on Escape and on a click outside, and returns focus
 * to the trigger. The service holds the open state (controlled or not), keeps it in step with what
 * the browser does on its own, and produces the trigger / surface attributes and the CSS anchor
 * name that positions the surface next to its trigger.
 */
export class PopoverService extends Store<PopoverSnapshot> {
  private opts: PopoverOptions
  /** `true` while the parent drives `open`. */
  private controlled: boolean
  private open: boolean

  /**
   * @param options - Initial options; `uid` is required.
   */
  constructor(options: PopoverOptions) {
    super()
    this.opts = { ...options }
    this.controlled = options.open !== undefined
    this.open = options.open ?? options.defaultOpen ?? false
  }

  /**
   * Builds the snapshot.
   *
   * @returns The immutable snapshot.
   */
  protected createSnapshot(): PopoverSnapshot {
    return { open: this.controlled ? (this.opts.open ?? false) : this.open }
  }

  /**
   * Applies changed props. Notifies only when the open state changes.
   *
   * @param patch - The options to change. `'open' in patch` distinguishes an absent prop from one
   *   passed as `undefined`.
   */
  setOptions(patch: Partial<PopoverOptions>): void {
    const before = this.getState()
    const uidChanged = patch.uid !== undefined && patch.uid !== this.opts.uid
    const labelChanged = 'label' in patch && patch.label !== this.opts.label
    this.opts = { ...this.opts, ...patch }
    if ('open' in patch) {
      this.controlled = patch.open !== undefined
      if (patch.open !== undefined) this.open = patch.open
    }
    this.commitIfChanged(
      before,
      (b, a) => uidChanged || labelChanged || b.open !== a.open
    )
  }

  /**
   * Opens or closes the popover. Uncontrolled: the state changes. Controlled: only the intent is
   * emitted — the parent decides.
   *
   * @param open - The wanted state.
   * @returns `false` when it already is in that state.
   */
  setOpen(open: boolean): boolean {
    if (this.getState().open === open) return false
    if (!this.controlled) {
      this.open = open
      this.commit()
    }
    this.opts.onOpenChange?.(open)
    return true
  }

  /**
   * The browser changed the popover on its own — the trigger's `popovertarget`, Escape, a click
   * outside. Brings the service in step and reports it. In controlled mode a parent that keeps
   * `open` makes the adapter show the surface again.
   *
   * @param state - The `newState` of the native `toggle` event.
   */
  syncFromToggle(state: PopoverToggleState): void {
    this.setOpen(state === 'open')
  }

  /**
   * After a native toggle, the state the surface must end in: a controlled parent may have refused
   * the change, and its state did not move — so no re-render will put the surface back.
   *
   * @param state - The `newState` the browser reported.
   * @returns The state to force on the surface, or `null` when it already matches.
   */
  reconcileToggle(state: PopoverToggleState): PopoverToggleState | null {
    const wanted: PopoverToggleState = this.getState().open ? 'open' : 'closed'
    return wanted === state ? null : wanted
  }

  /**
   * Where focus goes when the surface opens: the first element matching this selector, else the
   * surface itself (it is programmatically focusable). Shared by every adapter.
   *
   * @returns A CSS selector of focusable descendants.
   */
  initialFocusSelector(): string {
    return INITIAL_FOCUS_SELECTOR
  }

  /**
   * Id of the popover surface.
   *
   * @returns The DOM id.
   */
  contentId(): string {
    return `${slug(this.opts.uid)}-popover`
  }

  /**
   * CSS anchor name tying the surface to its trigger (`anchor-name` / `position-anchor`).
   *
   * @returns A dashed ident, unique per instance.
   */
  anchorName(): string {
    return `--ui-popover-${slug(this.opts.uid)}`
  }

  /**
   * Attributes of the trigger button. `popovertarget` lets the browser open and close the surface on
   * click — natively, with focus returning here on close — and makes this button its invoker.
   *
   * @returns DOM attributes.
   */
  triggerAttrs(): DomAttributes {
    return {
      type: 'button',
      popovertarget: this.contentId(),
      'aria-haspopup': 'dialog',
      'aria-expanded': String(this.getState().open),
      'aria-controls': this.contentId(),
    }
  }

  /**
   * Attributes of the popover surface: `popover="auto"` (top layer, light dismiss, Escape), a
   * non-modal `dialog` role, its name, and a programmatic focus target.
   *
   * @returns DOM attributes.
   */
  contentAttrs(): DomAttributes {
    return {
      id: this.contentId(),
      popover: 'auto',
      role: 'dialog',
      'aria-label': this.opts.label,
      tabindex: -1,
    }
  }

  /** Drops every subscriber. The instance stays usable (a development double-mount reuses it). */
  destroy(): void {
    this.clearStore()
  }
}

/**
 * Creates a PopoverService.
 *
 * @param options - Initial options; `uid` is required.
 * @returns A new service instance.
 */
export function createPopoverService(options: PopoverOptions): PopoverService {
  return new PopoverService(options)
}
