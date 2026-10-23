import { slug } from '../internal/ids.js'
import { hasModifier } from '../internal/keys.js'
import { Store } from '../internal/store.js'
import { globalTimers } from '../internal/timers.js'

import type {
  TooltipOptions,
  TooltipOptionsPatch,
  TooltipScheduler,
  TooltipSnapshot,
} from './types.js'
import type {
  DomAttributes,
  KeyboardLike,
  TimerHandle,
} from '../common/types.js'

/** Default delay before a hovered trigger opens the bubble, in ms. */
const DEFAULT_OPEN_DELAY = 300

/** Default grace delay before the bubble closes after the pointer leaves, in ms. */
const DEFAULT_CLOSE_DELAY = 150

/**
 * Tooltip trigger behaviour as a framework-agnostic service — WCAG 1.4.13 "content on hover or
 * focus" written once:
 * - **hover** opens after `openDelay` (a pointer crossing the page opens nothing), **focus** opens
 *   at once (a keyboard user asked for it);
 * - **hoverable**: leaving the trigger closes only after `closeDelay`, and entering the bubble
 *   cancels it, so the pointer can travel onto the bubble to read or select it;
 * - **dismissible**: Escape closes it without moving focus, and it stays closed until the pointer
 *   enters again or focus comes back;
 * - **persistent**: nothing else closes it — no timeout while hovered or focused.
 *
 * It holds the open state (controlled or not) and produces the trigger / bubble attributes. The
 * bubble itself (positioning, top layer) is the adapter's Tooltip component.
 */
export class TooltipService extends Store<TooltipSnapshot> {
  private opts: TooltipOptions
  /** `true` while the parent drives `open`. */
  private controlled: boolean
  private open: boolean
  /** Whether the pointer is on the trigger. */
  private hovered = false
  /** Whether the pointer is on the bubble. */
  private bubbleHovered = false
  /** Whether the trigger holds a VISIBLE (keyboard) focus. */
  private focused = false
  /** The pending open or close, if any — one at a time (boxed: a handle may be any value). */
  private pending: { handle: TimerHandle } | null = null
  /** The timers, fixed at creation: a handle is only ever cleared by the scheduler that set it. */
  private readonly scheduler: TooltipScheduler

  /**
   * @param options - Initial options; `uid` is required.
   */
  constructor(options: TooltipOptions) {
    super()
    this.opts = { ...options }
    this.scheduler = options.scheduler ?? globalTimers
    this.controlled = options.open !== undefined
    this.open = options.disabled
      ? false
      : (options.open ?? options.defaultOpen ?? false)
  }

  /**
   * Builds the snapshot.
   *
   * @returns The immutable snapshot.
   */
  protected createSnapshot(): TooltipSnapshot {
    const open = this.controlled ? (this.opts.open ?? false) : this.open
    return { open: open && !this.opts.disabled }
  }

  /**
   * Applies changed props. Notifies only when the snapshot changes. Becoming `disabled` cancels a
   * pending open and closes the bubble.
   *
   * @param patch - The options to change. `'open' in patch` distinguishes an absent prop from one
   *   passed as `undefined`.
   */
  setOptions(patch: TooltipOptionsPatch): void {
    const before = this.getState()
    const uidChanged = patch.uid !== undefined && patch.uid !== this.opts.uid
    const describeChanged =
      'describe' in patch && patch.describe !== this.opts.describe
    this.opts = { ...this.opts, ...patch }
    if ('open' in patch) {
      this.controlled = patch.open !== undefined
      if (patch.open !== undefined) this.open = patch.open
    }
    if (this.opts.disabled) {
      this.cancelPending()
      if (!this.controlled) this.open = false
      // The bubble was open: report the close, so a controlled parent does not keep `open` and
      // pop the bubble back without any user action when `disabled` flips back.
      if (before.open) this.opts.onOpenChange?.(false)
    }
    this.commitIfChanged(
      before,
      (b, a) => uidChanged || describeChanged || b.open !== a.open
    )
  }

  /**
   * Opens or closes the bubble now, cancelling anything pending. Uncontrolled: the state changes.
   * Controlled: only the intent is emitted — the parent decides.
   *
   * @param open - The wanted state.
   * @returns `false` when nothing changed (already in that state, or disabled).
   */
  setOpen(open: boolean): boolean {
    this.cancelPending()
    if (open && this.opts.disabled) return false
    if (this.getState().open === open) return false
    if (!this.controlled) {
      this.open = open
      this.commit()
    }
    this.opts.onOpenChange?.(open)
    return true
  }

  /**
   * The pointer entered the trigger: open after `openDelay`, or stay open if it already is. A touch
   * contact is not a hover (it would open, then close before anyone could read it): ignored.
   *
   * @param pointerType - The event's `pointerType` (`'mouse'`, `'pen'`, `'touch'`).
   */
  pointerEnter(pointerType?: string): void {
    if (pointerType === 'touch') return
    this.hovered = true
    if (this.opts.disabled) return
    if (this.getState().open) {
      this.cancelPending()
      return
    }
    this.schedule(true, this.opts.openDelay ?? DEFAULT_OPEN_DELAY)
  }

