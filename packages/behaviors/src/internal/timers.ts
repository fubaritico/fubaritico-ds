import type { TimerHandle } from '../common/types.js'

/** The global timer functions, typed here: the package compiles without DOM or Node types. */
interface TimerHost {
  /** Global `setTimeout`. */
  setTimeout: (callback: () => void, delay: number) => TimerHandle
  /** Global `clearTimeout`. */
  clearTimeout: (handle: TimerHandle) => void
  /** Global `Date`, for its `now`. */
  Date: { now: () => number }
}

/** The global timers, behind the schedulers' port — what a service uses when none is injected. */
export const globalTimers = {
  /**
   * Runs `callback` after `delay` milliseconds.
   *
   * @param callback - What to run.
   * @param delay - The delay, in ms.
   * @returns The timer handle.
   */
  set: (callback: () => void, delay: number): TimerHandle =>
    (globalThis as unknown as TimerHost).setTimeout(callback, delay),
  /**
   * Cancels a pending `set`.
   *
   * @param handle - The handle `set` returned.
   */
  clear: (handle: TimerHandle): void => {
    ;(globalThis as unknown as TimerHost).clearTimeout(handle)
  },
  /**
   * The current time.
   *
   * @returns Milliseconds since the epoch.
   */
  now: (): number => (globalThis as unknown as TimerHost).Date.now(),
}
