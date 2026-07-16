import { describe, expect, it } from 'vitest'

import { ARROW_SIZE } from './Tooltip.constants'
import { computeTooltipPosition } from './tooltipPosition'

import type { ElementMeasurements } from './Tooltip.types'

/** A 100×40 target centred in a roomy 1000×800 viewport. */
const target: ElementMeasurements = { x: 450, y: 380, width: 100, height: 40 }
const tooltip = { width: 120, height: 50 }
const viewport = { width: 1000, height: 800 }
const OFFSET = 10

describe('computeTooltipPosition', () => {
  describe('happy path', () => {
    it('places a bottom tooltip below the target, centred', () => {
      const { position, effectivePlacement } = computeTooltipPosition(
        target,
        tooltip,
        'bottom',
        OFFSET,
        viewport
      )
      expect(effectivePlacement).toBe('bottom')
      expect(position.top).toBe(target.y + target.height + OFFSET) // 430
      expect(position.left).toBe(
        target.x + target.width / 2 - tooltip.width / 2
      ) // 440
    })
  })

  describe('variants', () => {
    it('places a top tooltip above the target', () => {
      const { position } = computeTooltipPosition(
        target,
        tooltip,
        'top',
        OFFSET,
        viewport
      )
      expect(position.top).toBe(target.y - tooltip.height - OFFSET) // 320
    })

    it('left-aligns a bottom-left tooltip to the target start', () => {
      const { position } = computeTooltipPosition(
        target,
        tooltip,
        'bottom-left',
        OFFSET,
        viewport
      )
      expect(position.left).toBe(target.x) // 450
    })

    it('places a right tooltip after the target', () => {
      const { position, effectivePlacement } = computeTooltipPosition(
        target,
        tooltip,
        'right',
        OFFSET,
        viewport
      )
      expect(effectivePlacement).toBe('right')
      expect(position.left).toBe(target.x + target.width + OFFSET) // 560
    })
  })

  // L3: managed errors — N/A (pure math, no error path)

  describe('unmanaged errors', () => {
    it('flips top → bottom when there is no room above', () => {
      const nearTop: ElementMeasurements = {
        x: 450,
        y: 5,
        width: 100,
        height: 40,
      }
      const { effectivePlacement } = computeTooltipPosition(
        nearTop,
        tooltip,
        'top',
        OFFSET,
        viewport
      )
      expect(effectivePlacement).toBe('bottom')
    })

    it('preserves the alignment suffix when flipping (top-left → bottom-left)', () => {
      const nearTop: ElementMeasurements = {
        x: 450,
        y: 5,
        width: 100,
        height: 40,
      }
      const { effectivePlacement } = computeTooltipPosition(
        nearTop,
        tooltip,
        'top-left',
        OFFSET,
        viewport
      )
      expect(effectivePlacement).toBe('bottom-left')
    })
  })

  describe('edge cases', () => {
    it('keeps the preferred placement when neither side fits', () => {
      const tallViewport = { width: 1000, height: 60 }
      const big = { width: 120, height: 400 }
      const { effectivePlacement } = computeTooltipPosition(
        target,
        big,
        'top',
        OFFSET,
        tallViewport
      )
      expect(effectivePlacement).toBe('top')
    })

    it('clamps the arrow within the bubble bounds', () => {
      const { position } = computeTooltipPosition(
        target,
        tooltip,
        'bottom',
        OFFSET,
        viewport
      )
      expect(position.arrow.left).toBeGreaterThanOrEqual(ARROW_SIZE)
      expect(position.arrow.left).toBeLessThanOrEqual(
        tooltip.width - ARROW_SIZE * 3
      )
    })
  })
})
