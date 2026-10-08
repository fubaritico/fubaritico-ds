import { Input } from '../Input'

import { useTypeaheadContext } from './TypeaheadContext'

import type { ChangeEvent, ComponentProps, KeyboardEvent } from 'react'

/**
 * Props of {@link TypeaheadInput} — the Input props minus everything the Typeahead drives itself.
 */
export type TypeaheadInputProps = Omit<
  ComponentProps<typeof Input>,
  'value' | 'onChange' | 'role'
>

/**
 * The combobox field of the Typeahead.
 *
 * Wraps the DS {@link Input} and wires it to the surrounding Typeahead: controlled value, the ARIA
 * combobox attributes, and the keyboard model (Arrow Up/Down, Home, End, Enter, Escape). Reopens
 * the dropdown on focus or click once the query is long enough.
 *
 * Must be rendered inside a `<Typeahead>`.
 *
 * @param props - {@link TypeaheadInputProps}.
 * @returns The rendered combobox input.
 */
export function TypeaheadInput(props: Readonly<TypeaheadInputProps>) {
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
  } = useTypeaheadContext('Typeahead.Input')

  const activeDescendant = activeIndex >= 0 ? getItemId(activeIndex) : undefined

  /**
   * Forwards typing to the Typeahead, which debounces the search and opens or closes the menu.
   *
   * @param e - The input change event.
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  /**
   * Confirms the item under the keyboard cursor, if it can be selected.
   *
   * @returns Whether the key was consumed.
   */
  const confirmActiveItem = () => {
    if (!isOpen || activeIndex < 0) return false

    const entry = getActiveEntry(activeIndex)
    if (!entry || entry.disabled) return false
    selectItem(entry.value)

    return true
  }

  /**
   * The keyboard model, as a key → handler table.
   *
   * Each handler returns whether it CONSUMED the key, which is what decides `preventDefault`. A
   * table keeps every branch flat and independently readable — the previous nested `switch` carried
   * its conditions inside each case and tripped SonarCloud's cognitive-complexity ceiling.
   */
  const keyHandlers: Record<string, () => boolean> = {
    ArrowDown: () => {
      if (isOpen) {
        navigateItems('down')
      } else {
        setIsOpen(true)
        navigateItems('first')
      }

      return true
    },
    ArrowUp: () => {
      if (!isOpen) return false
      navigateItems('up')

      return true
    },
    Home: () => {
      if (!isOpen) return false
      navigateItems('first')

      return true
    },
    End: () => {
      if (!isOpen) return false
      navigateItems('last')

      return true
    },
    Enter: confirmActiveItem,
    Escape: () => {
      if (!isOpen) return false
      setIsOpen(false)
      setActiveIndex(-1)

      return true
    },
  }

  /**
   * Routes a keystroke to its handler, suppressing the browser default only when consumed.
   *
   * @param e - The keyboard event on the input.
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const consumed = keyHandlers[e.key]?.()
    if (consumed) e.preventDefault()
  }

  /** Reopens the dropdown on focus or click once the query reaches `minChars`. */
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
