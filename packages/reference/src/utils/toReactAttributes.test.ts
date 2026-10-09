import { describe, expect, it } from 'vitest'

import { toReactAttributes } from './toReactAttributes'

describe('toReactAttributes', () => {
  describe('happy path', () => {
    it('renames tabindex to tabIndex', () => {
      expect(toReactAttributes({ tabindex: 0 })).toEqual({ tabIndex: 0 })
    })
  })

  describe('variants', () => {
    it('keeps role, aria-* and data-* verbatim', () => {
      expect(
        toReactAttributes({
          role: 'tab',
          'aria-selected': 'true',
          'data-state': 'active',
        })
      ).toEqual({
        role: 'tab',
        'aria-selected': 'true',
        'data-state': 'active',
      })
    })

    it('turns a present boolean attribute into true (React drops an empty string)', () => {
      expect(toReactAttributes({ hidden: '' })).toEqual({ hidden: true })
    })
  })

  // L3: N/A — no managed error path, every attribute map converts.
  // L4: N/A — the input is typed DomAttributes; nothing to coerce.

  describe('edge cases', () => {
    it('drops undefined values, meaning "omit the attribute"', () => {
      expect(toReactAttributes({ id: 'x', hidden: undefined })).toEqual({
        id: 'x',
      })
    })

    it('returns an empty object for no attributes', () => {
      expect(toReactAttributes({})).toEqual({})
    })
  })
})
