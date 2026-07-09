import clsx from 'clsx'

import {
  UI_TABLE_TRUNCATE_CLASS,
  UI_TABLE_TRUNCATE_WRAP_CLASS,
} from '@fubaritico-ds/variants'

import { useIsTextTruncated } from '../../../hooks'

/** Props of {@link TruncatedContent}. */
export interface TruncatedContentProps {
  /** Extra classes for the wrapper. */
  className?: string
  /** Raw cell value; stringified for display (`'-'` for empty / `'0'` / nullish). */
  value: unknown
}

/**
 * Displays a value truncated to its container; when the text is cut off, the full value is exposed via
 * the native `title` attribute (it will move to a `<Tooltip>` once the wrapping-trigger Tooltip lands).
 *
 * @param props - {@link TruncatedContentProps}.
 * @returns The truncated text cell content.
 */
export function TruncatedContent({ className, value }: Readonly<TruncatedContentProps>) {
  const text =
    value !== undefined && value !== null && value !== '0' && value !== ''
      ? String(value)
      : '-'
  const { elementRef, isTruncated } =
    useIsTextTruncated<HTMLParagraphElement>(text)

  return (
    <div className={clsx(UI_TABLE_TRUNCATE_WRAP_CLASS, className)}>
      {/* TODO(tooltip): show a <Tooltip> when truncated once the wrapping-trigger Tooltip lands. */}
      <p
        ref={elementRef}
        title={isTruncated ? text : undefined}
        aria-label={isTruncated ? text : undefined}
        className={UI_TABLE_TRUNCATE_CLASS}
      >
        {text}
      </p>
    </div>
  )
}

export default TruncatedContent
