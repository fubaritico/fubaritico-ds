import { TableCell } from '../../primitives/TableCell'

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
export function LabelWithTooltipCellView({
  value,
  tooltipText,
}: Readonly<LabelWithTooltipCellViewProps>) {
  return (
    <TableCell>
      {/* TODO(tooltip): replace title with <Tooltip> once the wrapping-trigger Tooltip lands. */}
      <span title={tooltipText}>{value}</span>
    </TableCell>
  )
}

export default LabelWithTooltipCellView
