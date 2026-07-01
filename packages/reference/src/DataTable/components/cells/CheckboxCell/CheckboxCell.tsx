import { type Row } from '@tanstack/react-table'

import { Checkbox } from '../../../../Checkbox'
import { TableCell } from '../../primitives/TableCell'

/**
 * Row-selection cell factory — renders the DS {@link Checkbox} wired to TanStack's per-row selection
 * (`getIsSelected` / `getToggleSelectedHandler`). Replaces the original `InputCheckbox` (the
 * "plus-square" unchecked glyph is dropped; the DS checkbox shows an empty box when unchecked).
 *
 * @param className - Optional extra classes for the cell.
 * @returns A TanStack cell renderer for the selection column.
 */
const CheckboxCell =
  (className?: string) =>
  <TData,>({ row }: { row: Row<TData> }) => {
    return (
      <TableCell tabIndex={0} className={className}>
        <Checkbox
          id={`choose-${row.id}-checkbox`}
          aria-label={`Select row ${row.id}`}
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      </TableCell>
    )
  }

export default CheckboxCell
