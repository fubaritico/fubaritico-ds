import { MULTI_SELECT_MARK_CLASS } from '@fubaritico/variants'

import type { MultiSelectMatch } from '@fubaritico/behaviors'

/** Props of {@link MultiSelectHighlight}. */
export interface MultiSelectHighlightProps {
  /** The option's label. */
  label: string
  /** Where the query matched, or `null` (the label is rendered as is). */
  match: MultiSelectMatch | null
}

/**
 * An option's label with the matched substring in a `<mark>` — by weight, not colour, so the match
 * survives a monochrome theme (WCAG 1.4.1). The service computes the match; this only cuts the text.
 *
 * @param props - {@link MultiSelectHighlightProps}.
 * @returns The label, highlighted where it matched.
 */
export function MultiSelectHighlight({
  label,
  match,
}: Readonly<MultiSelectHighlightProps>) {
  if (!match) return <>{label}</>

  return (
    <>
      {label.slice(0, match.start)}
      <mark className={MULTI_SELECT_MARK_CLASS}>
        {label.slice(match.start, match.end)}
      </mark>
      {label.slice(match.end)}
    </>
  )
}

export default MultiSelectHighlight
