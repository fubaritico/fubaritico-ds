import { useRef } from 'react'

import {
  UI_DATA_TABLE_HINT_CLASS,
  UI_DATA_TABLE_VISUALLY_HIDDEN_CLASS,
} from '@fubaritico/variants'

import { Tooltip, useTooltip } from '../../../../Tooltip'
import { TableCell } from '../../primitives/TableCell'

/** Props of {@link LabelWithTooltipCellView}. */
export interface LabelWithTooltipCellViewProps {
  /** Hint shown on hover / focus (a different text than the visible value). */
  tooltipText?: string
  /** The value displayed in the cell. */
  value?: string
}

/**
 * Cell view showing a value with a separate hint — useful when the hint differs from the visible
 * value (unlike SimpleCell, which only reveals its own text when truncated).
 *
 * With a hint, the value becomes a tab stop that shows the hint in a tooltip on hover or keyboard
 * focus. The hint is also in the DOM as visually hidden text, so assistive technology reads it
 * whether or not the bubble is open (a screen reader browsing the table never hovers); the bubble
 * itself is hidden from it to avoid reading the hint twice.
 *
 * @param props - {@link LabelWithTooltipCellViewProps}.
 * @returns The label cell with its hint.
 */
export function LabelWithTooltipCellView({
  value,
  tooltipText,
}: Readonly<LabelWithTooltipCellViewProps>) {
  const triggerRef = useRef<HTMLSpanElement>(null)
  const { open, triggerProps, bubbleProps } = useTooltip({
    describe: false,
    disabled: !tooltipText || !value,
  })

  // No hint, or nothing visible to hang it on (an empty trigger would be an invisible tab stop).
  if (!tooltipText || !value) return <TableCell>{value}</TableCell>

  return (
    <TableCell>
      <span
        {...triggerProps}
        ref={triggerRef}
        tabIndex={0}
        className={UI_DATA_TABLE_HINT_CLASS}
      >
        {value}
        <span className={UI_DATA_TABLE_VISUALLY_HIDDEN_CLASS}> ({tooltipText})</span>
      </span>
      <Tooltip
        {...bubbleProps}
        as="span"
        content={tooltipText}
        visible={open}
        targetRef={triggerRef}
        placement="top"
      />
    </TableCell>
  )
}

export default LabelWithTooltipCellView
