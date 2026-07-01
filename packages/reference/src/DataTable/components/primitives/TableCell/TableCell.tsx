import { cn } from '../../../ui/utils'

import type { ComponentProps } from 'react'

/**
 * `<td>` table-cell primitive with the DataTable's default cell padding and row height.
 *
 * @param props - Standard `<td>` attributes ({@link ComponentProps}) incl. `ref` (React 19 ref-as-prop).
 * @returns The table cell element.
 */
export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td
      className={cn(
        'tw-px-4 tw-h-[54px] [&:has([role=checkbox])]:tw-pr-0',
        className
      )}
      {...props}
    />
  )
}

export default TableCell
