import { useMemo } from 'react'

import { TYPEAHEAD_MARK_CLASS } from '@fubaritico-ds/variants'

import { useTypeaheadContext } from './TypeaheadContext'

/** Props of {@link TypeaheadHighlight}. */
export interface TypeaheadHighlightProps {
  /** Text in which the current query is highlighted. */
  children: string
  /** Extra classes for the wrapping span. */
  className?: string
}

/**
 * Escapes the regex metacharacters of a user-typed query.
 *
 * The query goes straight into a `RegExp`, so an unescaped `(` or `*` would either throw or match
 * something the user never typed.
 *
 * @param str - Raw query string.
 * @returns The same string, safe to embed in a regex.
 */
const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Highlights the part of a label matching the current Typeahead query.
 *
 * Splits the text on the query (case-insensitively, original casing preserved) and wraps the
 * matches in `<mark>`. The skin conveys the match by WEIGHT, not colour, so it survives a
 * monochrome theme and does not rely on hue alone.
 *
 * Must be rendered inside a `<Typeahead>`.
 *
 * @param props - {@link TypeaheadHighlightProps}.
 * @param props.children - The label to highlight.
 * @returns The label with its matching segments marked.
 */
export function TypeaheadHighlight({
  children,
  className,
}: Readonly<TypeaheadHighlightProps>) {
  const { inputValue } = useTypeaheadContext('Typeahead.Highlight')
  const query = inputValue.trim()

  // Splitting on a capturing group keeps the matches in the output, so the original casing and
  // spacing survive; recomputed only when the label or the query actually changes.
  const parts = useMemo(() => {
    if (!query) return [children]

    return children.split(new RegExp(`(${escapeRegex(query)})`, 'gi'))
  }, [children, query])

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={`${part}-${String(i)}`} className={TYPEAHEAD_MARK_CLASS}>
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
