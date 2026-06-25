import clsx from 'clsx'

import { Checkbox } from '../../Checkbox'
import { TableHead } from '../ui/table'

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
        className={clsx(
          'tw-font-bold !tw-text-gray-900 tw-w-[36px]',
          className
        )}
        data-type={dataType}
        tabIndex={0}
      >
        <div className="tw-flex tw-items-center tw-justify-start tw-gap-1">
          <Checkbox
            id={id}
            aria-label="Select all rows on this page"
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
          {withSeparator ? <div className="tw-flex tw-gap-[2px]" /> : null}
        </div>
      </TableHead>
    )
  }

export default CheckboxHeaderCell
