import clsx from 'clsx'

import { listboxItemVariants } from '@fubaritico-ds/variants'

import type { ListboxItemState, ListboxVariant } from '@fubaritico-ds/variants'
import type { ComponentProps, ReactNode } from 'react'

/** Props for the visual listbox item. */
export interface ListboxItemProps
  extends Omit<ComponentProps<'li'>, 'children'> {
  /** Colour scheme; defaults to `'light'`. */
  variant?: ListboxVariant
  /** Whether this item has keyboard/hover focus (the cursor). */
  isActive?: boolean
  /** Whether this item is the persistently selected value (Menu only). */
  isSelected?: boolean
  /** Whether the item is non-interactive. */
  disabled?: boolean
  /** Item content. */
  children: ReactNode
}

/**
 * Resolves the item's mutually-exclusive visual state from the three independent flags.
 *
 * Precedence is `disabled` > `isActive` > `isSelected`: a disabled item shows neither active nor
 * selected styling (only the dimming, applied separately), and the keyboard/hover cursor wins over
 * a persistent selection. The resolver expects a SINGLE state axis, so exactly one is returned.
 *
 * @param flags - The item's state flags.
 * @param flags.disabled - Whether the item is non-interactive.
 * @param flags.isActive - Whether the item holds the keyboard/hover cursor.
 * @param flags.isSelected - Whether the item is the persistently selected value.
 * @returns The single visual state to hand to `listboxItemVariants`.
 */
const resolveItemState = ({
  disabled,
  isActive,
  isSelected,
}: {
  disabled: boolean
  isActive: boolean
  isSelected: boolean
}): ListboxItemState => {
  if (disabled) return 'default'
  if (isActive) return 'active'
  if (isSelected) return 'selected'

  return 'default'
}

/**
 * Visual `<li>` for listbox-style items — wears the native skin (`.ui-listbox__item`).
 *
 * Provides the shared look (padding, font, active/selected/hover/disabled states) composed by both
 * `Menu.Item` and `Typeahead.Item`. Consumers add their own ARIA attributes, event handlers and ids
 * via props. `isActive` wins over `isSelected`; a `disabled` item shows neither (only the dimming).
 *
 * @param props - {@link ListboxItemProps} (incl. `ref`, forwarded to the `<li>` for `scrollIntoView`).
 * @returns The listbox item element.
 */
export function ListboxItem({
  variant = 'light',
  isActive = false,
  isSelected = false,
  disabled = false,
  className,
  children,
  ...rest
}: Readonly<ListboxItemProps>) {
  const state = resolveItemState({ disabled, isActive, isSelected })

  return (
    <li
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      className={clsx(
        listboxItemVariants({ variant, state, disabled }),
        className
      )}
      {...rest}
    >
      {children}
    </li>
  )
}

export default ListboxItem
