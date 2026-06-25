import clsx from 'clsx'

import { useIsTextTruncated } from '../../components/useIsTextTruncated'
import { TableCell } from '../../ui/table'

import type { FC } from 'react'

/** Props of {@link TruncableLinkCellView}. */
export interface TruncableLinkCellViewProps {
  /** Extra classes for the link wrapper. */
  className?: string
  /** Destination href for the link. */
  linkPath: string
  /** Link text. */
  label: string
}

/**
 * Renders a (possibly truncated) link. Replaces the router-coupled button with a plain anchor so the
 * cell stays presentational (no `react-router` dependency); when truncated, the full label is exposed
 * via the native `title` attribute.
 *
 * @param props - {@link TruncableLinkCellViewProps}.
 * @returns The link cell.
 */
const TruncableLinkCellView: FC<TruncableLinkCellViewProps> = ({
  className,
  label,
  linkPath,
}) => {
  const { elementRef, isTruncated } =
    useIsTextTruncated<HTMLAnchorElement>(label)

  return (
    <TableCell>
      <div
        className={clsx(
          'tw-flex tw-min-w-0 tw-max-w-full tw-truncate',
          className
        )}
      >
        {/* TODO(tooltip): show a <Tooltip> when truncated once the wrapping-trigger Tooltip lands. */}
        <a
          ref={elementRef}
          href={linkPath}
          title={isTruncated ? label : undefined}
          className="tw-text-blue-700 tw-font-semibold tw-truncate"
        >
          {label}
        </a>
      </div>
    </TableCell>
  )
}

export default TruncableLinkCellView
