import { tableRowVariants } from '@fubaritico-ds/variants'

import { cn } from '../../../utils'

import type { ComponentProps } from 'react'

/** Props of {@link TableRow}: standard `<tr>` attributes plus an opt-in hover style. */
export interface TableRowProps extends ComponentProps<'tr'> {
  /** When true, apply the hover-background style on pointer hover. */
  enableHover?: boolean
}

/**
 * `<tr>` primitive (`.ui-table__row`) with a bottom border and a selected-state background (the skin
 * styles off `data-state="selected"`). `enableHover` opts into the hover-tint modifier.
 *
 * @param props - {@link TableRowProps} (incl. `ref`, a React 19 prop forwarded to the `<tr>`).
 * @returns The table row element.
 */
export function TableRow({
  className,
  enableHover = false,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={cn(tableRowVariants({ hoverable: enableHover }), className)}
      {...props}
    />
  )
}

export default TableRow
