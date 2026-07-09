import { describe, expect, it } from 'vitest'

import {
  UI_TABLE_BODY_CLASS,
  UI_TABLE_CAPTION_CLASS,
  UI_TABLE_CELL_CENTER_MODIFIER,
  UI_TABLE_CELL_CLASS,
  UI_TABLE_CELL_INNER_CLASS,
  UI_TABLE_CLASS,
  UI_TABLE_DURATION_CLASS,
  UI_TABLE_EMPTY_CLASS,
  UI_TABLE_FOOTER_BAR_CLASS,
  UI_TABLE_FOOTER_CLASS,
  UI_TABLE_FOOTER_GROUP_CLASS,
  UI_TABLE_FOOTER_LABEL_CLASS,
  UI_TABLE_HEADER_CLASS,
  UI_TABLE_HEADER_STICKY_MODIFIER,
  UI_TABLE_HEAD_CLASS,
  UI_TABLE_HEAD_INNER_CLASS,
  UI_TABLE_HEAD_LABEL_CLASS,
  UI_TABLE_HEAD_STRONG_MODIFIER,
  UI_TABLE_LINK_CLASS,
  UI_TABLE_PAGE_INPUT_CLASS,
  UI_TABLE_SCROLL_CLASS,
  UI_TABLE_SEPARATOR_CLASS,
  UI_TABLE_SORT_TOGGLE_CLASS,
  UI_TABLE_TOOLBAR_ACTIONS_CLASS,
  UI_TABLE_TOOLBAR_CLASS,
  UI_TABLE_TOOLBAR_SEARCH_CLASS,
  UI_TABLE_TOOLBAR_STICKY_MODIFIER,
  UI_TABLE_TRUNCATE_CLASS,
  UI_TABLE_TRUNCATE_WRAP_CLASS,
  UI_TABLE_VIRTUALIZED_CLASS,
  UI_TABLE_VISUALLY_HIDDEN_CLASS,
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
      expect(UI_TABLE_HEADER_STICKY_MODIFIER).toBe('ui-table__header--sticky')
    })

    it('never emits an empty-string token in the output', () => {
      const result = tableRowVariants({ hoverable: false })
      expect(result.split(' ')).not.toContain('')
    })

    it('exposes the cell-content (cells-layer) part classes', () => {
      expect(UI_TABLE_HEAD_STRONG_MODIFIER).toBe('ui-table__head--strong')
      expect(UI_TABLE_HEAD_INNER_CLASS).toBe('ui-table__head-inner')
      expect(UI_TABLE_HEAD_LABEL_CLASS).toBe('ui-table__head-label')
      expect(UI_TABLE_SORT_TOGGLE_CLASS).toBe('ui-table__sort-toggle')
      expect(UI_TABLE_SEPARATOR_CLASS).toBe('ui-table__separator')
      expect(UI_TABLE_CELL_INNER_CLASS).toBe('ui-table__cell-inner')
      expect(UI_TABLE_CELL_CENTER_MODIFIER).toBe('ui-table__cell--center')
      expect(UI_TABLE_TRUNCATE_WRAP_CLASS).toBe('ui-table__truncate-wrap')
      expect(UI_TABLE_TRUNCATE_CLASS).toBe('ui-table__truncate')
      expect(UI_TABLE_LINK_CLASS).toBe('ui-table__link')
      expect(UI_TABLE_DURATION_CLASS).toBe('ui-table__duration')
      expect(UI_TABLE_VISUALLY_HIDDEN_CLASS).toBe('ui-table__visually-hidden')
    })

    it('exposes the chrome (features-layer) part classes', () => {
      expect(UI_TABLE_TOOLBAR_CLASS).toBe('ui-table__toolbar')
      expect(UI_TABLE_TOOLBAR_STICKY_MODIFIER).toBe('ui-table__toolbar--sticky')
      expect(UI_TABLE_TOOLBAR_ACTIONS_CLASS).toBe('ui-table__toolbar-actions')
      expect(UI_TABLE_TOOLBAR_SEARCH_CLASS).toBe('ui-table__toolbar-search')
      expect(UI_TABLE_EMPTY_CLASS).toBe('ui-table__empty')
      expect(UI_TABLE_FOOTER_BAR_CLASS).toBe('ui-table__footer-bar')
      expect(UI_TABLE_FOOTER_GROUP_CLASS).toBe('ui-table__footer-group')
      expect(UI_TABLE_FOOTER_LABEL_CLASS).toBe('ui-table__footer-label')
      expect(UI_TABLE_PAGE_INPUT_CLASS).toBe('ui-table__page-input')
    })
  })
})
