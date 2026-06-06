import { createContext } from 'react'

import type { RefObject } from 'react'

/** Shared state and actions for the Typeahead compound component */
export interface TypeaheadContextValue {
  /** Whether the dropdown menu is currently visible */
  isOpen: boolean
  /** Current value of the search input */
  inputValue: string
  /** Index of the keyboard-active item (-1 when none) */
  activeIndex: number
  /** Color scheme applied to the dropdown */
  variant: 'light' | 'dark'
  /** Minimum characters before triggering search and opening menu */
  minChars: number
  /** Auto-generated DOM id linking the input to the listbox via aria-controls */
  menuId: string
  /** Opens or closes the dropdown menu */
  setIsOpen: (open: boolean) => void
  /** Updates the input value, triggers debounced search, and manages open state */
  setInputValue: (value: string) => void
  /** Sets the keyboard-active item index (-1 to clear) */
  setActiveIndex: (index: number) => void
  /** Registers a Typeahead.Item in the internal registry for keyboard navigation */
  registerItem: (index: number, value: string, disabled: boolean) => void
  /** Removes a Typeahead.Item from the registry on unmount */
  unregisterItem: (index: number) => void
  /** Generates a unique DOM id for a Typeahead.Item (used by aria-activedescendant) */
  getItemId: (index: number) => string
  /** Selects an item by value, closes the menu, and optionally clears the input */
  selectItem: (value: string) => void
  /** Moves the active index in the given direction, skipping disabled items */
  navigateItems: (direction: 'down' | 'up' | 'first' | 'last') => void
  /** Returns the item entry at the given index, or undefined if not registered */
  getActiveEntry: (
    index: number
  ) => { value: string; disabled: boolean } | undefined
  /** Whether the dropdown renders in a Portal (avoids overflow clipping) */
  portal: boolean
  /** Ref to the root wrapper div (used for click-outside detection) */
  rootRef: RefObject<HTMLDivElement | null>
  /** Ref to the input element (used for portal menu positioning) */
  inputRef: RefObject<HTMLInputElement | null>
}

export const TypeaheadContext = createContext<TypeaheadContextValue | null>(
  null
)
