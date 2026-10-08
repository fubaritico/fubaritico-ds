import clsx from 'clsx'
import { useEffect } from 'react'

import { tabsTriggerVariants } from '@fubaritico-ds/variants'

import { useTabsContext } from './TabsContext'
import { useTabsListContext } from './TabsListContext'

import type { ComponentProps, KeyboardEvent, ReactNode } from 'react'

/** Props of {@link TabsTrigger}. */
export interface TabsTriggerProps extends ComponentProps<'button'> {
  /** Value that identifies this tab */
  value: string
  /** Optional icon component */
  icon?: ReactNode
}

/**
 * A single tab button.
 *
 * Registers itself with the surrounding `Tabs.List` so arrow keys can reach it, and carries the
 * roving `tabIndex` that keeps exactly one tab in the tab order.
 *
 * Must be rendered inside a `<Tabs.List>`.
 *
 * @param props - {@link TabsTriggerProps}.
 * @param props.value - Value identifying the tab and its panel.
 * @param props.icon - Optional leading glyph.
 * @returns The rendered `role="tab"` button.
 */
export function TabsTrigger({
  value,
  icon,
  disabled,
  className,
  children,
  ...rest
}: Readonly<TabsTriggerProps>) {
  const {
    value: activeValue,
    onValueChange,
    variant,
    prefix,
  } = useTabsContext()
  const { registerTrigger, unregisterTrigger, getTriggers, isDisabled } =
    useTabsListContext()

  const isActive = value === activeValue

  const getTabId = (val: string) =>
    prefix ? `tab-${prefix}-${val}` : `tab-${val}`
  const getTabPanelId = (val: string) =>
    prefix ? `tabpanel-${prefix}-${val}` : `tabpanel-${val}`

  useEffect(() => {
    registerTrigger(value, disabled)
    return () => {
      unregisterTrigger(value)
    }
  }, [value, disabled, registerTrigger, unregisterTrigger])

  const handleClick = () => {
    if (!disabled) {
      onValueChange(value)
    }
  }

  const findNextEnabledTab = (
    triggers: string[],
    startIndex: number,
    direction: 1 | -1
  ): number => {
    const length = triggers.length
    let index = startIndex

    for (let i = 0; i < length; i++) {
      index = (index + direction + length) % length
      if (!isDisabled(triggers[index])) {
        return index
      }
    }
    return startIndex
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return

    const triggers = getTriggers()
    const currentIndex = triggers.indexOf(value)
    let newIndex = currentIndex

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        newIndex = findNextEnabledTab(triggers, currentIndex, -1)
        break
      case 'ArrowRight':
        event.preventDefault()
        newIndex = findNextEnabledTab(triggers, currentIndex, 1)
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        while (newIndex < triggers.length && isDisabled(triggers[newIndex])) {
          newIndex++
        }
        break
      case 'End':
        event.preventDefault()
        newIndex = triggers.length - 1
        while (newIndex >= 0 && isDisabled(triggers[newIndex])) {
          newIndex--
        }
        break
      default:
        return
    }

    const newValue = triggers[newIndex]
    if (newValue && newValue !== value) {
      onValueChange(newValue)
    }
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive ? 'true' : 'false'}
      aria-controls={getTabPanelId(value)}
      id={getTabId(value)}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      className={clsx(
        tabsTriggerVariants({ variant, active: isActive }),
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}

export default TabsTrigger
