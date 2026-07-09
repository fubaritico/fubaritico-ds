import { UI_TABLE_FOOTER_CLASS } from '@fubaritico-ds/variants'

import { cn } from '../../../utils'

import type { ComponentProps } from 'react'

/**
 * `<tfoot>` primitive (`.ui-table__footer`): the semantic table footer section (top border, muted
 * background). Intended to host the {@link TableFooterContent} pagination controls.
 *
 * @param props - Standard `<tfoot>` attributes ({@link ComponentProps}) incl. `ref` (React 19 ref-as-prop).
 * @returns The table footer section.
 */
export function TableFooter({ className, ...props }: Readonly<ComponentProps<'tfoot'>>) {
  return <tfoot className={cn(UI_TABLE_FOOTER_CLASS, className)} {...props} />
}

export default TableFooter
