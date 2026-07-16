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
  const state: ListboxItemState = disabled
    ? 'default'
    : isActive
      ? 'active'
      : isSelected
        ? 'selected'
        : 'default'

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
