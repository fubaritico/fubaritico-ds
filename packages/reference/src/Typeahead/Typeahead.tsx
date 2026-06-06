import clsx from 'clsx'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import { TypeaheadContext } from './TypeaheadContext'
import TypeaheadEmpty from './TypeaheadEmpty'
import TypeaheadHighlight from './TypeaheadHighlight'
import TypeaheadInput from './TypeaheadInput'
import TypeaheadItem from './TypeaheadItem'
import TypeaheadMenu from './TypeaheadMenu'

import type { HTMLAttributes, ReactNode } from 'react'

/** Internal registry entry for a single Typeahead.Item */
interface ItemEntry {
  value: string
  disabled: boolean
}

/**
 * Props for the Typeahead root component.
 *
 * Extends standard div attributes (except `onSelect` which is repurposed
 * for item selection).
 */
export interface TypeaheadProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Called with the search value (debounced if debounceMs is set) */
  onSearch?: (value: string) => void
  /** Called when an item is selected via click or keyboard */
  onSelect?: (value: string) => void
  /** Debounce delay in ms for onSearch (default: 0, no debounce) */
  debounceMs?: number
  /** Minimum characters before triggering search and opening menu (default: 2) */
  minChars?: number
  /** Whether to clear the input after selecting an item (default: true) */
  clearOnSelect?: boolean
  /** Render the dropdown in a Portal to avoid overflow clipping (default: false) */
  portal?: boolean
  /** Color scheme for the dropdown menu and items */
  variant?: 'light' | 'dark'
  /** Compound children: Typeahead.Input, Typeahead.Menu, etc. */
  children: ReactNode
}

/**
 * Typeahead compound component — search input with dropdown suggestions.
 *
 * Composes `Typeahead.Input`, `Typeahead.Menu`, `Typeahead.Item`, and
 * `Typeahead.Empty` via shared context. Implements the ARIA combobox
 * pattern with full keyboard navigation (ArrowUp/Down, Home/End,
 * Enter, Escape) and click-outside dismissal.
 *
 * @example
 * ```tsx
 * <Typeahead onSearch={handleSearch} onSelect={handleSelect} debounceMs={300}>
 *   <Typeahead.Input placeholder="Search..." icon="MagnifyingGlass" />
 *   <Typeahead.Menu>
 *     {results.map((item, i) => (
 *       <Typeahead.Item key={item.id} value={item.id} index={i}>
 *         {item.label}
 *       </Typeahead.Item>
 *     ))}
 *     {results.length === 0 && <Typeahead.Empty>No results</Typeahead.Empty>}
 *   </Typeahead.Menu>
 * </Typeahead>
 * ```
 */
