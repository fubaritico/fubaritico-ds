import clsx from 'clsx'

import {
  UI_DATA_TABLE_TRUNCATE_CLASS,
  UI_DATA_TABLE_TRUNCATE_WRAP_CLASS,
} from '@fubaritico/variants'

import { TruncatedText } from '../../../../TruncatedText'

/** Props of {@link TruncatedContent}. */
export interface TruncatedContentProps {
  /** Extra classes for the wrapper. */
  className?: string
  /** Raw cell value; stringified for display (`'-'` for empty / `'0'` / nullish). */
  value: unknown
}

/**
 * Displays a value truncated to its container; when the text is cut off, the full value is revealed
 * in a tooltip on hover or keyboard focus ({@link TruncatedText}). Assistive technology already
 * reads the full text (the cut is visual).
 *
 * @param props - {@link TruncatedContentProps}.
 * @returns The truncated text cell content.
 */
export function TruncatedContent({ className, value }: Readonly<TruncatedContentProps>) {
  const text =
    value !== undefined && value !== null && value !== '0' && value !== ''
      ? String(value)
      : '-'

  return (
    <div className={clsx(UI_DATA_TABLE_TRUNCATE_WRAP_CLASS, className)}>
      <TruncatedText as="p" className={UI_DATA_TABLE_TRUNCATE_CLASS}>
        {text}
      </TruncatedText>
    </div>
  )
}

export default TruncatedContent
