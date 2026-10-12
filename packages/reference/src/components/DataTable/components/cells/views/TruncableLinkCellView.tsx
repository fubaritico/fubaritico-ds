import clsx from 'clsx'

import {
  UI_DATA_TABLE_LINK_CLASS,
  UI_DATA_TABLE_TRUNCATE_WRAP_CLASS,
} from '@fubaritico/variants'

import { Tooltip, useTooltip } from '../../../../Tooltip'
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
 * Renders a (possibly truncated) link. A plain anchor keeps the cell presentational (no `react-router`
 * dependency). When the label is cut off, hovering or focusing the link reveals it in full in a
 * tooltip; the anchor is already a tab stop, so no extra one is added. `linkPath` is validated against
 * {@link SAFE_HREF} so an unsafe scheme (e.g. `javascript:`) can never reach the `href` (falls back
 * to `#`).
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
  // Off while the label fits; `describe: false` — the link's name already IS the full label.
  const { open, triggerProps, bubbleProps } = useTooltip({
    describe: false,
    disabled: !isTruncated,
  })

  const safeHref = SAFE_HREF.test(linkPath) ? linkPath : '#'

  return (
    <TableCell>
      <div className={clsx(UI_DATA_TABLE_TRUNCATE_WRAP_CLASS, className)}>
        <a
          {...triggerProps}
          ref={elementRef}
          href={safeHref}
          rel="noopener noreferrer"
          className={UI_DATA_TABLE_LINK_CLASS}
        >
          {label}
        </a>
        <Tooltip
          {...bubbleProps}
          as="span"
          content={label}
          visible={open}
          targetRef={elementRef}
          placement="top"
        />
      </div>
    </TableCell>
  )
}

export default TruncableLinkCellView
