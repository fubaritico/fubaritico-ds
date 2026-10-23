// Test helpers of the toast suites — not shipped (tsconfig.build excludes *.test-utils.ts).
import { vi } from 'vitest'

import { createToaster } from './toast-machine.js'

import type { ToastInput, ToastScheduler, ToasterOptions } from './types.js'

/** A scheduler driven by hand: `tick(ms)` advances the clock and runs what is due. */
export function manualScheduler() {
  let now = 0
  let nextId = 0
  const timers = new Map<number, { at: number; callback: () => void }>()
  const scheduler: ToastScheduler = {
    set: (callback, delay) => {
      nextId++
      timers.set(nextId, { at: now + delay, callback })
      return nextId
    },
    clear: (handle) => {
      timers.delete(handle as number)
    },
    now: () => now,
  }
  const tick = (ms: number) => {
    now += ms
    for (const [id, timer] of [...timers].sort((a, b) => a[1].at - b[1].at)) {
      if (timer.at <= now && timers.has(id)) {
        timers.delete(id)
        timer.callback()
      }
    }
  }
  return { scheduler, tick, pending: () => timers.size }
}

/**
 * A toaster on a manual clock, removal at once unless told otherwise.
 *
 * @param options - Options to merge.
 * @returns The toaster, its clock and a listener spy.
 */
export function setup(options: Partial<ToasterOptions> = {}) {
  const clock = manualScheduler()
  const toaster = createToaster<string>({
    uid: 'app',
    scheduler: clock.scheduler,
    leaveDuration: 0,
    ...options,
  })
  const listener = vi.fn()
  toaster.subscribe(listener)
  return { toaster, listener, ...clock }
}

/**
 * A toast holding a message with this title.
 *
 * @param title - The message's title.
 * @param rest - Other input fields.
 * @returns The input.
 */
export const message = (
  title: string,
  rest: Omit<ToastInput<string>, 'message'> = {}
): ToastInput<string> => ({ message: { title }, ...rest })

/**
 * The titles on screen, in display order.
 *
 * @param toaster - The toaster.
 * @param toaster.getState - Its snapshot reader.
 * @returns The titles, top to bottom.
 */
export const titles = (toaster: {
  getState: () => { toasts: readonly { message?: { title?: string } }[] }
}) => toaster.getState().toasts.map((toast) => toast.message?.title)

/**
 * A key event double.
 *
 * @param key - The key.
 * @param flags - Optional modifier / state flags.
 * @returns The event, with a `preventDefault` spy.
 */
export const keyEvent = (
  key: string,
  flags: { ctrlKey?: boolean; defaultPrevented?: boolean } = {}
) => ({ key, ...flags, preventDefault: vi.fn() })
