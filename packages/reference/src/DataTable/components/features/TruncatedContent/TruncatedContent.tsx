import clsx from 'clsx'

import { useIsTextTruncated } from '../../../hooks'

import type { FC } from 'react'

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
const TruncatedContent: FC<TruncatedContentProps> = ({ className, value }) => {
  const text =
    value !== undefined && value !== null && value !== '0' && value !== ''
      ? String(value)
      : '-'
  const { elementRef, isTruncated } =
    useIsTextTruncated<HTMLParagraphElement>(text)

  return (
    <div
      className={clsx(
        'tw-flex tw-min-w-0 tw-max-w-full tw-truncate',
        className
      )}
    >
      {/* TODO(tooltip): show a <Tooltip> when truncated once the wrapping-trigger Tooltip lands. */}
      <p
        ref={elementRef}
        title={isTruncated ? text : undefined}
        className="tw-truncate"
      >
        {text}
      </p>
    </div>
  )
}

export default TruncatedContent
