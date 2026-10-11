import clsx from 'clsx'

import { TRUNCATED_TEXT_CLASS } from '@fubaritico/variants'

import { useIsTextTruncated, useMergedRef } from '../../hooks'
import { Tooltip, useTooltip } from '../Tooltip'

import type { TooltipPlacement } from '../Tooltip'
import type { TooltipVariant } from '@fubaritico/variants'
import type {
  ComponentProps,
  FocusEvent,
  KeyboardEvent,
  PointerEvent,
} from 'react'

/** Props of {@link TruncatedText}. */
export interface TruncatedTextProps
  extends Omit<ComponentProps<'span'>, 'children'> {
  /** The text. A string: the same value is shown, measured and revealed in the tooltip. */
  children: string
  /** Element to render; defaults to `'span'`. `'p'` / `'div'` for a block of its own. */
  as?: 'span' | 'div' | 'p'
  /** Where the revealing tooltip prefers to sit; defaults to `'top'`. It flips when out of room. */
  placement?: TooltipPlacement
  /** Look of the revealing tooltip; defaults to `'dark'`. */
  tooltipVariant?: TooltipVariant
}

/**
 * TruncatedText — a single line of text cut with an ellipsis, which reveals its full content in a
 * tooltip ONLY when it is actually cut off.
 *
 * The cut is measured, not assumed: a text that fits renders as plain text — no tooltip, no tab
 * stop. Once it overflows (on mount, when the text changes, when its box resizes), it becomes
 * focusable and shows the whole text on hover or keyboard focus. Assistive technology already reads
 * the full text (the truncation is visual), so the tooltip is hidden from it rather than read twice.
 *
 * @param props - {@link TruncatedTextProps}.
 * @param props.children - The text.
 * @param props.as - Element to render; defaults to `'span'`.
 * @param props.placement - Preferred tooltip placement; defaults to `'top'`.
 * @param props.tooltipVariant - Tooltip look; defaults to `'dark'`.
 * @returns The text, and its tooltip while revealed.
 */
export function TruncatedText({
  children,
  as: Element = 'span',
  placement = 'top',
  tooltipVariant = 'dark',
  className,
  ref,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  onKeyDown,
  ...rest
}: Readonly<TruncatedTextProps>) {
  // Measures the cut: true while the text overflows its box, re-checked on resize and text change.
  const { elementRef, isTruncated } = useIsTextTruncated<HTMLElement>(children)
  // The measuring ref AND the consumer's, so neither displaces the other.
  const mergedRef = useMergedRef(elementRef, ref)
  // The tooltip behaviour (hover delay, focus, Escape, hoverable bubble), off while the text fits;
  // `describe: false` — the bubble repeats text assistive technology already reads.
  const { open, triggerProps, bubbleProps } = useTooltip({
    describe: false,
    disabled: !isTruncated,
  })

  return (
    <>
      <Element
        {...rest}
        ref={mergedRef}
        className={clsx(TRUNCATED_TEXT_CLASS, className)}
        // Reachable from the keyboard only when there is something to reveal — unless the consumer
        // owns the focus model (a grid with roving focus passes its own tabIndex, which wins).
        tabIndex={rest.tabIndex ?? (isTruncated ? 0 : undefined)}
        // The consumer's handler first, then the tooltip's.
        onPointerEnter={(event: PointerEvent<HTMLElement>) => {
          onPointerEnter?.(event)
          triggerProps.onPointerEnter?.(event)
        }}
        onPointerLeave={(event: PointerEvent<HTMLElement>) => {
          onPointerLeave?.(event)
          triggerProps.onPointerLeave?.(event)
        }}
        onFocus={(event: FocusEvent<HTMLElement>) => {
          onFocus?.(event)
          triggerProps.onFocus?.(event)
        }}
        onBlur={(event: FocusEvent<HTMLElement>) => {
          onBlur?.(event)
          triggerProps.onBlur?.(event)
        }}
        onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
          onKeyDown?.(event)
          if (!event.defaultPrevented) triggerProps.onKeyDown?.(event)
        }}
      >
        {children}
      </Element>
      <Tooltip
        {...bubbleProps}
        as="span"
        content={children}
        visible={open}
        targetRef={elementRef}
        placement={placement}
        variant={tooltipVariant}
      />
    </>
  )
}

export default TruncatedText
