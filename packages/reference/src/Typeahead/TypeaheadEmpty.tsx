import clsx from 'clsx'
import { useContext } from 'react'

import { TypeaheadContext } from './TypeaheadContext'

import type { FC, PropsWithChildren } from 'react'

/** Props for Typeahead.Empty */
export interface TypeaheadEmptyProps {
  /** Additional CSS class names */
  className?: string
}

/**
 * Empty state placeholder for the Typeahead dropdown.
 *
 * Renders a disabled `<li role="option">` with centered text, used when
 * no search results match the query. Styled with light/dark variant
 * from context.
 *
 * Must be used within a `<Typeahead>` provider (inside `Typeahead.Menu`).
 */
const TypeaheadEmpty: FC<PropsWithChildren<TypeaheadEmptyProps>> = ({
  children,
  className,
}) => {
  const context = useContext(TypeaheadContext)
  if (!context) throw new Error('Typeahead.Empty must be used within Typeahead')

  const isDark = context.variant === 'dark'

  return (
    <li
      role="option"
      aria-disabled="true"
      className={clsx(
        'ui:select-none ui:px-3 ui:py-2 ui:text-center ui:text-sm ui:font-roboto',
        isDark ? 'ui:text-neutral-400' : 'ui:text-muted-foreground',
        className
      )}
    >
      {children}
    </li>
  )
}

export default TypeaheadEmpty
