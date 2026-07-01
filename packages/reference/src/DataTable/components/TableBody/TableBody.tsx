import { cn } from '../../ui/utils'

import type { ComponentProps } from 'react'

/**
 * `<tbody>` primitive. Removes the bottom border on the last row so the body doesn't double-border
 * against the footer.
 *
 * @param props - Standard `<tbody>` attributes ({@link ComponentProps}) incl. `ref` (React 19 ref-as-prop).
 * @returns The table body section.
 */
export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return (
    <tbody
      className={cn('[&_tr:last-child]:tw-border-0', className)}
      {...props}
    />
  )
}

export default TableBody