function Typeahead({
  onSearch,
  onSelect,
  debounceMs = 0,
  minChars = 2,
  clearOnSelect = true,
  portal = false,
  variant = 'light',
  className,
  children,
  ...rest
}: Readonly<TypeaheadProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValueRaw] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const itemsRef = useRef<Map<number, ItemEntry>>(new Map())
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuId = useId()

  /** Invokes onSearch with optional debounce, cancelling any pending call */
  const debouncedSearch = useCallback(
    (value: string) => {
      clearTimeout(timerRef.current)
      if (debounceMs > 0) {
        timerRef.current = setTimeout(() => {
          onSearch?.(value)
        }, debounceMs)
      } else {
        onSearch?.(value)
      }
    },
    [onSearch, debounceMs]
  )

  /** Cleans up the debounce timer on unmount */
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
    }
  }, [])

  /** Closes the menu when clicking outside the root wrapper (and portal menu if portaled) */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (rootRef.current && !rootRef.current.contains(target)) {
        const portalMenu = document.getElementById(menuId)
        if (portalMenu?.contains(target)) return
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuId])

  /** Registers a Typeahead.Item in the internal registry for keyboard navigation */
  const registerItem = useCallback(
    (index: number, value: string, disabled: boolean) => {
      itemsRef.current.set(index, { value, disabled })
    },
    []
  )

  /** Removes a Typeahead.Item from the registry on unmount */
  const unregisterItem = useCallback((index: number) => {
    itemsRef.current.delete(index)
  }, [])

  /** Generates a unique DOM id for a Typeahead.Item (used by aria-activedescendant) */
  const getItemId = useCallback(
    (index: number) => `${menuId}-item-${String(index)}`,
    [menuId]
  )

  /** Updates the input value, resets active index, opens/closes menu, and triggers search */
  const setInputValue = useCallback(
    (value: string) => {
      setInputValueRaw(value)
      setActiveIndex(-1)
      if (value.trim().length >= minChars) {
        setIsOpen(true)
        debouncedSearch(value)
      } else {
        setIsOpen(false)
        onSearch?.('')
      }
    },
    [debouncedSearch, onSearch, minChars]
  )

  /** Forwards item selection to the consumer, closes menu, and optionally clears input */
  const selectItem = useCallback(
    (value: string) => {
      onSelect?.(value)
      setIsOpen(false)
      setActiveIndex(-1)
      if (clearOnSelect) setInputValueRaw('')
    },
    [onSelect, clearOnSelect]
  )

  /** Returns sorted indices of non-disabled items for keyboard traversal */
  const getEnabledIndices = useCallback(() => {
    const entries = Array.from(itemsRef.current.entries()).sort(
      ([a], [b]) => a - b
    )
    return entries.filter(([, entry]) => !entry.disabled).map(([idx]) => idx)
  }, [])

  /** Moves the active index in the given direction, wrapping at boundaries and skipping disabled items */
  const navigateItems = useCallback(
    (direction: 'down' | 'up' | 'first' | 'last') => {
      const enabled = getEnabledIndices()
      if (enabled.length === 0) return

      const currentPos = enabled.indexOf(activeIndex)

      switch (direction) {
        case 'down': {
          const next =
            currentPos < enabled.length - 1
              ? enabled[currentPos + 1]
              : enabled[0]
          setActiveIndex(next)
          break
        }
        case 'up': {
          const prev =
            currentPos > 0
              ? enabled[currentPos - 1]
              : enabled[enabled.length - 1]
          setActiveIndex(prev)
          break
        }
        case 'first':
          setActiveIndex(enabled[0])
          break
        case 'last':
          setActiveIndex(enabled[enabled.length - 1])
          break
      }
    },
    [getEnabledIndices, activeIndex]
  )

  /** Returns the item entry at the given index, or undefined if not registered */
  const getActiveEntry = useCallback((index: number) => {
    return itemsRef.current.get(index)
  }, [])

  const contextValue = useMemo(
    () => ({
      isOpen,
      inputValue,
      activeIndex,
      variant,
      minChars,
      menuId,
      setIsOpen,
      setInputValue,
      setActiveIndex,
      registerItem,
      unregisterItem,
      getItemId,
      selectItem,
      navigateItems,
      getActiveEntry,
      portal,
      rootRef,
      inputRef,
    }),
    [
      isOpen,
      inputValue,
      activeIndex,
      variant,
      minChars,
      menuId,
      portal,
      setInputValue,
      registerItem,
      unregisterItem,
      getItemId,
      selectItem,
      navigateItems,
      getActiveEntry,
    ]
  )

  return (
    <TypeaheadContext.Provider value={contextValue}>
      <div
        ref={rootRef}
        className={clsx('ui:relative ui:w-full', className)}
        {...rest}
      >
        {children}
      </div>
    </TypeaheadContext.Provider>
  )
}

Typeahead.Input = TypeaheadInput
Typeahead.Menu = TypeaheadMenu
Typeahead.Item = TypeaheadItem
Typeahead.Empty = TypeaheadEmpty
Typeahead.Highlight = TypeaheadHighlight

export default Typeahead
