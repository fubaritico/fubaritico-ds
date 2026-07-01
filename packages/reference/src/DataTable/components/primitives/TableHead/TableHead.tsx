import { cn } from '../../../ui/utils'

import type { ComponentProps } from 'react'

/**
 * `<th>` header-cell primitive with the DataTable's default header padding, alignment and muted text.
 *
 * @param props - Standard `<th>` attributes ({@link ComponentProps}) incl. `ref` (React 19 ref-as-prop).
 * @returns The table header cell.
 */
export function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'tw-h-12 tw-pl-4 tw-text-left tw-align-middle tw-font-medium tw-text-muted-foreground [&:has([role=checkbox])]:tw-pr-0',
        className
      )}
      {...props}
    />
  )
}

export default TableHead
