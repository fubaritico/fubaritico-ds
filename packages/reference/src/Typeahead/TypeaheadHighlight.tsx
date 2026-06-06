import clsx from 'clsx'
import { useContext, useMemo } from 'react'

import { TypeaheadContext } from './TypeaheadContext'

import type { FC } from 'react'

/** Props for Typeahead.Highlight */
export interface TypeaheadHighlightProps {
  /** The text to highlight matching characters in */
  children: string
  /** Additional CSS class names */
  className?: string
}

/** Escapes special regex characters in a string */
const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Highlights the portion of text matching the current search query.
 *
 * Splits the text on the query (case-insensitive) and wraps matched
 * segments in `<mark>` with bold styling. Preserves original casing.
 *
 * Must be used within a `<Typeahead>` provider.
 */
const TypeaheadHighlight: FC<TypeaheadHighlightProps> = ({
  children,
  className,
}) => {
  const context = useContext(TypeaheadContext)
  if (!context)
    throw new Error('Typeahead.Highlight must be used within Typeahead')

  const { inputValue } = context
  const query = inputValue.trim()

  const parts = useMemo(() => {
    if (!query) return [children]
    return children.split(new RegExp(`(${escapeRegex(query)})`, 'gi'))
  }, [children, query])

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className={clsx(
              'ui:bg-transparent ui:font-extrabold ui:text-inherit'
            )}
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  )
}

export default TypeaheadHighlight
