import { TableCell } from '../../ui/table'

import type { FC } from 'react'

/** Props of {@link LabelWithTooltipCellView}. */
export interface LabelWithTooltipCellViewProps {
  /** Hint shown on hover (a different text than the visible value). */
  tooltipText?: string
  /** The value displayed in the cell. */
  value?: string
}

/**
 * Cell view showing a value with a separate hover hint — useful when the hint differs from the visible
 * value (unlike SimpleCell, which only shows a tooltip when its own text is truncated).
 *
 * The hint is currently surfaced via the native `title` attribute; it will move to a `<Tooltip>` once
 * the wrapping-trigger Tooltip lands (Tooltip migrated last).
 *
 * @param props - {@link LabelWithTooltipCellViewProps}.
 * @returns The label cell with a hover hint.
 */
const LabelWithTooltipCellView: FC<LabelWithTooltipCellViewProps> = ({
  value,
  tooltipText,
}) => {
  return (
    <TableCell aria-label={value} tabIndex={0}>
      {/* TODO(tooltip): replace title with <Tooltip> once the wrapping-trigger Tooltip lands. */}
      <span title={tooltipText}>{value}</span>
    </TableCell>
  )
}

export default LabelWithTooltipCellView
