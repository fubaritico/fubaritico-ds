import { UI_TABLE_HEADER_CLASS } from '@fubaritico-ds/variants'

import { cn } from '../../../utils'

import type { ComponentProps } from 'react'

/**
 * `<thead>` primitive (`.ui-table__header`). The header/body separation border comes from each row's
 * own bottom border; default column widths per `data-type` (`link-name` 25%, `status-icon` 120px,
 * `date` 200px) are set by the skin's `.ui-table__head[data-type=…]` rules.
 *
 * @param props - Standard `<thead>` attributes ({@link ComponentProps}) incl. `ref` (React 19 ref-as-prop).
 * @returns The table header section.
 */
export function TableHeader({ className, ...props }: Readonly<ComponentProps<'thead'>>) {
  return <thead className={cn(UI_TABLE_HEADER_CLASS, className)} {...props} />
}

export default TableHeader
