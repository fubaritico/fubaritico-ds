import clsx from 'clsx'

import { useTabsContext } from './TabsContext'

import type { HTMLAttributes, ReactNode } from 'react'

export interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Value that identifies this panel (must match a Tabs.Trigger value) */
  value: string
  /** Panel content */
  children: ReactNode
}

/**
 * Tabpanel for Tabs component.
 * Automatically hidden/shown based on active tab value.
 * Provides proper ARIA attributes for accessibility.
 */
function TabsPanel({ value, children, ...rest }: Readonly<TabsPanelProps>) {
  const { value: activeValue, prefix } = useTabsContext()
  const isActive = value === activeValue

  const getTabId = (val: string) =>
    prefix ? `tab-${prefix}-${val}` : `tab-${val}`
  const getTabPanelId = (val: string) =>
    prefix ? `tabpanel-${prefix}-${val}` : `tabpanel-${val}`

  return (
    <div
      role="tabpanel"
      id={getTabPanelId(value)}
      aria-labelledby={getTabId(value)}
      hidden={!isActive}
      {...rest}
      className={clsx('ui:mt-4', rest.className)}
    >
      {children}
    </div>
  )
}

export default TabsPanel
