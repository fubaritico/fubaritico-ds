import { createContext, use } from 'react'

import type { DrawerVariant } from '@fubaritico-ds/variants'

export type { DrawerSide, DrawerSize, DrawerVariant } from '@fubaritico-ds/variants'

/** Value shared by {@link Drawer} with its regions. */
export interface DrawerContextValue {
  /** Colour scheme, so the header can pick the matching close-button variant. */
  variant: DrawerVariant
  /** Closes the drawer — wired to the header's close button. */
  onClose: () => void
}

/**
 * Context carrying {@link DrawerContextValue} to the Drawer regions.
 *
 * Read it through {@link useDrawerContext}, never directly — the hook owns the composition guard.
 */
export const DrawerContext = createContext<DrawerContextValue | null>(null)

/**
 * Reads the Drawer context, guarding the composition contract.
 *
 * `Drawer.Header`, `Drawer.Body` and `Drawer.Footer` are regions of a panel, meaningless on their
 * own, so a missing provider is a programming error: the hook THROWS rather than degrading
 * silently.
 *
 * @returns The surrounding Drawer's context value.
 * @throws If called outside a `<Drawer>`.
 */
export function useDrawerContext(): DrawerContextValue {
  // `null` means there is no surrounding <Drawer>, which is a composition error, not a mode.
  const context = use(DrawerContext)
  if (!context) throw new Error('Drawer.* must be used within <Drawer>')

  return context
}
