// Types shared by every behaviour service.

/**
 * Minimal subset of a keyboard event. Keeps the service DOM-free (testable in plain Node) and
 * accepts any framework's keyboard event as well as a native one.
 */
export interface KeyboardLike {
  /** The `KeyboardEvent.key` value. */
  key: string
  /** Called when the service consumes the key. */
  preventDefault?: () => void
  /** Modifier state: a modified key is a browser / AT shortcut and is never consumed. */
  altKey?: boolean
  /** See `altKey`. */
  ctrlKey?: boolean
  /** See `altKey`. */
  metaKey?: boolean
  /** Enlarges a step where the service supports it (e.g. ×10 on a colour channel). */
  shiftKey?: boolean
}

/**
 * DOM attributes in their DOM spelling (`tabindex`, `aria-*`), with **presence semantics**: a value
 * means "set the attribute to this string", `undefined` means "omit it" — so a boolean attribute is
 * `''` when on and `undefined` when off. Strings and numbers only, because a boolean `false` is
 * written as the string `"false"` by `setAttribute` and attribute bindings, which keeps the
 * attribute present. Adapters apply them as-is; React needs its own mapping (`toReactAttributes`).
 *
 * **`value` on an input is a property, not an attribute**: once the user has edited a field, its
 * `value` attribute only sets the default and no longer moves what is displayed. Bind `value`
 * (and `checked`) as a DOM property — React's prop, Vue's `:value`, Angular's `[value]`, Stencil's
 * JSX — never through a raw `setAttribute` loop.
 */
export type DomAttributes = Record<string, string | number | undefined>

/** Text direction — decides which horizontal arrow means "next" / "more". */
export type Direction = 'ltr' | 'rtl'

/** Listener notified with each new snapshot of a service. */
export type Listener<S> = (snapshot: S) => void

/**
 * The contract every behaviour service fulfils, and all an adapter subscribes to: an immutable
 * snapshot, memoised until a change, plus a subscription. Depend on this — not on a concrete
 * service — to plug in a stub or a mock.
 */
export interface ExternalStore<S> {
  /** The current snapshot; the same reference until something changes. */
  getState: () => S
  /** Subscribes to changes; returns the unsubscribe function. */
  subscribe: (listener: Listener<S>) => () => void
}
