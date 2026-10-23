import { slug } from '../internal/ids.js'
import { hasModifier } from '../internal/keys.js'
import { Store } from '../internal/store.js'
import { globalTimers } from '../internal/timers.js'

import { ToastAnnouncer } from './toast-announcer.js'
import * as attrs from './toast-attrs.js'
import {
  checkContent,
  checkDuration,
  checkFixedOptions,
  checkOptions,
  checkRendererConflict,
  typeName,
} from './toast-validation.js'

import type {
  ToastInput,
  ToastPauseReason,
  ToastPoliteness,
  ToastRecord,
  ToastScheduler,
  ToasterOptions,
  ToasterOptionsPatch,
  ToasterSnapshot,
} from './types.js'
import type {
  DomAttributes,
  KeyboardLike,
  TimerHandle,
} from '../common/types.js'

/**
 * Default length of a toast's exit transition, in ms — the skin's `--ui-toast-transition-duration`
 * (`--duration-fast`). Exported so an adapter's browser test can hold the two together.
 */
export const TOAST_LEAVE_DURATION = 150

/**
 * The options a toaster takes when they are not given — the one home of these values (the JSDoc of
 * {@link ToasterOptions} names them, this holds them).
 */
export const TOASTER_DEFAULTS = Object.freeze({
  /** How many toasts are shown at once. */
  max: 5,
  /** Lifetime of a toast, in ms. */
  duration: 5000,
  /** Length of a toast's exit, in ms. */
  leaveDuration: TOAST_LEAVE_DURATION,
  /** Where the stack sits. */
  position: 'bottom-end',
  /** The key that moves focus into the stack (Radix Toast's choice). */
  hotkey: 'F8',
  /** Accessible name of the stack's region. */
  label: 'Notifications',
  /** Accessible name of a toast's close button. */
  closeLabel: 'Close',
})

/** The key that closes the focused toast. */
const DISMISS_KEY = 'Escape'

/** A toast plus what the machine tracks about its timer. */
interface Entry<C> {
  /** What the views read; replaced (never mutated) on every change. */
  record: ToastRecord<C>
  /** What is left of its lifetime, in ms. */
  remaining: number
  /** When its running timer started, or `null` while the timer is stopped. */
  startedAt: number | null
  /** Its pending timer — the end of its life, or the end of its exit (boxed: any handle value). */
  timer: { handle: TimerHandle } | null
}

/**
 * The toast stack as a framework-agnostic state machine — one stack, written once for every
 * framework:
 * - **a lifecycle per toast**: `visible` (its timer runs) → `leaving` (the exit transition) →
 *   removed;
 * - **at most `max` visible**: the next one evicts the oldest;
 * - **timers that pause** (WCAG 2.2.1) while the pointer is on the stack, focus is in it, or the
 *   document is hidden — each reason reported by the adapter, the timers run again once none is
 *   left;
 * - **announced without taking focus** (WCAG 4.1.3): the attributes of a polite and an assertive
 *   live region the adapter keeps on the page;
 * - **reachable by keyboard**: a hotkey moves focus into the stack's region, Escape closes the
 *   focused toast.
 *
 * A toast's content is a framework-neutral `message`, or free content labelled with its framework
 * (`custom`), opaque to the machine — an adapter reads it through `customContentFor`.
 */
export class ToastMachine<C> extends Store<ToasterSnapshot<C>> {
  private opts: ToasterOptions
  /** The timers, fixed at creation: a handle is only ever cleared by the scheduler that set it. */
  private readonly scheduler: ToastScheduler
  /** The announcement rules: what to read, how loud, for how long. */
  private readonly announcer: ToastAnnouncer
  /** Every toast on screen, oldest first — leaving ones included. */
  private entries: Entry<C>[] = []
  /** What currently holds the timers. */
  private readonly pauseReasons = new Set<ToastPauseReason>()
  /** Bumped by the hotkey. */
  private focusToken = 0
  /** Source of the generated ids and DOM ids. */
  private sequence = 0

