import { slug } from '../internal/ids.js'
import { hasModifier } from '../internal/keys.js'
import { Store } from '../internal/store.js'
import { globalTimers } from '../internal/timers.js'

import { TOAST_POSITIONS, TOAST_VARIANTS } from './types.js'

import type {
  ToastInput,
  ToastPauseReason,
  ToastPoliteness,
  ToastPosition,
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

/** How many toasts are shown at once by default. */
const DEFAULT_MAX = 5

/** Default lifetime of a toast, in ms. */
const DEFAULT_DURATION = 5000

/** Default length of a toast's exit transition, in ms — `--ui-toast-leave-duration` in the skin. */
const DEFAULT_LEAVE_DURATION = 200

/** Where the stack sits by default. */
const DEFAULT_POSITION: ToastPosition = 'bottom-end'

/** The key that moves focus into the stack by default (Radix Toast's choice). */
const DEFAULT_HOTKEY = 'F8'

/** Default accessible name of the stack's region. */
const DEFAULT_LABEL = 'Notifications'

/** Default accessible name of a toast's close button. */
const DEFAULT_CLOSE_LABEL = 'Close'

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
 * Checks a lifetime: a positive number of ms, or `Infinity`.
 *
 * @param value - The lifetime to check.
 * @param name - Where it comes from, for the message.
 * @returns The value, when valid.
 * @throws RangeError when it is not positive (`NaN`, `0`, a negative number).
 */
function checkDuration(value: number, name: string): number {
  if (!(value > 0))
    throw new RangeError(
      `Toast: ${name} must be a positive number of milliseconds or Infinity, got ${String(value)}.`
    )
  return value
}

/** The string options: each must be a non-empty string when given. */
const STRING_OPTIONS = ['hotkey', 'label', 'closeLabel', 'renderer'] as const

/** The options fixed at creation, refused by `setOptions`. */
const FIXED_OPTIONS = ['uid', 'scheduler'] as const

/**
 * Whether a value is an object one can read fields from.
 *
 * @param value - Anything.
 * @returns `true` for a non-null object.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Names a value's type for an error message.
 *
 * @param value - Anything.
 * @returns `'null'` or its `typeof`.
 */
const typeName = (value: unknown): string =>
  value === null ? 'null' : typeof value

/**
 * Checks, at run time, the options present in an options object or a patch. The shared toaster is
 * configured by bundles of other frameworks and by plain JavaScript, where the types do not hold:
 * an option out of contract must fail in the caller, not in a later snapshot every bundle reads.
 *
 * @param options - Options or a patch.
 * @throws RangeError when `max`, `duration`, `leaveDuration` or `position` is out of range.
 * @throws TypeError when a string option is not a non-empty string.
 */
function checkOptions(options: ToasterOptionsPatch): void {
  const { max, duration, leaveDuration } = options
  if (max !== undefined && (!Number.isInteger(max) || max < 1))
    throw new RangeError(
      `Toast: max must be a positive integer, got ${String(max)}.`
    )
  if (duration !== undefined) checkDuration(duration, 'the toaster duration')
  if (
    leaveDuration !== undefined &&
    (!Number.isFinite(leaveDuration) || leaveDuration < 0)
  )
    throw new RangeError(
      `Toast: leaveDuration must be zero or a positive number of milliseconds, got ${String(leaveDuration)}.`
    )
  const position: unknown = options.position
  if (position !== undefined && !TOAST_POSITIONS.some((p) => p === position))
    throw new RangeError(
      `Toast: position must be one of ${TOAST_POSITIONS.join(', ')}, got ${JSON.stringify(position)}.`
    )
  for (const name of STRING_OPTIONS) {
    const value: unknown = options[name]
    if (value !== undefined && (typeof value !== 'string' || value === ''))
      throw new TypeError(
        `Toast: ${name} must be a non-empty string, got ${typeName(value)}.`
      )
  }
}

/**
 * Checks a framework-neutral message: an object of string fields and a known variant.
 *
 * @param message - The `message` a caller passed.
 * @throws TypeError when it is not an object, a field is not a string, or the variant is unknown.
 */
function checkMessage(message: unknown): void {
  if (!isRecord(message))
    throw new TypeError(
      `Toast: message must be an object ({ title, description, icon, variant }), got ${typeName(message)}.`
    )
  for (const field of ['title', 'description', 'icon'] as const) {
    const value = message[field]
    if (value !== undefined && typeof value !== 'string')
      throw new TypeError(
        `Toast: message.${field} must be a string, got ${typeName(value)}.`
      )
  }
  const { variant } = message
  if (variant !== undefined && !TOAST_VARIANTS.some((v) => v === variant))
    throw new TypeError(
      `Toast: message.variant must be one of ${TOAST_VARIANTS.join(', ')}, got ${JSON.stringify(variant)}.`
    )
}

/**
 * Checks free content: an object naming its framework, one the stack can render.
 *
 * @param custom - The `custom` content a caller passed.
 * @param renderer - The framework the stack's adapter renders, when one is declared.
 * @throws TypeError when it is not an object or has no `kind`.
 * @throws Error when it belongs to a framework the stack cannot render.
 */
function checkCustom(custom: unknown, renderer: string | undefined): void {
  if (!isRecord(custom))
    throw new TypeError(
      `Toast: custom must be an object ({ kind, value }), got ${typeName(custom)}.`
    )
  const { kind } = custom
  if (typeof kind !== 'string' || kind === '')
    throw new TypeError(
      'Toast: a `custom` content needs its `kind` — the framework that renders it.'
    )
  if (renderer !== undefined && kind !== renderer)
    throw new Error(
      `Toast: this page's stack is rendered by ${renderer}, it cannot render ${kind} content. ` +
        `Send a \`message\` to share a toast across frameworks.`
    )
}

/**
 * Checks, at run time, what a caller asks to show — reached by plain JavaScript too, so a field out
 * of contract fails here, in the caller, not later in a class name or an icon lookup.
 *
 * @param input - The toast to show.
 * @param renderer - The framework the stack's adapter renders, when one is declared.
 * @throws TypeError when the input is out of contract (nothing to render, a malformed message or
 *   custom content).
 * @throws Error when the custom content belongs to a framework the stack cannot render.
 */
function checkContent(input: unknown, renderer: string | undefined): void {
  if (!isRecord(input))
    throw new TypeError(
      `Toast: show() takes an object ({ message, custom, … }), got ${typeName(input)}.`
    )
  const { message, custom } = input
  if (message === undefined && custom === undefined)
    throw new TypeError(
      'Toast: show() needs a `message` or a `custom` content — there is nothing to render.'
    )
  if (message !== undefined) checkMessage(message)
  if (custom !== undefined) checkCustom(custom, renderer)
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
    for (const name of FIXED_OPTIONS)
      if (Object.prototype.hasOwnProperty.call(patch, name))
        throw new TypeError(
          `Toast: ${name} is fixed when the toaster is created; setOptions cannot change it.`
        )
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
    const { renderer } = this.opts
    if (
      defined.renderer !== undefined &&
      renderer !== undefined &&
      defined.renderer !== renderer
    )
      throw new Error(
        `Toast: this page's stack is already rendered by ${renderer}; a ${defined.renderer} ` +
          `adapter cannot render it too. Mount one Toaster per page.`
      )
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
    checkContent(input, this.opts.renderer)
    const duration = checkDuration(
      input.duration ?? this.opts.duration ?? DEFAULT_DURATION,
      'duration'
    )
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
    if (event.key !== (this.opts.hotkey ?? DEFAULT_HOTKEY)) return false
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
    if (event.key !== 'Escape') return false
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
    const hotkey = this.opts.hotkey ?? DEFAULT_HOTKEY
    return {
      role: 'region',
      'aria-label': `${this.opts.label ?? DEFAULT_LABEL} (${hotkey})`,
      tabindex: -1,
    }
  }

  /**
   * Attributes of one toast: focusable, so Escape reaches it; its phase for the skin's transition.
   *
   * @param toast - A toast of the snapshot.
   * @returns DOM attributes (presence semantics).
   */
  toastAttrs(toast: ToastRecord<C>): DomAttributes {
    return { id: toast.domId, tabindex: 0, 'data-phase': toast.phase }
  }

  /**
   * Attributes of a toast's close button.
   *
   * @param toast - A toast of the snapshot.
   * @returns DOM attributes (presence semantics).
   */
  closeButtonAttrs(toast: ToastRecord<C>): DomAttributes {
    return {
      type: 'button',
      'aria-label': this.opts.closeLabel ?? DEFAULT_CLOSE_LABEL,
      'aria-controls': toast.domId,
    }
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
    return {
      role: 'status',
      'aria-live': politeness,
      'aria-atomic': 'true',
    }
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
    this.clearStore()
  }

  /**
   * Builds the snapshot. Display order, top to bottom: oldest first at the top of the screen,
   * newest first at the bottom — the newest always nearest the screen centre.
   *
   * @returns The immutable snapshot.
   */
  protected createSnapshot(): ToasterSnapshot<C> {
    const position = this.opts.position ?? DEFAULT_POSITION
    const oldestFirst = this.entries.map((entry) => entry.record)
    return {
      toasts: position.startsWith('top') ? oldestFirst : oldestFirst.reverse(),
      position,
      paused: this.pauseReasons.size > 0,
      focusToken: this.focusToken,
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
    this.evict()
  }

  /** Starts the exit of the oldest visible toasts until at most `max` are left. */
  private evict(): void {
    const max = this.opts.max ?? DEFAULT_MAX
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
    const delay = this.opts.leaveDuration ?? DEFAULT_LEAVE_DURATION
    if (delay === 0) {
      this.remove(entry)
      return
    }
    entry.timer = {
      handle: this.scheduler.set(() => {
        entry.timer = null
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
        entry.timer = null
        entry.startedAt = null
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
