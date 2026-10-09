import clsx from 'clsx'

import { typeaheadEmptyVariants } from '@fubaritico/variants'

import { useTypeaheadContext } from './TypeaheadContext'

import type { ComponentProps } from 'react'

/** Props of {@link TypeaheadEmpty}. */
export type TypeaheadEmptyProps = Omit<ComponentProps<'li'>, 'role'>

/**
 * The "no results" row of the Typeahead dropdown.
 *
 * Renders a non-selectable `<li role="option" aria-disabled>` so the list keeps a valid listbox
 * structure while telling assistive technology the row cannot be chosen. The colour scheme follows
 * the surrounding Typeahead.
 *
 * Must be rendered inside a `<Typeahead>`, within `Typeahead.Menu`.
 *
 * @param props - {@link TypeaheadEmptyProps}.
 * @returns The rendered empty row.
 */
export function TypeaheadEmpty({
  children,
  className,
  ...rest
}: Readonly<TypeaheadEmptyProps>) {
  const { variant } = useTypeaheadContext('Typeahead.Empty')

  return (
    <li
      role="option"
      aria-disabled="true"
      aria-selected={false}
      className={clsx(typeaheadEmptyVariants({ variant }), className)}
      {...rest}
    >
      {children}
    </li>
  )
}

export default TypeaheadEmpty
