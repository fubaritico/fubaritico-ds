import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'

import { tooltipArrowVariants, tooltipVariants } from '@fubaritico-ds/variants'

import { Portal } from '../Portal'

import { DEFAULT_OFFSET } from './Tooltip.constants'
import { computeTooltipPosition, getPrimaryAxis } from './tooltipPosition'

import type {
  TooltipPlacement,
  TooltipPosition,
  TooltipProps,
} from './Tooltip.types'

export type { TooltipProps, TooltipPlacement } from './Tooltip.types'

/**
 * Floating tooltip bubble — a controlled, portalled, positioned presentational primitive.
 *
 * Visibility is owned by the parent (`visible`); the bubble renders into a `Portal` and positions
 * itself either relative to a `targetRef` (`mode="target"`, with viewport-aware flipping) or at
 * explicit coordinates (`mode="manual"`). The skin owns the look (`.ui-tooltip` + the arrow); this
 * component only computes coordinates and toggles classes.
 *
 * @param props - {@link TooltipProps}.
 * @returns The portalled tooltip bubble, or `null` when hidden.
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

  if (!visible) return null

  return (
    <Portal>
      <div
        ref={bubbleRef}
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
    </Portal>
  )
}

export default Tooltip