  /**
   * @param options - Initial options; `uid` is required.
   * @throws RangeError when a numeric option or `position` is out of range.
   * @throws TypeError when `uid` or a string option is not a non-empty string.
   */
  constructor(options: ToasterOptions) {
    super()
    const uid: unknown = options.uid
    if (typeof uid !== 'string' || uid === '')
      throw new TypeError(
        `Toast: uid must be a non-empty string, got ${typeName(uid)}.`
      )
    checkOptions(options)
    this.opts = { ...options }
    this.scheduler = options.scheduler ?? globalTimers
    this.announcer = new ToastAnnouncer(this.scheduler, () => {
      this.commit()
    })
  }

  /**
   * Changes options. A smaller `max` evicts the oldest toasts at once; a new `duration` applies to
   * the toasts shown afterwards. A key passed as `undefined` keeps its current value.
   *
   * @param patch - The options to change.
   * @throws RangeError when a numeric option or `position` is out of range — nothing changes.
   * @throws TypeError when the patch carries `uid` or `scheduler` (fixed at creation), or a string
   *   option is not a non-empty string.
   * @throws Error when another framework already declared itself the stack's `renderer`.
   */
  setOptions(patch: ToasterOptionsPatch): void {
    checkFixedOptions(patch)
    checkOptions(patch)
    // An absent option and an option passed as `undefined` mean the same: keep the current value.
    const defined = Object.fromEntries(
      (Object.entries(patch) as [string, unknown][]).filter(
        ([, value]) => value !== undefined
      )
    ) as ToasterOptionsPatch
    const changed = (
      Object.keys(defined) as (keyof ToasterOptionsPatch)[]
    ).some((name) => defined[name] !== this.opts[name])
    if (!changed) return
    checkRendererConflict(this.opts.renderer, defined.renderer)
    this.opts = { ...this.opts, ...defined }
    this.batch(() => {
      this.evict()
      this.commit()
    })
  }

  /**
   * Shows a toast. When `max` toasts are already visible, the oldest starts leaving. Showing the id
   * of a visible toast replaces its content and restarts its timer, in place.
   *
   * @param input - {@link ToastInput}.
   * @returns The toast's id.
   * @throws RangeError when `duration` is not a positive number or `Infinity`.
   * @throws TypeError when the content is out of contract (see the message).
   * @throws Error when the custom content belongs to a framework the stack's `renderer` cannot render.
   */
  show(input: ToastInput<C>): string {
    checkContent(input, this.opts.renderer, this.opts.icons)
    // An urgent toast stays until dismissed unless told otherwise (WCAG 2.2.1).
    const lifetime = input.urgent
      ? Infinity
      : (this.opts.duration ?? TOASTER_DEFAULTS.duration)
    const duration = checkDuration(input.duration ?? lifetime, 'duration')
    const id = input.id ?? `${slug(this.opts.uid)}-${String(++this.sequence)}`
    const record: Omit<ToastRecord<C>, 'domId'> = {
      id,
      message: input.message,
      custom: input.custom,
      duration,
      dismissible: input.dismissible ?? true,
      urgent: input.urgent ?? false,
      phase: 'visible',
    }

    this.batch(() => {
      const existing = this.find(id)
      if (existing?.record.phase === 'visible') this.replace(existing, record)
      else {
        // A leaving toast with this id is gone for good: the new one takes its place at the top.
        if (existing) this.remove(existing)
        this.insert(record)
      }
      this.commit()
    })
    return id
  }

  /**
   * Starts a toast's exit. A toast already leaving, or not on screen, is left alone.
   *
   * @param id - The toast's id.
   * @returns Whether a toast started leaving.
   */
  dismiss(id: string): boolean {
    const entry = this.find(id)
    if (entry?.record.phase !== 'visible') return false
    this.batch(() => {
      this.leave(entry)
      this.commit()
    })
    return true
  }

  /** Starts the exit of every visible toast. */
  dismissAll(): void {
    const visible = this.visibleEntries()
    if (visible.length === 0) return
    this.batch(() => {
      visible.forEach((entry) => {
        this.leave(entry)
      })
      this.commit()
    })
  }

