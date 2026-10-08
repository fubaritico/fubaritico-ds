import { useEffect, useRef } from 'react'

import { ListboxItem } from '../Listbox'

import { useTypeaheadContext } from './TypeaheadContext'

import type { ComponentProps } from 'react'

/**
 * Props for Typeahead.Item.
 *
 * Derives from ListboxItem, omitting props managed by Typeahead context.
 */
export interface TypeaheadItemProps
  extends Omit<
    ComponentProps<typeof ListboxItem>,
    'variant' | 'isActive' | 'isSelected' | 'ref'
  > {
  /** Unique value identifying this item, passed to onSelect */
  value: string
  /** Position index for keyboard navigation ordering (must be unique per item) */
  index: number
}

/**
 * Individual option within the Typeahead dropdown.
 *
 * Composes `ListboxItem` for shared visual styling and registers itself in
 * the Typeahead item registry on mount. Supports keyboard activation (via
 * context activeIndex), mouse hover highlighting, click selection, and
 * auto-scrolling when navigated to.
 *
 * Must be used within a `<Typeahead>` provider (inside `Typeahead.Menu`).
 */
export function TypeaheadItem({
  value,
  disabled = false,
  children,
  index,
  className,
  ...rest
}: Readonly<TypeaheadItemProps>) {
  const {
    activeIndex,
    variant,
    selectItem,
    registerItem,
    unregisterItem,
    getItemId,
    setActiveIndex,
  } = useTypeaheadContext('Typeahead.Item')
  const isActive = activeIndex === index
  const itemId = getItemId(index)
  const ref = useRef<HTMLLIElement>(null)

  // Publish this item so keyboard traversal can reach it, and withdraw it on unmount so a filtered
  // -out suggestion can never be selected by an arrow key.
  useEffect(() => {
    registerItem(index, value, disabled)
    return () => {
      unregisterItem(index)
    }
  }, [index, value, disabled, registerItem, unregisterItem])

  // Keep the keyboard cursor visible inside the scrollable dropdown as it moves.
  useEffect(() => {
    if (isActive && ref.current && 'scrollIntoView' in ref.current) {
      ref.current.scrollIntoView({ block: 'nearest' })
    }
  }, [isActive])

  /** Selects this item on click (no-op when disabled) */
  const handleClick = () => {
    if (!disabled) selectItem(value)
  }

  /** Highlights this item on mouse enter (no-op when disabled) */
  const handleMouseEnter = () => {
    if (!disabled) setActiveIndex(index)
  }

  return (
    <ListboxItem
      ref={ref}
      id={itemId}
      variant={variant}
      isActive={isActive}
      disabled={disabled}
      aria-selected={isActive}
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...rest}
    >
      {children}
    </ListboxItem>
  )
}

export default TypeaheadItem
