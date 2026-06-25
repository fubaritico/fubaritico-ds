import { describe, expect, it } from 'vitest'

import {
  PAGINATION_CLASS,
  PAGINATION_DOUBLE_CHEVRON_CLASS,
  PAGINATION_NAV_CLASS,
  PAGINATION_PAGES_CLASS,
  paginationPageVariants,
} from './pagination.js'

describe('paginationPageVariants', () => {
  describe('happy path', () => {
    it('emits the base page class when inactive (default)', () => {
      expect(paginationPageVariants()).toBe('ui-pagination__page')
    })
  })

  describe('variants', () => {
    it('emits the active modifier for the current page', () => {
      expect(paginationPageVariants({ active: true })).toBe(
        'ui-pagination__page ui-pagination__page--active'
      )
    })

    it('emits no modifier for an inactive page', () => {
      expect(paginationPageVariants({ active: false })).toBe(
        'ui-pagination__page'
      )
    })
  })

  // L3: managed errors — N/A (pure class-name resolver)

  describe('unmanaged errors', () => {
    it('falls back to inactive on an empty object', () => {
      expect(paginationPageVariants({})).toBe('ui-pagination__page')
    })

    it('ignores an undefined active value', () => {
      expect(paginationPageVariants({ active: undefined })).toBe(
        'ui-pagination__page'
      )
    })
  })

  describe('edge cases', () => {
    it('exposes stable BEM element class constants', () => {
      expect(PAGINATION_CLASS).toBe('ui-pagination')
      expect(PAGINATION_PAGES_CLASS).toBe('ui-pagination__pages')
      expect(PAGINATION_NAV_CLASS).toBe('ui-pagination__nav')
      expect(PAGINATION_DOUBLE_CHEVRON_CLASS).toBe('ui-pagination__double')
    })
  })
})