  /**
   * Holds the timers for a reason — the pointer on the stack, focus inside it, the document hidden.
   *
   * @param reason - {@link ToastPauseReason}.
   */
  pause(reason: ToastPauseReason): void {
    if (this.pauseReasons.has(reason)) return
    const wasPaused = this.pauseReasons.size > 0
    this.pauseReasons.add(reason)
    if (wasPaused) return
    this.visibleEntries().forEach((entry) => {
      this.stopTimer(entry)
    })
    this.commit()
  }

  /**
   * Releases one reason; the timers run again, for what was left of them, once none remains.
   *
   * @param reason - {@link ToastPauseReason}.
   */
  resume(reason: ToastPauseReason): void {
    if (!this.pauseReasons.delete(reason)) return
    if (this.pauseReasons.size > 0) return
    this.visibleEntries().forEach((entry) => {
      this.startTimer(entry)
    })
    this.commit()
  }

  /**
   * Keyboard model of the document: the hotkey moves focus into the stack (`focusToken`), when it
   * holds a visible toast. Register ONE listener per page for it; a key another handler already
   * consumed (`defaultPrevented`) is left alone, so a second listener does not ask twice.
   *
   * @param event - Any keyboard event.
   * @returns Whether the key was consumed.
   */
  handleKeydown(event: KeyboardLike): boolean {
    if (hasModifier(event) || event.defaultPrevented === true) return false
    if (event.key !== (this.opts.hotkey ?? TOASTER_DEFAULTS.hotkey))
      return false
    if (this.visibleEntries().length === 0) return false
    event.preventDefault?.()
    this.focusToken++
    this.commit()
    return true
  }

  /**
   * Keyboard model of a toast: Escape closes it when it is dismissible.
   *
   * @param id - The toast holding the focus.
   * @param event - Any keyboard event.
   * @returns Whether the key was consumed.
   */
  handleToastKeydown(id: string, event: KeyboardLike): boolean {
    if (hasModifier(event) || event.defaultPrevented === true) return false
    if (event.key !== DISMISS_KEY) return false
    const entry = this.find(id)
    if (entry?.record.phase !== 'visible' || !entry.record.dismissible)
      return false
    event.preventDefault?.()
    this.dismiss(id)
    return true
  }

  /**
   * Attributes of the stack's container: a landmark named after its hotkey, focusable by script only.
   *
   * @returns DOM attributes (presence semantics).
   */
  regionAttrs(): DomAttributes {
    return attrs.regionAttrs(
      this.opts.label ?? TOASTER_DEFAULTS.label,
      this.opts.hotkey ?? TOASTER_DEFAULTS.hotkey
    )
  }

  /**
   * Attributes of one toast: focusable, so Escape reaches it; named by its title, else its
   * description, or by the `label` of free content; its phase for the skin's transition.
   *
   * @param toast - A toast of the snapshot.
   * @returns DOM attributes (presence semantics).
   */
  toastAttrs(toast: ToastRecord<C>): DomAttributes {
    return attrs.toastAttrs(toast)
  }

  /**
   * Attributes of a toast's title — the id the toast and its close button are named by. Rendered
   * only for a message with a title (free content has no title element).
   *
   * @param toast - A toast of the snapshot.
   * @returns DOM attributes (presence semantics).
   */
  titleAttrs(toast: ToastRecord<C>): DomAttributes {
    return attrs.titleAttrs(toast)
  }

  /**
   * Attributes of a toast's description — the id an untitled toast and its close button are named
   * by. Rendered only for a message with a description.
   *
   * @param toast - A toast of the snapshot.
   * @returns DOM attributes (presence semantics).
   */
  descriptionAttrs(toast: ToastRecord<C>): DomAttributes {
    return attrs.descriptionAttrs(toast)
  }

