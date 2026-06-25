import type { TooltipVariant } from '@fubaritico-ds/variants'
import type { ComponentProps, ReactNode, RefObject } from 'react'

/** Supported tooltip placement relative to the target. */
export type TooltipPlacement =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'
  | 'left'
  | 'left-top'
  | 'left-bottom'
  | 'right'
  | 'right-top'
  | 'right-bottom'

/** Manual positioning coordinates for the tooltip bubble (viewport-relative, px). */
export interface TooltipManualPosition {
  /** Distance from the top of the viewport. */
  top: number
  /** Distance from the left of the viewport. */
  left: number
}

/** Computed position for both the bubble and its arrow. */
export interface TooltipPosition {
  /** Top offset for the tooltip bubble. */
  top: number
  /** Left offset for the tooltip bubble. */
  left: number
  /** Arrow position relative to the bubble. */
  arrow: {
    /** Top offset for the arrow element. */
    top: number
    /** Left offset for the arrow element. */
    left: number
  }
}

/** Measurements of a rectangular element used for positioning calculations. */
export interface ElementMeasurements {
  /** X coordinate of the element's left edge. */
  x: number
  /** Y coordinate of the element's top edge. */
  y: number
  /** Element width in pixels. */
  width: number
  /** Element height in pixels. */
  height: number
}

/**
 * Props of the Tooltip component. Extends the bubble's native `<div>` attributes, so `id` (link it to
 * a trigger via `aria-describedby`), `style`, `data-*` and `aria-*` pass through (`ref` is internal).
 */
export interface TooltipProps
  extends Omit<ComponentProps<'div'>, 'content' | 'ref'> {
  /** Content rendered inside the tooltip bubble. */
  content: ReactNode
  /** Whether the tooltip is currently visible (controlled by the parent). */
  visible: boolean
  /** Visual style; defaults to `'dark'`. */
  variant?: TooltipVariant
  /** Preferred placement relative to the target. May flip if there isn't enough space. */
  placement?: TooltipPlacement
  /** Distance in pixels between the target element and the tooltip bubble. */
  offset?: number
  /**
   * `'target'`: the tooltip positions itself relative to `targetRef`.
   * `'manual'`: the tooltip is placed at the coordinates given in `position`.
   * Defaults to `'target'`.
   */
  mode?: 'target' | 'manual'
  /** Ref to the target element the tooltip anchors to. Required when `mode` is `'target'`. */
  targetRef?: RefObject<HTMLElement | null>
  /** Explicit coordinates for the tooltip. Required when `mode` is `'manual'`. */
  position?: TooltipManualPosition
  /** Fixed width in pixels for the bubble. When set, text wraps to multiple lines. */
  width?: number
}
