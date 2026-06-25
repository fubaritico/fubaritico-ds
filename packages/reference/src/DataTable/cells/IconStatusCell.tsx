import { type Row } from '@tanstack/react-table'

import IconStatusCellView from './views/IconStatusCellView'

import type { IconProps } from '../../Icon'

/**
 * Cell factory rendering a status as an icon (see {@link IconStatusCellView} for the status→icon map).
 *
 * @param extraProps - Extra DS Icon props (size, className, …); the `name` is derived from the status.
 * @param keyName - Key to read the status from the row; defaults to `'status'`.
 * @returns A TanStack cell renderer for a status-icon column.
 */
const IconStatusCell =
  (extraProps: Partial<Omit<IconProps, 'name'>> = {}, keyName = 'status') =>
  ({ row }: { row: Row<unknown> }) => (
    <IconStatusCellView row={row} extraProps={extraProps} keyName={keyName} />
  )

export default IconStatusCell
