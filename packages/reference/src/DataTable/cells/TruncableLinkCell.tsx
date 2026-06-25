import { Row } from '@tanstack/react-table'
import { ReactNode } from 'react'

import TruncableLinkCellView from './views/TruncableLinkCellView'

type CellProps<TData> = {
  row: Row<TData>
}

/**
 * Custom cell containing a link (mostly used for names) that accepts extra style and checks
 * if the value is truncated, if so a tooltip will be displayed on hover
 *
 * @param {String} keyName - Key to access the value in the row object
 * @param {String} linkPath - Path to navigate when clicking on the link
 * @param {String} className - Extra CSS styles (tailwind)
 *
 */
const TruncableLinkCell =
  (keyName: string, linkPath: string, className?: string) =>
  <TData,>({ row }: CellProps<TData>): ReactNode => {
    const label = row.getValue(keyName) as string
    return (
      <TruncableLinkCellView
        className={className}
        linkPath={linkPath}
        label={label}
      />
    )
  }

export default TruncableLinkCell
