import { describe, expect, it } from 'vitest'

import { hasModifier } from './keys.js'

describe('hasModifier', () => {
  describe('happy path', () => {
    it('reports a plain key as unmodified', () => {
      expect(hasModifier({ key: 'ArrowRight' })).toBe(false)
    })
  })

  describe('variants', () => {
    it.each(['altKey', 'ctrlKey', 'metaKey'] as const)(
      'reports %s as a modifier',
      (flag) => {
        expect(hasModifier({ key: 'ArrowRight', [flag]: true })).toBe(true)
      }
    )

    it('does not count Shift as a modifier', () => {
      expect(hasModifier({ key: 'ArrowRight', shiftKey: true })).toBe(false)
    })
  })

  // L3: N/A — a pure predicate, every event is a valid input.
  // L4: N/A — no collaborator.

  describe('edge cases', () => {
    it('reports flags set to false as unmodified', () => {
      expect(
        hasModifier({
          key: 'Home',
          altKey: false,
          ctrlKey: false,
          metaKey: false,
        })
      ).toBe(false)
    })
  })
})
