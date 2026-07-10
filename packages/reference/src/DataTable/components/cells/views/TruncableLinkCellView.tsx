import clsx from 'clsx'

import {
  UI_DATA_TABLE_LINK_CLASS,
  UI_DATA_TABLE_TRUNCATE_WRAP_CLASS,
} from '@fubaritico-ds/variants'

import { useIsTextTruncated } from '../../../hooks'
import { TableCell } from '../../primitives/TableCell'

/** Matches the only href schemes this cell allows: absolute http(s), root- or `./`/`../`-relative, or a hash. */
const SAFE_HREF = /^(https?:\/\/|\/|\.{1,2}\/|#)/

/** Props of {@link TruncableLinkCellView}. */
export interface TruncableLinkCellViewProps {
  /** Extra classes for the link wrapper. */
  className?: string
  /** Destination href for the link (must be an absolute http(s) URL, a relative path, or a hash). */
  linkPath: string
  /** Link text. */
  label: string
}

/**
 * Renders a (possibly truncated) link. Replaces the router-coupled button with a plain anchor so the
 * cell stays presentational (no `react-router` dependency); when truncated, the full label is exposed
 * via the native `title` attribute. `linkPath` is validated against {@link SAFE_HREF} so an unsafe
 * scheme (e.g. `javascript:`) can never reach the `href` (falls back to `#`).
 *
 * @param props - {@link TruncableLinkCellViewProps}.
 * @returns The link cell.
 */
export function TruncableLinkCellView({
  className,
  label,
  linkPath,
}: Readonly<TruncableLinkCellViewProps>) {
  const { elementRef, isTruncated } =
    useIsTextTruncated<HTMLAnchorElement>(label)

  const safeHref = SAFE_HREF.test(linkPath) ? linkPath : '#'

  return (
    <TableCell>
      <div className={clsx(UI_DATA_TABLE_TRUNCATE_WRAP_CLASS, className)}>
        {/* TODO(tooltip): show a <Tooltip> when truncated once the wrapping-trigger Tooltip lands. */}
        <a
          ref={elementRef}
          href={safeHref}
          rel="noopener noreferrer"
          title={isTruncated ? label : undefined}
          className={UI_DATA_TABLE_LINK_CLASS}
        >
          {label}
        </a>
      </div>
    </TableCell>
  )
}

export default TruncableLinkCellView
