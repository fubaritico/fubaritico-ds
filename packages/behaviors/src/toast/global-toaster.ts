import { createToaster } from './toast-machine.js'

import type { ToastMachine } from './toast-machine.js'

/**
 * Version of the shared slot's contract. Two bundles of the design system (two micro-frontends)
 * share the slot only when they agree on it; bump it on any change of {@link SHARED_METHODS} or of
 * their signatures.
 */
export const GLOBAL_TOASTER_VERSION = 1

/** The `uid` of the page's toaster — the namespace of its generated ids. */
export const GLOBAL_TOASTER_UID = 'ui-toaster'

/**
 * The key of the shared slot on `globalThis`. A registered symbol: every copy of this package —
 * one per micro-frontend bundle — resolves the same one, where a module-level variable would make
 * one stack per copy.
 */
const SLOT = Symbol.for('@fubaritico/toaster')

/**
 * What every bundle may do with the page's toaster — the whole machine but `destroy`, which would
 * empty the stack and drop the subscriptions of every other bundle.
 */
const SHARED_METHODS = [
  'show',
  'dismiss',
  'dismissAll',
  'pause',
  'resume',
  'setOptions',
  'getState',
  'subscribe',
  'batch',
  'handleKeydown',
  'handleToastKeydown',
  'announce',
  'regionRemounted',
  'regionAttrs',
  'toastAttrs',
  'titleAttrs',
  'descriptionAttrs',
  'closeButtonAttrs',
  'announcerAttrs',
] as const

/** A name of {@link SHARED_METHODS}. */
type SharedMethod = (typeof SHARED_METHODS)[number]

/**
 * The page's toaster as every bundle sees it — {@link SHARED_METHODS}, no `destroy`, at run time as
 * well as in the types: the slot holds this facade, never the machine. An adapter that unmounts
 * only unsubscribes.
 */
export type SharedToaster<C> = Pick<ToastMachine<C>, SharedMethod>

/** What the slot holds. */
interface GlobalSlot {
  /** The contract version of the copy that created it. */
  version: number
  /** The facade of the shared machine. Its custom content is labelled by framework (`kind`). */
  toaster: SharedToaster<unknown>
}

/**
 * Builds the facade: each shared method bound to the machine, nothing else reachable.
 *
 * @param machine - The machine to share.
 * @returns A frozen object exposing {@link SHARED_METHODS} only.
 */
function facadeOf(machine: ToastMachine<unknown>): SharedToaster<unknown> {
  const facade = Object.fromEntries(
    SHARED_METHODS.map((name) => {
      const method = machine[name] as (...args: unknown[]) => unknown
      return [name, method.bind(machine)]
    })
  ) as SharedToaster<unknown>
  return Object.freeze(facade)
}

/**
 * Whether a value found in the slot is one a copy of this package wrote: a version number and a
 * toaster exposing every shared method. Checked by shape, not `instanceof` — each bundle has its
 * own copy of the class.
 *
 * @param value - What the slot holds.
 * @returns `true` when it can be used as {@link GlobalSlot}.
 */
function isGlobalSlot(value: unknown): value is GlobalSlot {
  if (typeof value !== 'object' || value === null) return false
  const { version, toaster } = value as Record<string, unknown>
  if (typeof version !== 'number') return false
  if (typeof toaster !== 'object' || toaster === null) return false
  const methods = toaster as Record<string, unknown>
  return SHARED_METHODS.every((name) => typeof methods[name] === 'function')
}

/**
 * The application-wide toaster — ONE stack per page, whichever bundle asks first creates it. This
 * is the only place the toast reaches a global: the machine itself stays instanceable
 * (`createToaster`) and every adapter takes an injected one.
 *
 * Configure it through `setOptions` (the adapter's `<Toaster>` does, `renderer` included): a later
 * caller must not silently lose its options, so this takes none. Bundles of different frameworks
 * share it through the framework-neutral `message`; free content (`custom`) is rendered by its own
 * framework only.
 *
 * **Trust**: every script of the page reaches the slot (a registered symbol). A page running
 * untrusted scripts injects its own `createToaster` instead.
 *
 * @returns The shared toaster. `C` is the adapter's custom content type.
 * @throws Error when the slot holds something this package did not write, or was written by a
 *   copy on another contract version.
 */
export function getGlobalToaster<C>(): SharedToaster<C> {
  const host = globalThis as unknown as Record<symbol, unknown>
  const slot = host[SLOT]
  if (slot === undefined) {
    const toaster = facadeOf(
      createToaster<unknown>({ uid: GLOBAL_TOASTER_UID })
    )
    const created: GlobalSlot = { version: GLOBAL_TOASTER_VERSION, toaster }
    host[SLOT] = created
    return toaster as SharedToaster<C>
  }
  if (!isGlobalSlot(slot))
    throw new Error(
      `Toast: globalThis[Symbol.for('@fubaritico/toaster')] holds something that is not a ` +
        `toaster. Another script wrote to this slot; the page's toasts cannot be shared.`
    )
  if (slot.version !== GLOBAL_TOASTER_VERSION)
    throw new Error(
      `Toast: the page's toaster was created by a @fubaritico/behaviors on contract ` +
        `${String(slot.version)}, this one is on ${String(GLOBAL_TOASTER_VERSION)}. ` +
        `Align the design-system versions of the bundles sharing the page.`
    )
  return slot.toaster as SharedToaster<C>
}
