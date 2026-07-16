import clsx from 'clsx'
import { useState } from 'react'

import { TabsContext } from './TabsContext'
import TabsList from './TabsList'
import TabsPanel from './TabsPanel'
import TabsTrigger from './TabsTrigger'

import type { HTMLAttributes } from 'react'

/** Tabs visual variant */
export type TabsVariant = 'underline' | 'pills'

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  /** Default active tab value (uncontrolled) */
  defaultValue?: string
  /** Controlled active tab value */
  value?: string
  /** Callback when tab changes */
  onValueChange?: (value: string) => void
  /** Visual variant */
  variant?: TabsVariant
  /** Optional prefix for ID generation (e.g., "popular" generates ids: popular-{value}) */
  prefix?: string
}

/**
 * Tabs component for navigation between content sections.
 * Implements ARIA tabs pattern for accessibility.
 * Supports underline and pills variants.
 * Uses Compound Component pattern.
 */
function Tabs({
  defaultValue = '',
  value,
  onValueChange,
  variant = 'underline',
  prefix,
  className,
  children,
  ...rest
}: Readonly<TabsProps>) {
  const [internalValue, setInternalValue] = useState(defaultValue)

  const activeValue = value ?? internalValue
  const isControlled = value !== undefined

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider
      value={{
        value: activeValue,
        onValueChange: handleValueChange,
        variant,
        prefix,
      }}
    >
      <div className={clsx('ui:w-full', className)} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

Tabs.List = TabsList
Tabs.Trigger = TabsTrigger
Tabs.Panel = TabsPanel

export default Tabs
