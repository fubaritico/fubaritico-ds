import { describe, expect, it, vi } from 'vitest'

import { createTooltipService } from './tooltip-service.js'

import type { TooltipOptions, TooltipScheduler } from './types.js'

/** A scheduler driven by hand: `tick(ms)` runs what is due. */
function manualScheduler() {
  let now = 0
  let nextId = 0
  const timers = new Map<number, { at: number; callback: () => void }>()
  const scheduler: TooltipScheduler = {
    set: (callback, delay) => {
      nextId++
      timers.set(nextId, { at: now + delay, callback })
      return nextId
    },
    clear: (handle) => {
      timers.delete(handle as number)
    },
  }
  const tick = (ms: number) => {
    now += ms
    for (const [id, timer] of [...timers]) {
      if (timer.at <= now) {
        timers.delete(id)
        timer.callback()
      }
    }
  }
  return { scheduler, tick, pending: () => timers.size }
}

/**
 * A service on a manual clock.
 *
 * @param options - Options to merge.
 * @returns The service, its clock and the callback spy.
 */
function setup(options: Partial<TooltipOptions> = {}) {
  const clock = manualScheduler()
  const onOpenChange = vi.fn<(open: boolean) => void>()
  const service = createTooltipService({
    uid: 'tip',
    scheduler: clock.scheduler,
    onOpenChange,
    ...options,
  })
  return { service, onOpenChange, ...clock }
}

/**
 * A key event double.
 *
 * @param key - The key.
 * @param modifiers - Optional modifier flags.
 * @returns The event and its `preventDefault` spy.
 */
const key = (key: string, modifiers: { ctrlKey?: boolean } = {}) => ({
  key,
  preventDefault: vi.fn(),
  ...modifiers,
})

