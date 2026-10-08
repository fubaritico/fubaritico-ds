import clsx from 'clsx'
import { useCallback, useMemo, useRef } from 'react'

import { tabsListVariants } from '@fubaritico-ds/variants'

import { useTabsContext } from './TabsContext'
import { TabsListContext } from './TabsListContext'

import type { ComponentProps } from 'react'

/** Props of {@link TabsList}. */
export type TabsListProps = ComponentProps<'div'>

/**
 * The tab row — holds the triggers and the registry that arrow-key navigation walks.
 *
 * Must be rendered inside a `<Tabs>`.
 *
 * @param props - {@link TabsListProps}.
 * @returns The rendered `role="tablist"` row.
 */
export function TabsList({ className, children, ...rest }: Readonly<TabsListProps>) {
  const { variant } = useTabsContext()
  const triggersRef = useRef<string[]>([])
  const disabledRef = useRef<Set<string>>(new Set())

  /**
   * Adds a trigger to the navigation registry, recording whether it is skippable.
   *
   * @param value - The trigger's value.
   * @param disabled - Whether arrow-key traversal should skip it.
   */
  const registerTrigger = useCallback((value: string, disabled?: boolean) => {
    if (!triggersRef.current.includes(value)) triggersRef.current.push(value)

    if (disabled) disabledRef.current.add(value)
    else disabledRef.current.delete(value)
  }, [])

  /**
   * Removes a trigger from the registry, so an unmounted tab is unreachable.
   *
   * @param value - The trigger's value.
   */
  const unregisterTrigger = useCallback((value: string) => {
    triggersRef.current = triggersRef.current.filter((v) => v !== value)
    disabledRef.current.delete(value)
  }, [])

  /**
   * Lists the registered trigger values, in mount order.
   *
   * @returns The ordered trigger values.
   */
  const getTriggers = useCallback(() => triggersRef.current, [])

  /**
   * Reports whether a trigger is skippable.
   *
   * @param value - The trigger's value.
   * @returns `true` when the trigger is disabled.
   */
  const isDisabled = useCallback(
    (value: string) => disabledRef.current.has(value),
    []
  )

  // The registry lives in refs, so this value is referentially stable for the whole mount.
  const contextValue = useMemo(
    () => ({ registerTrigger, unregisterTrigger, getTriggers, isDisabled }),
    [registerTrigger, unregisterTrigger, getTriggers, isDisabled]
  )

  return (
    <TabsListContext value={contextValue}>
      <div
        className={clsx(tabsListVariants({ variant }), className)}
        role="tablist"
        {...rest}
      >
        {children}
      </div>
    </TabsListContext>
  )
}

export default TabsList