  /**
   * Attributes of a toast's close button, named after its toast — five toasts are not five
   * identical « Close » buttons: « Close Saved », « Close Upload failed ».
   *
   * @param toast - A toast of the snapshot.
   * @returns DOM attributes (presence semantics).
   */
  closeButtonAttrs(toast: ToastRecord<C>): DomAttributes {
    return attrs.closeButtonAttrs(
      toast,
      this.opts.closeLabel ?? TOASTER_DEFAULTS.closeLabel
    )
  }

  /**
   * Attributes of a live region. The adapter keeps both on the page from the start — a region
   * inserted already filled is not reliably announced — and writes into the one matching a toast's
   * `urgent`. Both are `role="status"`, the assertive one by its `aria-live` only: `role="alert"`
   * makes some screen readers stutter (Radix Toast's finding).
   *
   * @param politeness - {@link ToastPoliteness}.
   * @returns DOM attributes (presence semantics).
   */
  announcerAttrs(politeness: ToastPoliteness): DomAttributes {
    return attrs.announcerAttrs(politeness)
  }

  /**
   * Hands back the text of a queued announcement (`snapshot.announcements`), read by the adapter
   * from the page once the toast is rendered — never in the frame it was inserted.
   *
   * @param seq - The announcement's number.
   * @param text - The toast's text as rendered.
   * @returns Whether a queued announcement was fulfilled (`false`: already done, or its toast gone).
   */
  announce(seq: number, text: string): boolean {
    if (!this.announcer.fulfil(seq, text)) return false
    this.commit()
    return true
  }

  /**
   * The adapter remounted the stack (it moved into or out of a modal dialog). A remount fires no
   * pointerleave and no blur, and its live regions start empty, so:
   * - what was being read is queued again (a region inserted already filled is not reliably read);
   * - the pointer reason is released (the pointer is not on the new node);
   * - the focus reason is released unless focus was inside — the adapter then gives it back.
   *
   * @param focusInside - Whether focus was inside the stack before the move.
   */
  regionRemounted(focusInside: boolean): void {
    this.batch(() => {
      if (this.announcer.replay()) this.commit()
      this.resume('pointer')
      if (!focusInside) this.resume('focus')
    })
  }

  /**
   * Cancels every timer, empties the stack and drops the subscribers. The instance stays usable.
   * Only for an instance of its own (`createToaster`): the page's shared toaster has no `destroy`.
   */
  destroy(): void {
    this.entries.forEach((entry) => {
      this.clearTimer(entry)
    })
    this.entries = []
    this.pauseReasons.clear()
    this.announcer.reset()
    this.clearStore()
  }

  /**
   * Builds the snapshot. Display order, top to bottom: oldest first at the top of the screen,
   * newest first at the bottom — the newest always nearest the screen centre.
   *
   * @returns The immutable snapshot.
   */
  protected createSnapshot(): ToasterSnapshot<C> {
    const position = this.opts.position ?? TOASTER_DEFAULTS.position
    const oldestFirst = this.entries.map((entry) => entry.record)
    return {
      toasts: position.startsWith('top') ? oldestFirst : oldestFirst.reverse(),
      position,
      paused: this.pauseReasons.size > 0,
      focusToken: this.focusToken,
      announcements: this.announcer.pendingAnnouncements(),
      live: this.announcer.liveText(),
    }
  }

  /**
   * Replaces a visible toast's content in place and restarts its timer. The caller commits.
   *
   * @param entry - The visible toast.
   * @param record - Its new record.
   */
  private replace(
    entry: Entry<C>,
    record: Omit<ToastRecord<C>, 'domId'>
  ): void {
    this.clearTimer(entry)
    entry.record = { ...record, domId: entry.record.domId }
    entry.remaining = record.duration
    this.startTimer(entry)
    this.announcer.queue(entry.record)
  }

  /**
   * Adds a toast on top and evicts the oldest past `max`. Its timer starts BEFORE it joins the
   * stack, so a scheduler that throws leaves the stack as it was. The caller commits.
   *
   * @param record - The new toast.
   */
  private insert(record: Omit<ToastRecord<C>, 'domId'>): void {
    const domId = `${slug(this.opts.uid)}-toast-${String(++this.sequence)}`
    const entry: Entry<C> = {
      record: { ...record, domId },
      remaining: record.duration,
      startedAt: null,
      timer: null,
    }
    this.startTimer(entry)
    this.entries.push(entry)
    this.announcer.queue(entry.record)
    this.evict()
  }