  /**
   * The pointer left the trigger: close after the grace delay (it may be heading for the bubble) —
   * unless the bubble is still held by keyboard focus.
   *
   * @param pointerType - The event's `pointerType`; a touch contact is ignored.
   */
  pointerLeave(pointerType?: string): void {
    if (pointerType === 'touch') return
    this.hovered = false
    this.release(true)
  }

  /** The pointer reached the bubble: it is hoverable, so the pending close is cancelled. */
  bubblePointerEnter(): void {
    this.bubbleHovered = true
    if (this.getState().open) this.cancelPending()
  }

  /** The pointer left the bubble: close after the grace delay, unless something still holds it. */
  bubblePointerLeave(): void {
    this.bubbleHovered = false
    this.release(true)
  }

  /**
   * The trigger received focus. A VISIBLE focus (keyboard) opens at once — that user asked for it. A
   * focus that is not visible (a mouse click) neither opens nor holds the bubble: hover rules apply.
   *
   * @param visible - Whether the focus is visible (`:focus-visible`); defaults to `true`.
   */
  focus(visible = true): void {
    this.focused = visible
    if (visible) this.setOpen(true)
  }

  /** The trigger lost focus: close at once — unless the pointer still rests on the trigger or bubble. */
  blur(): void {
    this.focused = false
    this.release(false)
  }

  /**
   * Keyboard model of the trigger: Escape closes an open bubble and leaves focus where it is.
   *
   * @param event - The key event.
   * @returns `true` when the key was consumed.
   */
  handleKeydown(event: KeyboardLike): boolean {
    if (hasModifier(event)) return false
    if (event.key !== 'Escape') return false
    if (!this.getState().open) {
      // Nothing shown yet: a pending open is dismissed too, but the key is not consumed.
      this.cancelPending()
      return false
    }
    // Consumed: a surrounding popover or dialog must not close on the same key.
    event.preventDefault?.()
    this.setOpen(false)
    return true
  }

  /**
   * Id of the bubble.
   *
   * @returns The DOM id.
   */
  bubbleId(): string {
    return `${slug(this.opts.uid)}-tooltip`
  }

  /**
   * Attributes of the trigger: the description link, only while the bubble is there to point to.
   *
   * @returns DOM attributes.
   */
  triggerAttrs(): DomAttributes {
    const describe = this.opts.describe ?? true
    return {
      'aria-describedby':
        describe && this.getState().open ? this.bubbleId() : undefined,
    }
  }

  /**
   * Attributes of the bubble: its id and role — or `aria-hidden` when it only repeats what
   * assistive technology already reads (`describe: false`). `data-hoverable` lets the skin give it
   * pointer events, so the pointer can rest on it.
   *
   * @returns DOM attributes.
   */
  bubbleAttrs(): DomAttributes {
    const describe = this.opts.describe ?? true
    return {
      id: this.bubbleId(),
      role: 'tooltip',
      'aria-hidden': describe ? undefined : 'true',
      'data-hoverable': '',
    }
  }

  /** Cancels any pending open / close and drops every subscriber. The instance stays usable. */
  destroy(): void {
    this.cancelPending()
    this.clearStore()
  }

  /**
   * Closes the bubble once nothing holds it any more — neither the pointer (trigger or bubble) nor
   * a visible focus. While something does, it stays (WCAG 1.4.13 "persistent").
   *
   * @param delayed - Wait the grace delay (the pointer may be travelling) rather than close now.
   */
  private release(delayed: boolean): void {
    if (this.hovered || this.bubbleHovered || this.focused) return
    if (!this.getState().open) {
      this.cancelPending()
      return
    }
    if (delayed)
      this.schedule(false, this.opts.closeDelay ?? DEFAULT_CLOSE_DELAY)
    else this.setOpen(false)
  }

  /**
   * Replaces any pending change with a delayed one.
   *
   * @param open - The state to reach.
   * @param delay - The delay, in ms.
   */
  private schedule(open: boolean, delay: number): void {
    this.cancelPending()
    this.pending = {
      handle: this.scheduler.set(() => {
        this.pending = null
        this.setOpen(open)
      }, delay),
    }
  }

  /**
   * Cancels the pending open / close, if any. An adapter calls it when its trigger unmounts, so a
   * timer never fires for a component that is gone — without `destroy`, which a development
   * double-mount would undo the subscriptions of.
   */
  cancelPending(): void {
    if (this.pending === null) return
    this.scheduler.clear(this.pending.handle)
    this.pending = null
  }
}

/**
 * Creates a TooltipService.
 *
 * @param options - Initial options; `uid` is required.
 * @returns A new service instance.
 */
export function createTooltipService(options: TooltipOptions): TooltipService {
  return new TooltipService(options)
}
