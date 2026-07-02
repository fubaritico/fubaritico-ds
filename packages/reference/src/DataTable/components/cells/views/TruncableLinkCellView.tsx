import clsx from 'clsx'

import {
  UI_TABLE_LINK_CLASS,
  UI_TABLE_LINK_WRAP_CLASS,
} from '@fubaritico-ds/variants'

import { useIsTextTruncated } from '../../../hooks'
import { TableCell } from '../../primitives/TableCell'

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
      <div className={clsx(UI_TABLE_LINK_WRAP_CLASS, className)}>
        {/* TODO(tooltip): show a <Tooltip> when truncated once the wrapping-trigger Tooltip lands. */}
        <a
          ref={elementRef}
          href={linkPath}
          title={isTruncated ? label : undefined}
          className={UI_TABLE_LINK_CLASS}
        >
          {label}
        </a>
      </div>
    </TableCell>
  )
}

export default TruncableLinkCellView
