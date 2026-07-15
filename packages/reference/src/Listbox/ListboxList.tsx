import clsx from 'clsx'

import { listboxVariants } from '@fubaritico-ds/variants'

import type { ListboxVariant } from '@fubaritico-ds/variants'
import type { ComponentProps } from 'react'

/** Props for the visual listbox container. */
export interface ListboxListProps extends ComponentProps<'ul'> {
  /** Colour scheme for the dropdown surface; defaults to `'light'`. */
  variant?: ListboxVariant
}

/**
 * Visual `<ul>` wrapper for listbox-style dropdowns — wears the native skin (`.ui-listbox`).
 *
 * Provides the shared surface (border, shadow, scroll, light/dark colours) composed by both `Menu`
 * and `Typeahead.Menu`. Consumers add their own ARIA attributes, keyboard handling and positioning
 * via props/className.
 *
 * @param props - {@link ListboxListProps} (incl. `ref`, a React 19 prop forwarded to the `<ul>`).
 * @returns The listbox surface element.
 */
export function ListboxList({
  variant = 'light',
  className,
  children,
  ...rest
}: Readonly<ListboxListProps>) {
  return (
    <ul className={clsx(listboxVariants({ variant }), className)} {...rest}>
      {children}
    </ul>
  )
}

export default ListboxList
