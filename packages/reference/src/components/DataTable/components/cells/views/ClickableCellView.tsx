import { useId, useRef } from 'react'

import {
  UI_DATA_TABLE_CELL_INNER_CLASS,
  UI_DATA_TABLE_VISUALLY_HIDDEN_CLASS,
} from '@fubaritico/variants'

import { Tooltip, useTooltip } from '../../../../Tooltip'
import { TableCell } from '../../primitives/TableCell'

import type { ReactElement } from 'react'

/** Props of {@link ClickableCellView}. */
export interface ClickableCellViewProps {
  /** Accessible name of the button (required when `content` is icon-only — WCAG 4.1.2); falls back to `tooltipText`. */
  ariaLabel?: string
  /** Extra classes for the cell. */
  className?: string
  /** Content rendered inside the button. */
  content: ReactElement
  /** Invoked when the button is clicked. */
  onClick: () => void
  /** Optional hint, shown in a tooltip on hover / keyboard focus. */
  tooltipText?: string
}

/**
 * Clickable cell view — a button with an optional hint in a tooltip.
 *
 * When the hint is only the fallback name of the button, it is not repeated. When it differs from
 * the `ariaLabel`, it is the button's description, through a visually hidden text that is ALWAYS in
 * the DOM — so a screen reader reads it while browsing the table, not only while the bubble is open.
 * The bubble itself is hidden from assistive technology (it would be read twice).
 *
 * @param props - {@link ClickableCellViewProps}.
 * @returns The clickable cell.
 */
export function ClickableCellView({
  ariaLabel,
  className,
  content,
  onClick,
  tooltipText,
}: Readonly<ClickableCellViewProps>) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const descriptionId = useId()
  const { open, triggerProps, bubbleProps } = useTooltip({
    describe: false,
    disabled: !tooltipText,
  })
  // A hint distinct from the name describes the button; one equal to it is already its name.
  const describes =
    tooltipText !== undefined && tooltipText !== '' && ariaLabel !== undefined && ariaLabel !== tooltipText

  return (
    <TableCell className={className}>
      <div className={UI_DATA_TABLE_CELL_INNER_CLASS}>
        <button
          {...triggerProps}
          ref={buttonRef}
          type="button"
          aria-label={ariaLabel ?? tooltipText}
          aria-describedby={describes ? descriptionId : undefined}
          onClick={onClick}
        >
          {content}
        </button>
        {describes ? (
          <span id={descriptionId} className={UI_DATA_TABLE_VISUALLY_HIDDEN_CLASS}>
            {tooltipText}
          </span>
        ) : null}
        {tooltipText ? (
          <Tooltip
            {...bubbleProps}
            content={tooltipText}
            visible={open}
            targetRef={buttonRef}
            placement="top"
          />
        ) : null}
      </div>
    </TableCell>
  )
}

export default ClickableCellView
