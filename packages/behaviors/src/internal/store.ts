import type { ExternalStore, Listener } from '../common/types.js'

/**
 * The store mechanics every behaviour service shares: subscribers, a memoised immutable snapshot,
 * change notification and batching. A service extends it, builds its snapshot in
 * `createSnapshot`, and calls `commit` after each mutation. Internal — not part of the public API.
 */
export abstract class Store<S> implements ExternalStore<S> {
  private readonly listeners = new Set<Listener<S>>()
  /** Memoised snapshot, invalidated by `commit`. */
  private cache: S | null = null
  /** Depth of nested `batch` calls, and whether a notification waits for the outermost one. */
  private depth = 0
  private queued = false

  /**
   * Returns the current snapshot — the same reference until something changes. An arrow function so
   * the reference is stable and can be handed straight to a framework's store subscription.
   *
   * @returns The immutable snapshot.
   */
  getState = (): S => {
    this.cache ??= this.createSnapshot()
    return this.cache
  }

  /**
   * Subscribes to snapshot changes.
   *
   * @param listener - Called with each new snapshot.
   * @returns The unsubscribe function, for the framework's cleanup.
   */
  subscribe = (listener: Listener<S>): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Groups mutations into a single notification.
   *
   * @param fn - The mutations to run.
   * @returns Whatever `fn` returns.
   */
  batch<T>(fn: () => T): T {
    this.depth++
    try {
      return fn()
    } finally {
      this.depth--
      if (this.depth === 0 && this.queued) {
        this.queued = false
        this.notify()
      }
    }
  }

  /**
   * Builds a fresh snapshot from the service's private state.
   *
   * @returns The snapshot to memoise.
   */
  protected abstract createSnapshot(): S

  /** Invalidates the snapshot and notifies, unless a batch is in progress. */
  protected commit(): void {
    this.cache = null
    if (this.depth > 0) {
      this.queued = true
      return
    }
    this.notify()
  }

  /**
   * Commits only when the snapshot differs from `before`; otherwise keeps `before` as the memoised
   * snapshot, so a no-op mutation costs no re-render.
   *
   * @param before - The snapshot taken before the mutation.
   * @param changed - Decides whether `after` differs in a way the views read.
   */
  protected commitIfChanged(
    before: S,
    changed: (before: S, after: S) => boolean
  ): void {
    this.cache = null
    if (changed(before, this.getState())) this.commit()
    else this.cache = before
  }

  /** Drops every subscriber and the memoised snapshot. The instance stays usable. */
  protected clearStore(): void {
    this.listeners.clear()
    this.cache = null
  }

  /** Sends the current snapshot to every listener. */
  private notify(): void {
    const snapshot = this.getState()
    this.listeners.forEach((listener) => {
      listener(snapshot)
    })
  }
}
