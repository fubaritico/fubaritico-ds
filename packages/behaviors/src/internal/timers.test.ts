import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { globalTimers } from './timers.js'

describe('globalTimers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('happy path', () => {
    it('runs a callback after its delay', () => {
      const callback = vi.fn()
      globalTimers.set(callback, 100)
      vi.advanceTimersByTime(99)
      expect(callback).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('variants', () => {
    it('cancels a pending callback', () => {
      const callback = vi.fn()
      const handle = globalTimers.set(callback, 100)
      globalTimers.clear(handle)
      vi.advanceTimersByTime(100)
      expect(callback).not.toHaveBeenCalled()
    })

    it('reads the clock of the global Date', () => {
      vi.setSystemTime(1_000)
      expect(globalTimers.now()).toBe(1_000)
      vi.advanceTimersByTime(250)
      expect(globalTimers.now()).toBe(1_250)
    })
  })

  // L3: N/A — a thin binding of the platform timers; nothing is validated here.
  // L4: N/A — no collaborator but the platform.

  describe('edge cases', () => {
    it('ignores a clear of a handle that already ran', () => {
      const callback = vi.fn()
      const handle = globalTimers.set(callback, 0)
      vi.advanceTimersByTime(0)
      expect(() => {
        globalTimers.clear(handle)
      }).not.toThrow()
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })
})
