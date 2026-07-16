import { useContext, useEffect, useRef } from 'react'

import { ListboxItem } from '../Listbox'

import { MenuContext } from './MenuContext'

import type { ComponentProps, FC } from 'react'

export interface MenuItemProps
  extends Omit<
    ComponentProps<typeof ListboxItem>,
    'variant' | 'isActive' | 'isSelected' | 'ref'
  > {
  /** Unique value identifying this item, passed to onSelect */
  value: string
  /** Position index for keyboard navigation ordering */
  index: number
}

const MenuItem: FC<MenuItemProps> = ({
  value,
  disabled = false,
  children,
  index,
  className,
  ...rest
}) => {
  const context = useContext(MenuContext)
  if (!context) throw new Error('Menu.Item must be used within Menu')

  const {
    activeIndex,
    selectedValue,
    variant,
    onSelect,
    registerItem,
    unregisterItem,
    getItemId,
  } = context
  const ref = useRef<HTMLLIElement>(null)

  const isActive = activeIndex === index
  const isSelected = selectedValue === value
  const itemId = getItemId(index)

  useEffect(() => {
    registerItem(index, value, disabled)
    return () => {
      unregisterItem(index)
    }
  }, [index, value, disabled, registerItem, unregisterItem])

  useEffect(() => {
    if (isActive && ref.current && 'scrollIntoView' in ref.current) {
      ref.current.scrollIntoView({ block: 'nearest' })
    }
  }, [isActive])

  /** Selects this item on click (no-op when disabled) */
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
