import { createContext, useContext } from 'react'

import type { TabsVariant } from './Tabs'

interface TabsContextValue {
  /** Currently active tab value */
  value: string
  /** Change active tab */
  onValueChange: (value: string) => void
  /** Visual variant */
  variant: TabsVariant
  /** Optional prefix for ID generation */
  prefix?: string
}

export const TabsContext = createContext<TabsContextValue | undefined>(
  undefined
)

export const useTabsContext = () => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs compound components must be used within <Tabs>')
  }
  return context
}
