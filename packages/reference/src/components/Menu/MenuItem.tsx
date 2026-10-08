import { useEffect, useRef } from 'react'

import { ListboxItem } from '../Listbox'

import { useMenuContext } from './MenuContext'

import type { ComponentProps } from 'react'

/** Props of {@link MenuItem}. */
export interface MenuItemProps
  extends Omit<
    ComponentProps<typeof ListboxItem>,
    'variant' | 'isActive' | 'isSelected'
  > {
  /** Unique value identifying this item; handed to the Menu's `onSelect`. */
  value: string
  /** Position of the item in the keyboard-navigation order. */
  index: number
}

/**
 * A single Menu entry — the visual {@link ListboxItem} wired to the parent Menu's keyboard cursor.
 *
 * Registers itself with the Menu on mount so arrow-key traversal can reach it, and scrolls itself
 * into view when it becomes the active descendant. Must be rendered inside a `<Menu>`.
 *
 * @param props - {@link MenuItemProps}.
 * @param props.value - Value reported to the Menu's `onSelect`.
 * @param props.index - Position in the keyboard-navigation order.
 * @param props.disabled - Non-interactive item; skipped by keyboard traversal.
 * @returns The rendered menu item.
 */
export function MenuItem({
  value,
  disabled = false,
  children,
  index,
  className,
  ...rest
}: Readonly<MenuItemProps>) {
  const {
    activeIndex,
    selectedValue,
    variant,
    onSelect,
    registerItem,
    unregisterItem,
    getItemId,
  } = useMenuContext()

  // Kept for `scrollIntoView` only — the Menu drives focus via `aria-activedescendant`, so the item
  // itself is never focused.
  const ref = useRef<HTMLLIElement>(null)

  const isActive = activeIndex === index
  const isSelected = selectedValue === value
  const itemId = getItemId(index)

  // Publish this item to the Menu's navigation registry, and withdraw it on unmount so a removed
  // item can never be reached by an arrow key.
  useEffect(() => {
    registerItem(index, value, disabled)

    return () => {
      unregisterItem(index)
    }
  }, [index, value, disabled, registerItem, unregisterItem])

  // Keep the keyboard cursor visible inside the scrollable list as it moves.
  useEffect(() => {
    if (isActive && ref.current && 'scrollIntoView' in ref.current) {
      ref.current.scrollIntoView({ block: 'nearest' })
    }
  }, [isActive])

  /** Selects this item on click (a no-op while disabled). */
  const handleClick = () => {
    if (!disabled) onSelect(value)
  }

  return (
    <ListboxItem
      ref={ref}
      id={itemId}
      variant={variant}
      isActive={isActive}
      isSelected={isSelected}
      disabled={disabled}
      aria-selected={isSelected}
      data-active={isActive || undefined}
      className={className}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </ListboxItem>
  )
}

export default MenuItem
