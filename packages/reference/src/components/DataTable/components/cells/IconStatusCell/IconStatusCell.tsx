import { type Row } from '@tanstack/react-table'

import IconStatusCellView from '../views/IconStatusCellView'

import type { IconProps } from '../../../../Icon'

/**
 * Cell factory rendering a status as an icon (see {@link IconStatusCellView} for the status→icon map).
 *
 * @param extraProps - Extra DS Icon props (size, className, …); the `name` is derived from the status.
 * @param keyName - Key to read the status from the row; defaults to `'status'`.
 * @param tooltipText - Optional hint, shown in a tooltip on hover / keyboard focus and read by
 *   assistive technology.
 * @returns A TanStack cell renderer for a status-icon column.
 */
const IconStatusCell =
  (
    extraProps: Partial<Omit<IconProps, 'name'>> = {},
    keyName = 'status',
    tooltipText?: string
  ) =>
  ({ row }: Readonly<{ row: Row<unknown> }>) => {
    // Malformed data (no status) falls back to the default icon rather than crashing the table.
    const raw = row.getValue<unknown>(keyName)
    return (
      <IconStatusCellView
        status={typeof raw === 'string' ? raw : ''}
        extraProps={extraProps}
        tooltipText={tooltipText}
      />
    )
  }

export default IconStatusCell
