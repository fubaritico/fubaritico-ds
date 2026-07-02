import { describe, expect, it } from 'vitest'

import {
  UI_TABLE_BODY_CLASS,
  UI_TABLE_CAPTION_CLASS,
  UI_TABLE_CELL_CLASS,
  UI_TABLE_CLASS,
  UI_TABLE_FOOTER_CLASS,
  UI_TABLE_HEADER_CLASS,
  UI_TABLE_HEAD_CLASS,
  UI_TABLE_SCROLL_CLASS,
  UI_TABLE_VIRTUALIZED_CLASS,
  tableRowVariants,
} from './table.js'

describe('tableRowVariants', () => {
  describe('happy path', () => {
    it('returns the base class with the default (non-hoverable) when called with no args', () => {
      expect(tableRowVariants()).toBe('ui-table__row')
    })

    it('returns the base class when called with an empty options object', () => {
      expect(tableRowVariants({})).toBe('ui-table__row')
    })
  })

  describe('variants', () => {
    it('emits the hoverable modifier when hoverable is true', () => {
      expect(tableRowVariants({ hoverable: true })).toBe(
        'ui-table__row ui-table__row--hoverable'
      )
    })

    it('emits no modifier when hoverable is false', () => {
      expect(tableRowVariants({ hoverable: false })).toBe('ui-table__row')
    })
  })

  // L3 managed errors: N/A — a pure CVA resolver has no user-facing error path.

  describe('unmanaged errors', () => {
    it('falls back to the default when hoverable is explicitly undefined', () => {
      expect(tableRowVariants({ hoverable: undefined })).toBe('ui-table__row')
    })
  })

  describe('edge cases', () => {
    it('exposes the block and element part classes', () => {
      expect(UI_TABLE_CLASS).toBe('ui-table')
      expect(UI_TABLE_VIRTUALIZED_CLASS).toBe('ui-table ui-table--virtualized')
      expect(UI_TABLE_SCROLL_CLASS).toBe('ui-table__scroll')
      expect(UI_TABLE_HEADER_CLASS).toBe('ui-table__header')
      expect(UI_TABLE_BODY_CLASS).toBe('ui-table__body')
      expect(UI_TABLE_FOOTER_CLASS).toBe('ui-table__footer')
      expect(UI_TABLE_HEAD_CLASS).toBe('ui-table__head')
      expect(UI_TABLE_CELL_CLASS).toBe('ui-table__cell')
      expect(UI_TABLE_CAPTION_CLASS).toBe('ui-table__caption')
    })

    it('never emits an empty-string token in the output', () => {
      const result = tableRowVariants({ hoverable: false })
      expect(result.split(' ')).not.toContain('')
    })
  })
})
