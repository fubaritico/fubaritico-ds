import { cn } from '../../ui/utils'

import type { ComponentProps } from 'react'

/** Props of {@link TableRow}: standard `<tr>` attributes plus an opt-in hover style. */
export interface TableRowProps extends ComponentProps<'tr'> {
  /** When true, apply the hover-background style on pointer hover. */
  enableHover?: boolean
}

/**
 * `<tr>` primitive with a bottom border, a selected-state background (`data-state="selected"`) and an
 * opt-in hover background.
 *
 * @param props - {@link TableRowProps} (incl. `ref`, a React 19 prop forwarded to the `<tr>`).
 * @returns The table row element.
 */
export function TableRow({ className, enableHover, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        'tw-border-b tw-bg-white tw-transition-colors data-[state=selected]:tw-bg-muted',
        { 'hover:tw-bg-muted/50': enableHover },
        className
      )}
      {...props}
    />
  )
}

export default TableRow
