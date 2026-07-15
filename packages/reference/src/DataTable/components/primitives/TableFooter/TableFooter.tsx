import { UI_DATA_TABLE_FOOTER_CLASS } from '@fubaritico-ds/variants'

import { cn } from '../../../utils'

import type { ComponentProps } from 'react'

/**
 * `<tfoot>` primitive (`.ui-data-table__footer`): the semantic table footer section (top border, muted
 * background). Reserved for column-summary / aggregation rows (totals per column — AG-Grid-parity
 * "pinned bottom rows", a later phase). NOT for the pagination controls: those are chrome, not tabular
 * data, and stay a sibling of the `<table>` (the {@link TableFooterContent} footer bar) so they remain
 * pinned below the scroll region without extra sticky-bottom wiring.
 *
 * @param props - Standard `<tfoot>` attributes ({@link ComponentProps}) incl. `ref` (React 19 ref-as-prop).
 * @returns The table footer section.
 */
export function TableFooter({
  className,
  ...props
}: Readonly<ComponentProps<'tfoot'>>) {
  return (
    <tfoot className={cn(UI_DATA_TABLE_FOOTER_CLASS, className)} {...props} />
  )
}

export default TableFooter
