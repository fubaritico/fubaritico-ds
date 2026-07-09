import { UI_TABLE_CELL_CLASS } from '@fubaritico-ds/variants'

import { cn } from '../../../utils'

import type { ComponentProps } from 'react'

/**
 * `<td>` table-cell primitive (`.ui-table__cell`) with the DataTable's default cell padding and row
 * height, and a flush trailing edge for the checkbox column.
 *
 * @param props - Standard `<td>` attributes ({@link ComponentProps}) incl. `ref` (React 19 ref-as-prop).
 * @returns The table cell element.
 */
export function TableCell({ className, ...props }: Readonly<ComponentProps<'td'>>) {
  return <td className={cn(UI_TABLE_CELL_CLASS, className)} {...props} />
}

export default TableCell
