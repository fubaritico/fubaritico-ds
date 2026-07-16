import { ARROW_SIZE } from './Tooltip.constants'

import type {
  ElementMeasurements,
  TooltipPlacement,
  TooltipPosition,
} from './Tooltip.types'

/** Viewport dimensions used for flip calculations. */
interface IViewport {
  /** Viewport width in pixels. */
  width: number
  /** Viewport height in pixels. */
  height: number
}

/** The primary axis direction extracted from a placement. */
export type PrimaryAxis = 'top' | 'bottom' | 'left' | 'right'

/**
 * Extract the primary axis from a placement string.
 *
 * @param placement - full placement (e.g. 'top-left', 'right')
 * @returns the primary axis direction
 */
export function getPrimaryAxis(placement: TooltipPlacement): PrimaryAxis {
  return placement.split('-')[0] as PrimaryAxis
}

/**
 * Flip map — maps a primary axis to its opposite.
 * Used when there's not enough space for the preferred placement.
 */
const FLIP_MAP: Record<PrimaryAxis, PrimaryAxis> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

/**
 * Compute the tooltip bubble and arrow position from target measurements.
 * Pure math — no DOM dependency. The caller provides the target/bubble measurements (from
 * `getBoundingClientRect`) and viewport dimensions; this returns absolute coordinates.
 *
 * @param target - measured rect of the target element
 * @param tooltip - measured rect of the tooltip bubble (width/height needed)
 * @param placement - preferred placement (may flip if not enough space)
 * @param offset - gap between target and tooltip
 * @param viewport - viewport dimensions for boundary detection
 * @returns computed position for the bubble and arrow, plus effective placement
 */
export function computeTooltipPosition(
  target: ElementMeasurements,
  tooltip: Pick<ElementMeasurements, 'width' | 'height'>,
  placement: TooltipPlacement,
  offset: number,
  viewport: IViewport
): { position: TooltipPosition; effectivePlacement: TooltipPlacement } {
  const effectivePlacement = resolveFlip(
    target,
    tooltip,
    placement,
    offset,
    viewport
  )
  const bubblePos = computeBubblePosition(
    target,
    tooltip,
    effectivePlacement,
    offset
  )
  const arrowPos = computeArrowPosition(
    target,
    bubblePos,
    tooltip,
    effectivePlacement
  )

  return {
    position: {
      top: bubblePos.top,
      left: bubblePos.left,
      arrow: arrowPos,
    },
    effectivePlacement,
  }
}

/**
 * Determine if placement needs to flip because there's not enough space.
 * Only flips the primary axis — alignment suffix is preserved.
 *
 * @param target - target element measurements
 * @param tooltip - tooltip dimensions
 * @param placement - preferred placement
 * @param offset - gap between target and tooltip
 * @param viewport - viewport dimensions
 * @returns the effective placement after flip resolution
 */
function resolveFlip(
  target: ElementMeasurements,
  tooltip: Pick<ElementMeasurements, 'width' | 'height'>,
  placement: TooltipPlacement,
  offset: number,
  viewport: IViewport
): TooltipPlacement {
  const fits = checkFits(target, tooltip, placement, offset, viewport)
  if (fits) return placement

  const primary = getPrimaryAxis(placement)
  const suffix = placement.includes('-') ? placement.split('-')[1] : null
  const flippedPrimary = FLIP_MAP[primary]
  const flippedPlacement = (
    suffix ? `${flippedPrimary}-${suffix}` : flippedPrimary
  ) as TooltipPlacement

  const flippedFits = checkFits(
    target,
    tooltip,
    flippedPlacement,
    offset,
    viewport
  )
  if (flippedFits) return flippedPlacement

  return placement
}

/**
 * Check whether the tooltip fits in the viewport at the given placement.
 *
 * @param target - target element measurements
 * @param tooltip - tooltip dimensions
 * @param placement - placement to check
 * @param offset - gap between target and tooltip
 * @param viewport - viewport dimensions
 * @returns true if the tooltip fits without clipping
 */
