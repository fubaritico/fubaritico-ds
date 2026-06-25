import { type Row } from '@tanstack/react-table'

import { Checkbox } from '../../Checkbox'
import { TableCell } from '../ui/table'

/**
 * Cell factory rendering a read-only boolean value as a disabled DS {@link Checkbox}.
 *
 * @param keyName - Key to read the boolean value from the row.
 * @param className - Optional extra classes for the cell.
 * @returns A TanStack cell renderer for a boolean column.
 */
const BooleanCell =
  (keyName: string, className?: string) =>
  <TData,>({ row }: { row: Row<TData> }) => {
    const value = row.getValue<boolean>(keyName)
    return (
      <TableCell tabIndex={0} className={className}>
        <Checkbox
          id={`boolean-${row.id}-checkbox`}
          aria-label={keyName}
          checked={value}
          readOnly
          disabled
        />
      </TableCell>
    )
  }

export default BooleanCell
