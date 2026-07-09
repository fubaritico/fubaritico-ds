import TruncableLinkCellView from '../views/TruncableLinkCellView'

import type { Row } from '@tanstack/react-table'
import type { ReactNode } from 'react'

interface CellProps<TData> {
  row: Row<TData>
}

/**
 * Link cell factory (mostly used for names) — renders a {@link TruncableLinkCellView}; when the value
 * is truncated a tooltip is shown on hover.
 *
 * @param keyName - Key to read the link text from the row.
 * @param linkPath - Destination href for the link.
 * @param className - Optional extra classes for the link wrapper.
 * @returns A TanStack cell renderer for a link column.
 */
const TruncableLinkCell =
  (keyName: string, linkPath: string, className?: string) =>
  <TData,>({ row }: Readonly<CellProps<TData>>): ReactNode => {
    const raw = row.getValue<unknown>(keyName)
    const label = typeof raw === 'string' ? raw : String(raw ?? '')
    return (
      <TruncableLinkCellView
        className={className}
        linkPath={linkPath}
        label={label}
      />
    )
  }

export default TruncableLinkCell
