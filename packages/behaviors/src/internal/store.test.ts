import { describe, expect, it, vi } from 'vitest'

import { Store } from './store.js'

/** Smallest concrete store: a counter, plus a label the views do not read. */
class Counter extends Store<{ count: number }> {
  count = 0
  label = ''
  builds = 0

  increment(): void {
    this.count++
    this.commit()
  }

  rename(label: string): void {
    const before = this.getState()
    this.label = label
    this.commitIfChanged(before, (b, a) => b.count !== a.count)
  }

  reset(): void {
    this.clearStore()
  }

  protected createSnapshot() {
    this.builds++
    return { count: this.count }
  }
}

describe('Store', () => {
  describe('happy path', () => {
    it('notifies subscribers with the new snapshot', () => {
      const store = new Counter()
      const listener = vi.fn()
      store.subscribe(listener)
      store.increment()
      expect(listener).toHaveBeenCalledWith({ count: 1 })
    })
  })

  describe('variants', () => {
    it('memoises the snapshot until a commit', () => {
      const store = new Counter()
      const first = store.getState()
      expect(store.getState()).toBe(first)
      expect(store.builds).toBe(1)
      store.increment()
      expect(store.getState()).not.toBe(first)
    })

    it('batches nested mutations into one notification', () => {
      const store = new Counter()
      const listener = vi.fn()
      store.subscribe(listener)
      store.batch(() => {
        store.increment()
        store.batch(() => {
          store.increment()
        })
      })
      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith({ count: 2 })
    })

    it('keeps the previous snapshot when commitIfChanged sees no change', () => {
      const store = new Counter()
      const before = store.getState()
      const listener = vi.fn()
      store.subscribe(listener)
      store.rename('ignored by the views')
      expect(listener).not.toHaveBeenCalled()
      expect(store.getState()).toBe(before)
    })
  })

  // L3: N/A — the store has no input to reject.

  describe('unmanaged errors', () => {
    it('still notifies after a batch whose callback throws', () => {
      const store = new Counter()
      const listener = vi.fn()
      store.subscribe(listener)
      expect(() =>
        store.batch(() => {
          store.increment()
          throw new Error('boom')
        })
      ).toThrow('boom')
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('edge cases', () => {
    it('stops notifying after unsubscribe, and after clearStore', () => {
      const store = new Counter()
      const a = vi.fn()
      const b = vi.fn()
      const offA = store.subscribe(a)
      store.subscribe(b)
      offA()
      store.reset()
      store.increment()
      expect(a).not.toHaveBeenCalled()
      expect(b).not.toHaveBeenCalled()
    })

    it('does not notify for a batch with no mutation', () => {
      const store = new Counter()
      const listener = vi.fn()
      store.subscribe(listener)
      store.batch(() => undefined)
      expect(listener).not.toHaveBeenCalled()
    })
  })
})
