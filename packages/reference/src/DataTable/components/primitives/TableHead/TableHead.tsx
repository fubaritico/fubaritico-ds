import { UI_TABLE_HEAD_CLASS } from '@fubaritico-ds/variants'

import { cn } from '../../../utils'

import type { ComponentProps } from 'react'

/**
 * `<th>` header-cell primitive (`.ui-table__head`) with the DataTable's default header height,
 * padding, start-aligned muted text and a flush trailing edge for the checkbox column.
 *
 * @param props - Standard `<th>` attributes ({@link ComponentProps}) incl. `ref` (React 19 ref-as-prop).
 * @returns The table header cell.
 */
export function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return <th className={cn(UI_TABLE_HEAD_CLASS, className)} {...props} />
}

export default TableHead