describe('TooltipService', () => {
  describe('happy path', () => {
    it('opens after the open delay on hover, and closes after the grace delay on leave', () => {
      const { service, tick, onOpenChange } = setup()
      service.pointerEnter()
      tick(299)
      expect(service.getState().open).toBe(false)
      tick(1)
      expect(service.getState().open).toBe(true)

      service.pointerLeave()
      tick(149)
      expect(service.getState().open).toBe(true)
      tick(1)
      expect(service.getState().open).toBe(false)
      expect(onOpenChange.mock.calls).toEqual([[true], [false]])
    })

    it('opens at once on focus and closes at once on blur', () => {
      const { service } = setup()
      service.focus()
      expect(service.getState().open).toBe(true)
      service.blur()
      expect(service.getState().open).toBe(false)
    })
  })

  describe('variants', () => {
    it('is hoverable: entering the bubble cancels the pending close', () => {
      const { service, tick } = setup({ defaultOpen: true })
      service.pointerLeave()
      tick(100)
      service.bubblePointerEnter()
      tick(1000)
      expect(service.getState().open).toBe(true)

      service.bubblePointerLeave()
      tick(150)
      expect(service.getState().open).toBe(false)
    })

    it('opens nothing for a pointer that only crosses the trigger', () => {
      const { service, tick, pending } = setup()
      service.pointerEnter()
      tick(100)
      service.pointerLeave()
      tick(1000)
      expect(service.getState().open).toBe(false)
      expect(pending()).toBe(0)
    })

    it('honours custom delays', () => {
      const { service, tick } = setup({ openDelay: 0, closeDelay: 0 })
      service.pointerEnter()
      tick(0)
      expect(service.getState().open).toBe(true)
    })

    it('is dismissible: Escape closes, consumes the key, and stays closed while hovered', () => {
      const { service, tick } = setup()
      service.pointerEnter()
      tick(300)
      const escape = key('Escape')
      expect(service.handleKeydown(escape)).toBe(true)
      expect(escape.preventDefault).toHaveBeenCalled()
      expect(service.getState().open).toBe(false)
      tick(5000)
      expect(service.getState().open).toBe(false)
    })

    it('describes its trigger while open — or hides the bubble with describe: false', () => {
      const { service } = setup()
      expect(service.triggerAttrs()['aria-describedby']).toBeUndefined()
      service.focus()
      expect(service.triggerAttrs()['aria-describedby']).toBe('tip-tooltip')
      expect(service.bubbleAttrs()).toEqual({
        id: 'tip-tooltip',
        role: 'tooltip',
        'aria-hidden': undefined,
        'data-hoverable': '',
      })

      const silent = setup({ describe: false }).service
      silent.focus()
      expect(silent.triggerAttrs()['aria-describedby']).toBeUndefined()
      expect(silent.bubbleAttrs()['aria-hidden']).toBe('true')
    })

    it('in controlled mode only emits the intent', () => {
      const { service, onOpenChange } = setup({ open: false })
      service.focus()
      expect(onOpenChange).toHaveBeenCalledWith(true)
      expect(service.getState().open).toBe(false)
      service.setOptions({ open: true })
      expect(service.getState().open).toBe(true)
    })
  })

  describe('hover and focus are independent (persistent, WCAG 1.4.13)', () => {
    it('stays open when the pointer leaves while the trigger keeps keyboard focus', () => {
      const { service, tick } = setup()
      service.pointerEnter()
      service.focus()
      service.pointerLeave()
      tick(1000)
      expect(service.getState().open).toBe(true)
    })

    it('stays open on blur while the pointer is still on the trigger, then closes on leave', () => {
      const { service, tick } = setup()
      service.focus()
      service.pointerEnter()
      service.blur()
      expect(service.getState().open).toBe(true)
      service.pointerLeave()
      tick(150)
      expect(service.getState().open).toBe(false)
    })

    it('a focus that is not visible (a mouse click) does not open, nor hold the bubble', () => {
      const { service, tick } = setup()
      service.focus(false)
      expect(service.getState().open).toBe(false)
      service.pointerEnter()
      tick(300)
      expect(service.getState().open).toBe(true)
      service.pointerLeave()
      tick(150)
      expect(service.getState().open).toBe(false)
    })

    it('re-entering the trigger from the bubble cancels the pending close', () => {
      const { service, tick } = setup({ defaultOpen: true })
      service.bubblePointerEnter()
      service.bubblePointerLeave()
      service.pointerEnter()
      tick(1000)
      expect(service.getState().open).toBe(true)
    })

    it('ignores touch for hover: a tap is not a hover', () => {
      const { service, tick } = setup()
      service.pointerEnter('touch')
      tick(1000)
      expect(service.getState().open).toBe(false)
    })
  })

  describe('managed errors', () => {
    it('Escape cancels a pending open', () => {
      const { service, tick } = setup()
      service.pointerEnter()
      service.handleKeydown(key('Escape'))
      tick(1000)
      expect(service.getState().open).toBe(false)
    })

    it('becoming disabled while open emits the close intent, controlled too', () => {
      const { service, onOpenChange } = setup({ open: true })
      service.setOptions({ disabled: true })
      expect(onOpenChange).toHaveBeenCalledWith(false)
      expect(service.getState().open).toBe(false)
    })

    it('a re-render passing fresh callbacks notifies nobody', () => {
      const { service } = setup()
      const listener = vi.fn()
      service.subscribe(listener)
      service.setOptions({ onOpenChange: () => undefined })
      service.setOptions({ onOpenChange: () => undefined, openDelay: 300 })
      expect(listener).not.toHaveBeenCalled()
    })

    it('never opens while disabled, and closes when it becomes disabled', () => {
      const { service, tick, onOpenChange } = setup({ disabled: true })
      service.pointerEnter()
      tick(1000)
      service.focus()
      expect(service.getState().open).toBe(false)
      expect(onOpenChange).not.toHaveBeenCalled()

      service.setOptions({ disabled: false })
      service.focus()
      expect(service.getState().open).toBe(true)
      service.setOptions({ disabled: true })
      expect(service.getState().open).toBe(false)
    })

    it('ignores Escape when closed, other keys, and modified keys', () => {
      const { service } = setup()
      expect(service.handleKeydown(key('Escape'))).toBe(false)
      service.focus()
      expect(service.handleKeydown(key('a'))).toBe(false)
      expect(service.handleKeydown(key('Escape', { ctrlKey: true }))).toBe(
        false
      )
      expect(service.getState().open).toBe(true)
    })
  })

  describe('unmanaged errors', () => {
    it('cancels its pending timer on destroy, and stays usable', () => {
      const { service, tick, pending } = setup()
      service.pointerEnter()
      service.destroy()
      expect(pending()).toBe(0)
      tick(1000)
      expect(service.getState().open).toBe(false)
      service.focus()
      expect(service.getState().open).toBe(true)
    })

    it('runs on the global timers when no scheduler is injected', () => {
      vi.useFakeTimers()
      const service = createTooltipService({ uid: 'g' })
      service.pointerEnter()
      vi.advanceTimersByTime(300)
      expect(service.getState().open).toBe(true)
      vi.useRealTimers()
    })
  })

  describe('edge cases', () => {
    it('notifies once per change, and not at all for a no-op', () => {
      const { service } = setup()
      const listener = vi.fn()
      service.subscribe(listener)
      service.focus()
      service.focus()
      service.setOptions({ openDelay: 500 })
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('makes a framework id safe for the DOM', () => {
      const { service } = setup({ uid: ':r1:' })
      expect(service.bubbleId()).toBe('-r1--tooltip')
    })

    it('starts closed even with defaultOpen when disabled', () => {
      expect(
        setup({ defaultOpen: true, disabled: true }).service.getState().open
      ).toBe(false)
    })
  })
})
