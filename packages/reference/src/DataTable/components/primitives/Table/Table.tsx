import { UI_TABLE_CLASS, UI_TABLE_SCROLL_CLASS } from '@fubaritico-ds/variants'

import { cn } from '../../../utils'

import type { ComponentProps } from 'react'

/** Props of {@link Table}: standard `<table>` attributes plus an optional fixed max height. */
export interface TableProps extends ComponentProps<'table'> {
  /** When set, caps the wrapper height (px) — use together with a sticky header. */
  maxHeight?: number
}

/**
 * `<table>` primitive (`.ui-table`) wrapped in a relative, full-width container (`.ui-table__scroll`).
 * Default column widths per data type are set by the skin's header-cell rules.
 *
 * @param props - {@link TableProps} (incl. `ref`, a React 19 prop forwarded to the `<table>`).
 * @returns The wrapped table element.
 */
export function Table({ className, maxHeight, ...props }: TableProps) {
  return (
    <div
      className={UI_TABLE_SCROLL_CLASS}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className={cn(UI_TABLE_CLASS, className)} {...props} />
    </div>
  )
}

export default Table
