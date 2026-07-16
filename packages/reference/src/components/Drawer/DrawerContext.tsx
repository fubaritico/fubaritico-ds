import { createContext, useContext } from 'react'

/** Color scheme for the Drawer */
export type DrawerVariant = 'light' | 'dark'

/** Shared state for Drawer compound sub-components */
export interface DrawerContextValue {
  variant: DrawerVariant
  onClose: () => void
}

export const DrawerContext = createContext<DrawerContextValue | null>(null)

/**
 * Accesses the Drawer compound context.
 *
 * @throws If used outside a `<Drawer>` provider.
 */
export const useDrawerContext = () => {
  const context = useContext(DrawerContext)
  if (!context)
    throw new Error('Drawer subcomponents must be used within Drawer')
  return context
}
