import { describe, expect, it } from 'vitest'

import {
  POPOVER_ANCHOR_VAR,
  POPOVER_CLASS,
  POPOVER_TRIGGER_CLASS,
} from './popover.js'

describe('popover class names', () => {
  describe('happy path', () => {
    it('names the surface block', () => {
      expect(POPOVER_CLASS).toBe('ui-popover')
    })
  })

  describe('variants', () => {
    it('names the trigger as its own block (a sibling, not a child)', () => {
      expect(POPOVER_TRIGGER_CLASS).toBe('ui-popover-trigger')
    })
  })

  // L3 / L4: N/A — constants.

  describe('edge cases', () => {
    it('keeps the anchor var in the block namespace', () => {
      expect(POPOVER_ANCHOR_VAR).toMatch(/^--ui-popover-[a-z-]+$/)
    })
  })
})
