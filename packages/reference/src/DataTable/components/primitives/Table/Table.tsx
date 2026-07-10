import {
  UI_DATA_TABLE_SCROLL_CLASS,
  UI_DATA_TABLE_TABLE_CLASS,
} from '@fubaritico-ds/variants'

import { cn } from '../../../utils'

import type { ComponentProps } from 'react'

/** Props of {@link Table}: standard `<table>` attributes plus an optional fixed max height. */
export interface TableProps extends ComponentProps<'table'> {
  /** When set, caps the wrapper height (px) — use together with a sticky header. */
  maxHeight?: number
}

/**
 * `<table>` primitive (`.ui-data-table__table`) wrapped in a relative, full-width container
 * (`.ui-data-table__scroll`). Default column widths per data type are set by the skin's header-cell
 * rules. The block (`.ui-data-table`, which carries the vars) sits on the container Card, not here.
 *
 * @param props - {@link TableProps} (incl. `ref`, a React 19 prop forwarded to the `<table>`).
 * @returns The wrapped table element.
 */
export function Table({
  className,
  maxHeight,
  ...props
}: Readonly<TableProps>) {
  return (
    <div
      className={UI_DATA_TABLE_SCROLL_CLASS}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className={cn(UI_DATA_TABLE_TABLE_CLASS, className)} {...props} />
    </div>
  )
}

export default Table
