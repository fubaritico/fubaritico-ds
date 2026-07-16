import { createContext, useContext } from 'react'

interface TabsListContextValue {
  /** Register a trigger with its value and disabled state */
  registerTrigger: (value: string, disabled?: boolean) => void
  /** Unregister a trigger */
  unregisterTrigger: (value: string) => void
  /** Get all registered trigger values */
  getTriggers: () => string[]
  /** Check if a trigger is disabled */
  isDisabled: (value: string) => boolean
}

export const TabsListContext = createContext<TabsListContextValue | undefined>(
  undefined
)

export const useTabsListContext = () => {
  const context = useContext(TabsListContext)
  if (!context) {
    throw new Error('TabsTrigger must be used within <Tabs.List>')
  }
  return context
}
