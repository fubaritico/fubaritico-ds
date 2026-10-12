import { useRef } from 'react'

import {
  UI_DATA_TABLE_CELL_CENTER_MODIFIER,
  UI_DATA_TABLE_HINT_CLASS,
  UI_DATA_TABLE_VISUALLY_HIDDEN_CLASS,
} from '@fubaritico/variants'

import { Icon } from '../../../../Icon'
import { Tooltip, useTooltip } from '../../../../Tooltip'
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
  /** Optional hint, shown in a tooltip on hover / keyboard focus and read by assistive technology. */
  tooltipText?: string
}

/**
 * Renders a job status as a DS {@link Icon} (status→icon map). Replaces the original custom hexagon
 * icon set with heroicons.
 *
 * With a `tooltipText`, the icon becomes a tab stop revealing the hint in a tooltip on hover or
 * keyboard focus. The hint is also visually hidden text next to the status, so assistive technology
 * reads it with or without the bubble (which is hidden from it, to avoid reading it twice).
 *
 * @param props - {@link IconStatusCellViewProps}.
 * @returns The status-icon cell.
 */
export function IconStatusCellView({
  row,
  extraProps,
  keyName,
  tooltipText,
}: Readonly<IconStatusCellViewProps>) {
  // Malformed data (no status) falls back to the default icon rather than crashing the table.
  const raw = row.getValue<unknown>(keyName)
  const status = typeof raw === 'string' ? raw : ''
  const iconName = STATUS_ICON[status.toLowerCase()] ?? DEFAULT_STATUS_ICON
  const triggerRef = useRef<HTMLSpanElement>(null)
  const { open, triggerProps, bubbleProps } = useTooltip({
    describe: false,
    disabled: !tooltipText,
  })

  // What assistive technology reads: the status, its hint, or the hint alone for a missing status.
  const hiddenText =
    tooltipText && status ? `${status} (${tooltipText})` : (tooltipText ?? status)

  // The Icon is always decorative (aria-hidden); the status is conveyed to AT by the hidden text.
  const content = (
    <>
      <Icon name={iconName} size={STATUS_ICON_SIZE} {...extraProps} />
      <span className={UI_DATA_TABLE_VISUALLY_HIDDEN_CLASS}>
        {hiddenText}
      </span>
    </>
  )

  return (
    <TableCell className={UI_DATA_TABLE_CELL_CENTER_MODIFIER}>
      {tooltipText ? (
        <>
          <span
            {...triggerProps}
            ref={triggerRef}
            tabIndex={0}
            className={UI_DATA_TABLE_HINT_CLASS}
          >
            {content}
          </span>
          <Tooltip
            {...bubbleProps}
            as="span"
            content={tooltipText}
            visible={open}
            targetRef={triggerRef}
            placement="top"
          />
        </>
      ) : (
        content
      )}
    </TableCell>
  )
}

export default IconStatusCellView
