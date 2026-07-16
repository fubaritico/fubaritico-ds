import { UI_DATA_TABLE_BODY_CLASS } from '@fubaritico-ds/variants'

import { cn } from '../../../utils'

import type { ComponentProps } from 'react'

/**
 * `<tbody>` primitive (`.ui-data-table__body`). The skin removes the bottom border on the last body row so
 * the body doesn't double-border against the footer.
 *
 * @param props - Standard `<tbody>` attributes ({@link ComponentProps}) incl. `ref` (React 19 ref-as-prop).
 * @returns The table body section.
 */
export function TableBody({ className, ...props }: Readonly<ComponentProps<'tbody'>>) {
  return <tbody className={cn(UI_DATA_TABLE_BODY_CLASS, className)} {...props} />
}

export default TableBody
