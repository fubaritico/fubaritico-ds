import { useContext } from 'react'

import { Input } from '../Input'

import { TypeaheadContext } from './TypeaheadContext'

import type { ChangeEvent, ComponentProps, FC, KeyboardEvent } from 'react'

/**
 * Props for Typeahead.Input.
 *
 * Derives from Input, omitting props managed by Typeahead context.
 */
export type TypeaheadInputProps = Omit<
  ComponentProps<typeof Input>,
  'value' | 'onChange' | 'role'
>

/**
 * Combobox input for the Typeahead compound component.
 *
 * Wraps the base Input component, wiring it to Typeahead context for
 * controlled value, keyboard navigation (ArrowUp/Down, Home/End, Enter,
 * Escape), and ARIA combobox attributes. Opens the menu on focus/click
 * when the input has a value.
 *
 * Must be used within a `<Typeahead>` provider.
 */
const TypeaheadInput: FC<TypeaheadInputProps> = (props) => {
  const context = useContext(TypeaheadContext)
  if (!context) throw new Error('Typeahead.Input must be used within Typeahead')

  const {
    isOpen,
    inputValue,
    activeIndex,
    minChars,
    menuId,
    setIsOpen,
    setInputValue,
    setActiveIndex,
    navigateItems,
    getActiveEntry,
    selectItem,
    getItemId,
    inputRef,
  } = context

  const activeDescendant = activeIndex >= 0 ? getItemId(activeIndex) : undefined

  /** Forwards input changes to the Typeahead context (triggers search + open/close) */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  /**
   * Handles keyboard navigation within the combobox.
   *
   * - ArrowDown: opens menu if closed, moves active index down (wraps)
   * - ArrowUp: moves active index up (wraps)
   * - Home/End: jumps to first/last enabled item
   * - Enter: selects the active item
   * - Escape: closes the menu and resets active index
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          navigateItems('first')
        } else {
          navigateItems('down')
        }
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        if (isOpen) navigateItems('up')
        break
      }
      case 'Home': {
        if (isOpen) {
          e.preventDefault()
          navigateItems('first')
        }
        break
      }
      case 'End': {
        if (isOpen) {
          e.preventDefault()
          navigateItems('last')
        }
        break
      }
      case 'Enter': {
        if (isOpen && activeIndex >= 0) {
          e.preventDefault()
          const entry = getActiveEntry(activeIndex)
          if (entry && !entry.disabled) selectItem(entry.value)
        }
        break
      }
      case 'Escape': {
        if (isOpen) {
          e.preventDefault()
          setIsOpen(false)
          setActiveIndex(-1)
        }
        break
      }
    }
  }

  /** Reopens the dropdown on focus or click when the input contains text */
  const handleOpen = () => {
    if (inputValue.trim().length >= minChars) setIsOpen(true)
  }

  return (
    <Input
      {...props}
      ref={inputRef}
      value={inputValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleOpen}
      onClick={handleOpen}
      role="combobox"
      aria-expanded={isOpen}
      aria-controls={isOpen ? menuId : undefined}
      aria-activedescendant={activeDescendant}
      aria-autocomplete="list"
      autoComplete="off"
    />
  )
}

export default TypeaheadInput
