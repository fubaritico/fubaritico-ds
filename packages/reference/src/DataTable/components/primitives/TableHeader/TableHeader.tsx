import { cn } from '../../../ui/utils'

import type { ComponentProps } from 'react'

/**
 * `<thead>` primitive. Sets the bottom border on header rows and default column widths per
 * `data-type` (`link-name` 25%, `status-icon` 120px, `date` 200px).
 *
 * @param props - Standard `<thead>` attributes ({@link ComponentProps}) incl. `ref` (React 19 ref-as-prop).
 * @returns The table header section.
 */
export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return (
    <thead
      className={cn(
        '[&_tr]:tw-border-b',
        '[&_th[data-type="link-name"]]:tw-w-[25%]',
        '[&_th[data-type="status-icon"]]:tw-w-[120px]',
        '[&_th[data-type="date"]]:tw-w-[200px]',
        className
      )}
      {...props}
    />
  )
}

export default TableHeader
