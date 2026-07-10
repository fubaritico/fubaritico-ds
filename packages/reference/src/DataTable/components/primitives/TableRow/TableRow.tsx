import {
  UI_DATA_TABLE_HEADER_ROW_CLASS,
  tableRowVariants,
} from '@fubaritico-ds/variants'

import { cn } from '../../../utils'

import type { ComponentProps } from 'react'

/** Props of {@link TableRow}: standard `<tr>` attributes plus an opt-in hover style. */
export interface TableRowProps extends ComponentProps<'tr'> {
  /** When true, apply the hover-background style on pointer hover. */
  enableHover?: boolean
  /** When true, render the dedicated header-row style (`.ui-data-table__header-row`) instead of a body row. */
  header?: boolean
}

/**
 * `<tr>` primitive. A body row (`.ui-data-table__row`) has a bottom border and a selected-state background
 * (the skin styles off `data-state="selected"`); `enableHover` opts into the hover-tint modifier. A
 * header row (`header` → `.ui-data-table__header-row`) carries only the header/body divider.
 *
 * @param props - {@link TableRowProps} (incl. `ref`, a React 19 prop forwarded to the `<tr>`).
 * @returns The table row element.
 */
export function TableRow({
  className,
  enableHover = false,
  header = false,
  ...props
}: Readonly<TableRowProps>) {
  return (
    <tr
      className={cn(
        header
          ? UI_DATA_TABLE_HEADER_ROW_CLASS
          : tableRowVariants({ hoverable: enableHover }),
        className
      )}
      {...props}
    />
  )
}

export default TableRow
