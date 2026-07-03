import {
  UI_TABLE_CELL_CENTER_MODIFIER,
  UI_TABLE_VISUALLY_HIDDEN_CLASS,
} from '@fubaritico-ds/variants'

import { Icon } from '../../../../Icon'
import { TableCell } from '../../primitives/TableCell'

import type { IconName, IconProps } from '../../../../Icon'
import type { Row } from '@tanstack/react-table'

/** Maps a (lowercased) status to a DS icon. Custom hexagon glyphs are mapped to heroicons for now. */
const STATUS_ICON: Record<string, IconName> = {
  completed: 'Check',
  warning: 'ExclamationTriangle',
  excluded: 'XMark',
  failed: 'XMark',
}

/** Default icon for an unrecognised status. */
const DEFAULT_STATUS_ICON: IconName = 'ExclamationTriangle'

/** Pixel size of the status icon. */
const STATUS_ICON_SIZE = 20

/** Props of {@link IconStatusCellView}. */
export interface IconStatusCellViewProps {
  /** Key to read the status from the row. */
  keyName: string
  /** The row whose status is rendered. */
  row: Row<unknown>
  /** Extra DS Icon props (size/className overrides); `name` is derived from the status. */
  extraProps: Partial<Omit<IconProps, 'name'>>
  /** Optional hint; currently surfaced via the native `title` attribute. */
  tooltipText?: string
}

/**
 * Renders a job status as a DS {@link Icon} (status→icon map). Replaces the original custom hexagon
 * icon set with heroicons.
 *
 * @param props - {@link IconStatusCellViewProps}.
 * @returns The status-icon cell.
 */
export function IconStatusCellView({
  row,
  extraProps,
  keyName,
  tooltipText,
}: IconStatusCellViewProps) {
  const status = row.getValue<string>(keyName)
  const iconName = STATUS_ICON[status.toLowerCase()] ?? DEFAULT_STATUS_ICON

  return (
    <TableCell title={tooltipText} className={UI_TABLE_CELL_CENTER_MODIFIER}>
      {/* TODO(tooltip): wrap in <Tooltip> once the wrapping-trigger Tooltip lands (Tooltip migrated last). */}
      {/* The Icon is always decorative (aria-hidden); the status is conveyed to AT by the hidden text. */}
      <Icon name={iconName} size={STATUS_ICON_SIZE} {...extraProps} />
      <span className={UI_TABLE_VISUALLY_HIDDEN_CLASS}>{status}</span>
    </TableCell>
  )
}

export default IconStatusCellView
