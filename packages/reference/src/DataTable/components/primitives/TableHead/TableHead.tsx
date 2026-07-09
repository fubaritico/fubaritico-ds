import { UI_TABLE_HEAD_CLASS } from '@fubaritico-ds/variants'

import { cn } from '../../../utils'

import type { ComponentProps } from 'react'

/**
 * `<th>` header-cell primitive (`.ui-table__head`) with the DataTable's default header height,
 * padding, start-aligned muted text and a flush trailing edge for the checkbox column. Defaults to
 * `scope="col"` (WCAG 1.3.1 — associates the header with its column); override via the `scope` prop.
 *
 * @param props - Standard `<th>` attributes ({@link ComponentProps}) incl. `ref` (React 19 ref-as-prop).
 * @returns The table header cell.
 */
export function TableHead({ className, ...props }: Readonly<ComponentProps<'th'>>) {
  return (
    <th scope="col" className={cn(UI_TABLE_HEAD_CLASS, className)} {...props} />
  )
}

export default TableHead
