import { createContext, use, useSyncExternalStore } from 'react'

import type { TabsService, TabsSnapshot } from '@fubaritico-ds/behaviors'
import type { TabsVariant } from '@fubaritico-ds/variants'

/** What `<Tabs>` hands down to its parts. */
interface TabsContextValue {
  /** The behaviour service — state, keyboard, focus and ARIA live there. */
  service: TabsService
  /** Visual look, inherited by the list and triggers. */
  variant: TabsVariant
}

/** What {@link useTabsController} returns. */
export interface TabsController {
  /** The live snapshot; the calling component re-renders when it changes. */
  state: TabsSnapshot
  /** The service's imperative API (`setActive`, `focusNext`…). */
  service: TabsService
}

/**
 * Carries the service INSTANCE, not its state: state travels through the subscription, so a
 * selection change re-renders the subscribed parts only, never the whole subtree.
 */
export const TabsContext = createContext<TabsContextValue | null>(null)

/**
 * Reads the surrounding `<Tabs>`.
 *
 * @returns The service and the variant.
 * @throws Error when used outside `<Tabs>`.
 */
export function useTabsContext(): TabsContextValue {
  const context = use(TabsContext)
  if (!context) {
    throw new Error('Tabs compound components must be used within <Tabs>')
  }
  return context
}

/**
 * Subscribes to the service's whole snapshot. `getState` is pure and DOM-free, so it doubles as the
 * server snapshot.
 *
 * @param service - The tabs service.
 * @returns The current snapshot.
 */
export function useTabsSnapshot(service: TabsService): TabsSnapshot {
  return useSyncExternalStore(
    service.subscribe,
    service.getState,
    service.getState
  )
}

/**
 * Subscribes to one slice of the snapshot: the component re-renders only when the slice changes.
 * The selector MUST return a primitive — a fresh object would differ on every read and make React
 * re-render forever.
 *
 * @param service - The tabs service.
 * @param select - Picks a primitive out of the snapshot.
 * @returns The selected slice.
 */
export function useTabsSelector<T extends string | number | boolean | null>(
  service: TabsService,
  select: (snapshot: TabsSnapshot) => T
): T {
  const read = () => select(service.getState())
  return useSyncExternalStore(service.subscribe, read, read)
}

/**
 * Escape hatch to drive the tabs from a sibling inside `<Tabs>` (a toolbar, a shortcut…).
 *
 * @returns The snapshot and the service.
 * @throws Error when used outside `<Tabs>`.
 */
export function useTabsController(): TabsController {
  const { service } = useTabsContext()
  const state = useTabsSnapshot(service)
  return { state, service }
}
