import { type Row } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import TruncatedContent from '../components/TruncatedContent'
import { TableCell } from '../ui/table'

/**
 * Simple cell to display a value (string or number) or wrap another component
 *
 * @param keyName {String} - Key to access the value in the row object
 * @param {String} className - Extra CSS styles (tailwind)
 * @param {ReactNode} children - Component to be rendered within the cell
 *
 */
const SimpleCell =
  (keyName: string, className?: string, children?: ReactNode) =>
  <TData,>({ row }: { row: Row<TData> }) => {
    return (
      <TableCell tabIndex={0} className={className}>
        {children ? (
          children
        ) : (
          <TruncatedContent value={row.getValue(keyName)} />
        )}
      </TableCell>
    )
  }

export default SimpleCell