  /** Starts the exit of the oldest visible toasts until at most `max` are left. */
  private evict(): void {
    const max = this.opts.max ?? TOASTER_DEFAULTS.max
    const visible = this.visibleEntries()
    visible.slice(0, Math.max(0, visible.length - max)).forEach((entry) => {
      this.leave(entry)
    })
  }

  /**
   * Moves a toast to `leaving`, then removes it after `leaveDuration`. The caller commits.
   *
   * @param entry - A visible toast.
   */
  private leave(entry: Entry<C>): void {
    this.clearTimer(entry)
    entry.record = { ...entry.record, phase: 'leaving' }
    const delay = this.opts.leaveDuration ?? TOASTER_DEFAULTS.leaveDuration
    if (delay === 0) {
      this.remove(entry)
      return
    }
    entry.timer = {
      handle: this.scheduler.set(() => {
        this.releaseTimer(entry)
        this.remove(entry)
        this.commit()
      }, delay),
    }
  }

  /**
   * Takes a toast off the stack. The caller commits.
   *
   * @param entry - The toast.
   */
  private remove(entry: Entry<C>): void {
    this.clearTimer(entry)
    this.entries = this.entries.filter((e) => e !== entry)
    this.announcer.forget(entry.record.id)
  }

  /**
   * Runs a visible toast's timer for what is left of its life — unless paused or endless.
   *
   * @param entry - A visible toast.
   */
  private startTimer(entry: Entry<C>): void {
    if (this.pauseReasons.size > 0 || entry.remaining === Infinity) return
    entry.timer = {
      handle: this.scheduler.set(() => {
        this.releaseTimer(entry)
        this.batch(() => {
          this.leave(entry)
          this.commit()
        })
      }, entry.remaining),
    }
    entry.startedAt = this.scheduler.now()
  }

  /**
   * Stops a visible toast's timer and keeps what is left of its life.
   *
   * @param entry - A visible toast.
   */
  private stopTimer(entry: Entry<C>): void {
    if (entry.startedAt !== null)
      entry.remaining = Math.max(
        0,
        entry.remaining - (this.scheduler.now() - entry.startedAt)
      )
    this.clearTimer(entry)
  }

  /**
   * Cancels a toast's pending timer, if any.
   *
   * @param entry - The toast.
   */
  private clearTimer(entry: Entry<C>): void {
    if (entry.timer !== null) this.scheduler.clear(entry.timer.handle)
    this.releaseTimer(entry)
  }

  /**
   * Forgets a toast's timer — after it fired, or once cleared.
   *
   * @param entry - The toast.
   */
  private releaseTimer(entry: Entry<C>): void {
    entry.timer = null
    entry.startedAt = null
  }

  /**
   * The visible toasts, oldest first.
   *
   * @returns The entries in phase `visible`.
   */
  private visibleEntries(): Entry<C>[] {
    return this.entries.filter((entry) => entry.record.phase === 'visible')
  }

  /**
   * Finds a toast on screen.
   *
   * @param id - The toast's id.
   * @returns Its entry, or `undefined` when it is not on screen.
   */
  private find(id: string): Entry<C> | undefined {
    return this.entries.find((entry) => entry.record.id === id)
  }
}

/**
 * Creates a toaster — an instance of its own, for a test, a story, or an app that wants one stack
 * per subtree. The application-wide stack is {@link getGlobalToaster}.
 *
 * @param options - Initial options; `uid` is required.
 * @returns A new machine.
 * @throws RangeError when a numeric option or `position` is out of range.
 * @throws TypeError when `uid` or a string option is not a non-empty string.
 */
export function createToaster<C>(options: ToasterOptions): ToastMachine<C> {
  return new ToastMachine<C>(options)
}