function checkFits(
  target: ElementMeasurements,
  tooltip: Pick<ElementMeasurements, 'width' | 'height'>,
  placement: TooltipPlacement,
  offset: number,
  viewport: IViewport
): boolean {
  const primary = getPrimaryAxis(placement)
  switch (primary) {
    case 'top':
      return target.y - offset - tooltip.height >= 0
    case 'bottom':
      return (
        target.y + target.height + offset + tooltip.height <= viewport.height
      )
    case 'left':
      return target.x - offset - tooltip.width >= 0
    case 'right':
      return target.x + target.width + offset + tooltip.width <= viewport.width
  }
}

/**
 * Compute the raw bubble position (before viewport clamping).
 *
 * For top/bottom placements, the `top` value is fixed by the primary axis
 * and the `left` value depends on alignment (center, left-aligned, right-aligned).
 *
 * For left/right placements, the `left` value is fixed by the primary axis
 * and the `top` value depends on alignment (center, top-aligned, bottom-aligned).
 *
 * @param target - target element measurements
 * @param tooltip - tooltip dimensions
 * @param placement - effective placement
 * @param offset - gap between target and tooltip
 * @returns top and left coordinates for the bubble
 */
function computeBubblePosition(
  target: ElementMeasurements,
  tooltip: Pick<ElementMeasurements, 'width' | 'height'>,
  placement: TooltipPlacement,
  offset: number
): { top: number; left: number } {
  const primary = getPrimaryAxis(placement)
  const suffix = placement.includes('-') ? placement.split('-')[1] : null

  const topAbove = target.y - tooltip.height - offset
  const topBelow = target.y + target.height + offset
  const leftBefore = target.x - tooltip.width - offset
  const leftAfter = target.x + target.width + offset

  const centerX = target.x + target.width / 2 - tooltip.width / 2
  const centerY = target.y + target.height / 2 - tooltip.height / 2

  if (primary === 'top' || primary === 'bottom') {
    const top = primary === 'top' ? topAbove : topBelow
    let left: number
    if (suffix === 'left') {
      left = target.x
    } else if (suffix === 'right') {
      left = target.x + target.width - tooltip.width
    } else {
      left = centerX
    }
    return { top, left }
  }

  // primary === 'left' || primary === 'right'
  const left = primary === 'left' ? leftBefore : leftAfter
  let top: number
  if (suffix === 'top') {
    top = target.y
  } else if (suffix === 'bottom') {
    top = target.y + target.height - tooltip.height
  } else {
    top = centerY
  }
  return { top, left }
}

/**
 * Compute the arrow position relative to the tooltip bubble.
 * The arrow always points toward the center of the target element.
 *
 * @param target - target element measurements
 * @param bubblePos - computed bubble position (after clamping)
 * @param tooltip - tooltip dimensions
 * @param placement - effective placement
 * @returns top and left offsets for the arrow within the bubble
 */
function computeArrowPosition(
  target: ElementMeasurements,
  bubblePos: { top: number; left: number },
  tooltip: Pick<ElementMeasurements, 'width' | 'height'>,
  placement: TooltipPlacement
): { top: number; left: number } {
  const primary = getPrimaryAxis(placement)
  const targetCenterX = target.x + target.width / 2
  const targetCenterY = target.y + target.height / 2

  /** Clamp an arrow offset along the horizontal axis of the bubble. */
  const clampX = (x: number) =>
    Math.max(ARROW_SIZE, Math.min(x, tooltip.width - ARROW_SIZE * 3))

  /** Clamp an arrow offset along the vertical axis of the bubble. */
  const clampY = (y: number) =>
    Math.max(ARROW_SIZE, Math.min(y, tooltip.height - ARROW_SIZE * 3))

  switch (primary) {
    case 'top':
      return {
        top: tooltip.height,
        left: clampX(targetCenterX - bubblePos.left - ARROW_SIZE),
      }
    case 'bottom':
      return {
        top: -ARROW_SIZE,
        left: clampX(targetCenterX - bubblePos.left - ARROW_SIZE),
      }
    case 'left':
      return {
        top: clampY(targetCenterY - bubblePos.top - ARROW_SIZE),
        left: tooltip.width,
      }
    case 'right':
      return {
        top: clampY(targetCenterY - bubblePos.top - ARROW_SIZE),
        left: -ARROW_SIZE,
      }
  }
}
