import clsx from 'clsx'
import { useCallback, useMemo, useState } from 'react'

import { TABS_CLASS } from '@fubaritico-ds/variants'

import { TabsContext } from './TabsContext'
import { TabsList } from './TabsList'
import { TabsPanel } from './TabsPanel'
import { TabsTrigger } from './TabsTrigger'

import type { TabsVariant } from '@fubaritico-ds/variants'
import type { ComponentProps } from 'react'

export type { TabsVariant } from '@fubaritico-ds/variants'

/** Props of the {@link Tabs} root. */
export interface TabsProps extends ComponentProps<'div'> {
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
 * Tabs — switches between sibling panels, following the ARIA tabs pattern.
 *
 * Works controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`). Composes
 * `Tabs.List`, `Tabs.Trigger` and `Tabs.Panel`; the list owns roving focus and the arrow keys.
 *
 * @param props - {@link TabsProps}.
 * @param props.defaultValue - Initially selected tab when uncontrolled.
 * @param props.value - Selected tab when controlled.
 * @param props.onValueChange - Called with the newly selected tab's value.
 * @param props.variant - Visual look; defaults to `'underline'`.
 * @param props.prefix - Namespaces the generated tab/panel ids, for several Tabs on one page.
 * @returns The rendered tabs root.
 */
export function Tabs({
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

  // Stable so the memoised context value does not change on every parent render.
  const handleValueChange = useCallback(
    (newValue: string) => {
      if (!isControlled) setInternalValue(newValue)
      onValueChange?.(newValue)
    },
    [isControlled, onValueChange]
  )

  // Memoised so switching a tab does not re-render every trigger through an identity change.
  const contextValue = useMemo(
    () => ({
      value: activeValue,
      onValueChange: handleValueChange,
      variant,
      prefix,
    }),
    [activeValue, handleValueChange, variant, prefix]
  )

  return (
    <TabsContext value={contextValue}>
      <div className={clsx(TABS_CLASS, className)} {...rest}>
        {children}
      </div>
    </TabsContext>
  )
}

Tabs.List = TabsList
Tabs.Trigger = TabsTrigger
Tabs.Panel = TabsPanel

export default Tabs
