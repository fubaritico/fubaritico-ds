import { createContext, use, useSyncExternalStore } from 'react'

import type { PopoverService } from '@fubaritico/behaviors'

/** What `<Popover>` hands down to its parts. */
interface PopoverContextValue {
  /** The behaviour service — open state, ids, anchor name, ARIA. */
  service: PopoverService
}

/** Carries the service instance; the open state travels through the subscription. */
export const PopoverContext = createContext<PopoverContextValue | null>(null)

/**
 * Reads the surrounding `<Popover>`.
 *
 * @returns The service.
 * @throws Error when used outside `<Popover>`.
 */
export function usePopoverContext(): PopoverContextValue {
  const context = use(PopoverContext)
  if (!context) throw new Error('Popover parts must be used within <Popover>')
  return context
}

/**
 * Subscribes to the open state — a primitive slice.
 *
 * @param service - The popover service.
 * @returns Whether the popover should be shown.
 */
export function usePopoverOpen(service: PopoverService): boolean {
  const read = () => service.getState().open
  return useSyncExternalStore(service.subscribe, read, read)
}
