import clsx from 'clsx'

import {
  UI_TABLE_HEAD_INNER_CLASS,
  UI_TABLE_HEAD_STRONG_MODIFIER,
  UI_TABLE_SEPARATOR_CLASS,
} from '@fubaritico-ds/variants'

import { Checkbox } from '../../../../Checkbox'
import { TableHead } from '../../primitives/TableHead'

import type { Table } from '@tanstack/react-table'

/**
 * Select-all header cell factory — renders the DS {@link Checkbox} wired to TanStack's page selection
 * (`getIsAllPageRowsSelected` / `getIsSomePageRowsSelected` → `indeterminate` /
 * `getToggleAllPageRowsSelectedHandler`). Replaces the original `InputCheckbox`.
 *
 * @param id - Mandatory id for the checkbox.
 * @param withSeparator - Whether to render a trailing column separator.
 * @param dataType - Column data-type (drives the default column width via the table CSS).
 * @param className - Extra classes for the header cell.
 * @returns A TanStack header renderer for the selection column.
 */
const CheckboxHeaderCell =
  (
    id: string,
    withSeparator?: boolean,
    dataType?: string,
    className?: string
  ) =>
  <TData,>({ table }: { table: Table<TData> }) => {
    return (
      <TableHead
        className={clsx(UI_TABLE_HEAD_STRONG_MODIFIER, className)}
        data-type={dataType}
      >
        <div className={UI_TABLE_HEAD_INNER_CLASS}>
          <Checkbox
            id={id}
            aria-label="Select all rows on this page"
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
          {withSeparator ? <div className={UI_TABLE_SEPARATOR_CLASS} /> : null}
        </div>
      </TableHead>
    )
  }

export default CheckboxHeaderCell
