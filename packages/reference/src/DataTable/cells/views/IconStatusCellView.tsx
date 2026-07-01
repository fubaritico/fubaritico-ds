import { Icon } from '../../../Icon'
import { TableCell } from '../../components/TableCell'

import type { IconName, IconProps } from '../../../Icon'
import type { Row } from '@tanstack/react-table'
import type { FC } from 'react'

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
const IconStatusCellView: FC<IconStatusCellViewProps> = ({
  row,
  extraProps,
  keyName,
  tooltipText,
}) => {
  const status = row.getValue<string>(keyName)
  const iconName = STATUS_ICON[status.toLowerCase()] ?? DEFAULT_STATUS_ICON

  return (
    <TableCell
      aria-label={status}
      title={tooltipText}
      tabIndex={0}
      className="tw-text-center tw-align-middle"
    >
      {/* TODO(tooltip): wrap in <Tooltip> once the wrapping-trigger Tooltip lands (Tooltip migrated last). */}
      <Icon name={iconName} size={STATUS_ICON_SIZE} {...extraProps} />
    </TableCell>
  )
}

export default IconStatusCellView
