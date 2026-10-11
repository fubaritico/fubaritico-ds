import { useCallback, useId, useMemo, useRef, useState } from 'react'

import { ListboxList } from '../Listbox'

import { MenuContext } from './MenuContext'
import { MenuItem } from './MenuItem'

import type { MenuVariant } from './MenuContext'
import type { ComponentProps, KeyboardEvent } from 'react'

export interface MenuProps
  extends Omit<ComponentProps<typeof ListboxList>, 'onSelect'> {
  /** Currently selected item value (controls aria-selected highlight) */
  selectedValue?: string
  /** Color scheme: light (default) or dark */
  variant?: MenuVariant
  /** Called when an item is selected via click or keyboard */
  onSelect?: (value: string) => void
  /** Called when Escape is pressed */
  onClose?: () => void
  /**
   * Item `index` the keyboard cursor starts on — the selected option, so a listbox focused on open
   * announces it and Enter confirms it. Read at mount; defaults to none (`-1`).
   */
  defaultActiveIndex?: number
}

/** One entry of the keyboard-navigation registry. */
interface ItemEntry {
  /** Value reported to `onSelect` when the entry is chosen. */
  value: string
  /** Whether the entry is skipped by arrow-key traversal. */
  disabled: boolean
}

/**
 * Menu — a keyboard-navigable popup list, composing the {@link ListboxList} surface.
 *
 * Owns the ARIA and keyboard model the visual Listbox primitives deliberately leave out: the list
 * itself is focusable and drives a virtual cursor through `aria-activedescendant`, so focus never
 * leaves it while arrowing. Items register themselves through the context, so disabled entries are
 * skipped and traversal follows the declared `index` order.
 *
 * Keyboard: Arrow Up/Down (wrapping), Home, End, Enter/Space to select, Escape to close.
 *
 * @param props - {@link MenuProps}.
 * @param props.selectedValue - Value of the persistently selected item.
 * @param props.variant - Colour scheme; forwarded to the list AND to every item.
 * @param props.onSelect - Called with the item value on click or Enter/Space.
 * @param props.onClose - Called when Escape is pressed.
 * @param props.defaultActiveIndex - Item index the keyboard cursor starts on; read at mount.
 * @returns The rendered menu.
 */

export function Menu({
  selectedValue,
  variant = 'light',
  onSelect,
  onClose,
  defaultActiveIndex = -1,
  className,
  children,
  ...rest
}: Readonly<MenuProps>) {
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex)
  const itemsRef = useRef<Map<number, ItemEntry>>(new Map())
  const menuId = useId()

  /** Registers a Menu.Item in the internal registry for keyboard navigation */
  const registerItem = useCallback(
    (index: number, value: string, disabled: boolean) => {
      itemsRef.current.set(index, { value, disabled })
    },
    []
  )

  /** Removes a Menu.Item from the registry on unmount */
  const unregisterItem = useCallback((index: number) => {
    itemsRef.current.delete(index)
  }, [])

  /** Generates a unique DOM id for a Menu.Item (used by aria-activedescendant) */
  const getItemId = useCallback(
    (index: number) => `${menuId}-item-${String(index)}`,
    [menuId]
  )

  /** Returns sorted indices of non-disabled items for keyboard traversal */
  const getEnabledIndices = useCallback(() => {
    const entries = Array.from(itemsRef.current.entries()).sort(
      ([a], [b]) => a - b
    )
    return entries.filter(([, entry]) => !entry.disabled).map(([idx]) => idx)
  }, [])

  /** Forwards item selection to the consumer's onSelect callback */
  const handleSelect = useCallback(
    (value: string) => {
      onSelect?.(value)
    },
    [onSelect]
  )

  /** Handles Arrow, Home, End, Enter, Space, Escape keys */
  const handleKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    // Escape first: a menu with nothing enabled must still close — and consume the key, or it
    // reaches a surrounding dialog and closes that instead.
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose?.()
      return
    }

    const enabled = getEnabledIndices()
    if (enabled.length === 0) return

    const currentPos = enabled.indexOf(activeIndex)

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        const next =
          currentPos < enabled.length - 1 ? enabled[currentPos + 1] : enabled[0]
        setActiveIndex(next)
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        const prev =
          currentPos > 0 ? enabled[currentPos - 1] : enabled[enabled.length - 1]
        setActiveIndex(prev)
        break
      }
      case 'Home': {
        e.preventDefault()
        setActiveIndex(enabled[0])
        break
      }
      case 'End': {
        e.preventDefault()
        setActiveIndex(enabled[enabled.length - 1])
        break
      }
      case 'Enter':
      case ' ': {
        e.preventDefault()
        if (activeIndex >= 0) {
          const entry = itemsRef.current.get(activeIndex)
          if (entry && !entry.disabled) handleSelect(entry.value)
        }
        break
      }
    }
  }

  const activeDescendant = activeIndex >= 0 ? getItemId(activeIndex) : undefined

  const contextValue = useMemo(
    () => ({
      activeIndex,
      selectedValue,
      variant,
      onSelect: handleSelect,
      registerItem,
      unregisterItem,
      getItemId,
      menuId,
    }),
    [
      activeIndex,
      selectedValue,
      variant,
      handleSelect,
      registerItem,
      unregisterItem,
      getItemId,
      menuId,
    ]
  )

  return (
    <MenuContext value={contextValue}>
      <ListboxList
        variant={variant}
        role="listbox"
        tabIndex={0}
        aria-activedescendant={activeDescendant}
        onKeyDown={handleKeyDown}
        className={className}
        {...rest}
      >
        {children}
      </ListboxList>
    </MenuContext>
  )
}

Menu.Item = MenuItem

export default Menu
