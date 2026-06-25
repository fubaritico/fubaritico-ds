import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import useColumnsDefinition from './useColumnsDefinition'

import type { JobItem } from './jobFactory'
import type { ColumnDef } from '@tanstack/react-table'

/** Reads the stable id of a column (explicit `id`, else its `accessorKey`). */
const columnKey = (column: ColumnDef<JobItem>): string =>
  column.id ?? ('accessorKey' in column ? String(column.accessorKey) : '')

describe('useColumnsDefinition', () => {
  describe('happy path', () => {
    it('returns the 6 data columns by default (no selection column)', () => {
      const { result } = renderHook(() => useColumnsDefinition('en_US'))

      expect(result.current).toHaveLength(6)
      expect(result.current.map(columnKey)).toEqual([
        'customName',
        'id',
        'systemModStamp',
        'lastModifiedDate',
        'createdDate',
        'status',
      ])
    })
  })

  describe('variants', () => {
    it('prepends a non-sortable selection column when withSelection is true', () => {
      const { result } = renderHook(() =>
        useColumnsDefinition('en_US', { withSelection: true })
      )

      expect(result.current).toHaveLength(7)
      expect(result.current[0].id).toBe('select')
      expect(result.current[0].enableSorting).toBe(false)
      // The data columns still follow, in order.
      expect(columnKey(result.current[1])).toBe('customName')
    })

    it('omits the selection column when withSelection is false', () => {
      const { result } = renderHook(() =>
        useColumnsDefinition('en_US', { withSelection: false })
      )

      expect(result.current).toHaveLength(6)
      expect(result.current[0].id).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('memoizes a stable reference across re-renders with the same args', () => {
      const { result, rerender } = renderHook(
        ({ withSelection }: { withSelection: boolean }) =>
          useColumnsDefinition('en_US', { withSelection }),
        { initialProps: { withSelection: true } }
      )

      const first = result.current
      rerender({ withSelection: true })

      expect(result.current).toBe(first)
    })

    it('recomputes when the selection toggle flips', () => {
      const { result, rerender } = renderHook(
        ({ withSelection }: { withSelection: boolean }) =>
          useColumnsDefinition('en_US', { withSelection }),
        { initialProps: { withSelection: false } }
      )

      expect(result.current).toHaveLength(6)
      rerender({ withSelection: true })
      expect(result.current).toHaveLength(7)
    })
  })
})
