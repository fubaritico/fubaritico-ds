import { describe, expect, it } from 'vitest'

import { slug } from './ids.js'

describe('slug', () => {
  describe('happy path', () => {
    it('keeps an id that is already safe', () => {
      expect(slug('tab-1_a')).toBe('tab-1_a')
    })
  })

  describe('variants', () => {
    it('replaces the colons of a React useId', () => {
      expect(slug(':r1:')).toBe('-r1-')
    })

    it('replaces spaces and punctuation, one dash each', () => {
      expect(slug('a b.c/d')).toBe('a-b-c-d')
    })
  })

  // L3: N/A — a pure string mapping, every string is a valid input.
  // L4: N/A — no collaborator.

  describe('edge cases', () => {
    it('maps an empty string to an empty string', () => {
      expect(slug('')).toBe('')
    })

    it('replaces non-ASCII letters', () => {
      expect(slug('çé')).toBe('--')
    })
  })
})
