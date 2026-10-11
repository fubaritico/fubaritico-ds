import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { tooltipArrowVariants, tooltipVariants } from '@fubaritico/variants'

import { DEFAULT_OFFSET } from './Tooltip.constants'
import { computeTooltipPosition, getPrimaryAxis } from './tooltipPosition'

import type {
  TooltipPlacement,
  TooltipPosition,
  TooltipProps,
} from './Tooltip.types'

export type { TooltipProps, TooltipPlacement } from './Tooltip.types'

/**
 * Floating tooltip bubble — a controlled, positioned presentational primitive in the top layer.
 *
 * Visibility is owned by the parent (`visible`). The bubble is a `popover="manual"` element shown
 * in the browser's TOP LAYER, rendered in place: above every `z-index`, unclipped by any
 * `overflow`, and — unlike a portal — still inside a `Modal` / `Drawer` it is opened from, where the
 * rest of the page is inert. `portalContainer` mounts it elsewhere when really needed. It positions
 * itself either relative to a `targetRef` (`mode="target"`, with viewport-aware flipping) or at
 * explicit coordinates (`mode="manual"`). The skin owns the look (`.ui-tooltip` + the arrow); this
 * component only computes coordinates and toggles classes.
 *
 * @param props - {@link TooltipProps}.
 * @returns The bubble in the top layer (mounted into `portalContainer` when given), or `null` when
 *   hidden.
 */
export function Tooltip({
  content,
  visible,
  variant = 'dark',
  placement = 'bottom',
  offset = DEFAULT_OFFSET,
  mode = 'target',
  targetRef,
  position: manualPosition,
  width,
  portalContainer,
  className,
  style,
  ...rest
}: Readonly<TooltipProps>) {
  const bubbleRef = useRef<HTMLDivElement>(null)
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null)
  const [effectivePlacement, setEffectivePlacement] =
    useState<TooltipPlacement>(placement)

  const updatePosition = useCallback(() => {
    if (!visible) {
      setTooltipPos(null)
      return
    }

    if (mode === 'manual' && manualPosition) {
      setTooltipPos({
        top: manualPosition.top,
        left: manualPosition.left,
        arrow: { top: 0, left: 0 },
      })
      setEffectivePlacement(placement)
      return
    }

    const targetEl = targetRef?.current
    const bubbleEl = bubbleRef.current
    if (!targetEl || !bubbleEl) return

    const targetRect = targetEl.getBoundingClientRect()
    const bubbleRect = bubbleEl.getBoundingClientRect()

    const result = computeTooltipPosition(
      {
        x: targetRect.left,
        y: targetRect.top,
        width: targetRect.width,
        height: targetRect.height,
      },
      { width: bubbleRect.width, height: bubbleRect.height },
      placement,
      offset,
      { width: window.innerWidth, height: window.innerHeight }
    )

    setTooltipPos(result.position)
    setEffectivePlacement(result.effectivePlacement)
  }, [visible, mode, manualPosition, targetRef, placement, offset])

  useEffect(() => {
    updatePosition()
  }, [updatePosition])

  useEffect(() => {
    if (!visible) return

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [visible, updatePosition])

  /**
   * Attaches the bubble and lifts it into the top layer — on EVERY mount of the node, so a bubble
   * React remounts while visible (a `portalContainer` that changes) is shown again too. An
   * environment without the Popover API (an old browser, jsdom) only renders the markup.
   *
   * @param node - The bubble element, or `null` when it unmounts.
   */
  const attachBubble = useCallback((node: HTMLDivElement | null) => {
    bubbleRef.current = node
    if (!node || typeof node.showPopover !== 'function') return
    if (!node.matches(':popover-open')) node.showPopover()
  }, [])

  if (!visible) return null

  const bubble = (
    <div
      ref={attachBubble}
      popover="manual"
      role="tooltip"
      className={clsx(tooltipVariants({ variant }), className)}
      style={{
        top: tooltipPos?.top ?? 0,
        left: tooltipPos?.left ?? 0,
        opacity: tooltipPos ? 1 : 0,
        ...(width != null && { width }),
        ...style,
      }}
      {...rest}
    >
      {content}
      {tooltipPos && mode === 'target' ? (
        <div
          className={tooltipArrowVariants({
            axis: getPrimaryAxis(effectivePlacement),
          })}
          style={{ top: tooltipPos.arrow.top, left: tooltipPos.arrow.left }}
        />
      ) : null}
    </div>
  )

  return portalContainer ? createPortal(bubble, portalContainer) : bubble
}

export default Tooltip
