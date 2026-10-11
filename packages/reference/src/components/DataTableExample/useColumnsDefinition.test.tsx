import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import useColumnsDefinition from './useColumnsDefinition'

import type { JobItem } from './jobFactory'
import type { ColumnDef, Row } from '@tanstack/react-table'

/** Reads the stable id of a column (explicit `id`, else its `accessorKey`). */
const columnKey = (column: ColumnDef<JobItem>): string =>
  column.id ?? ('accessorKey' in column ? String(column.accessorKey) : '')

/**
 * A row stub exposing only `getValue`, which is all a sorting function reads.
 *
 * @param value - The cell value returned for any column.
 * @returns The stubbed row.
 */
const rowWith = (value: number): Row<JobItem> =>
  ({ getValue: () => value }) as unknown as Row<JobItem>

/**
 * Reads the comparator a column sorts with, failing when it is not a function.
 *
 * @param column - The column definition.
 * @returns The column's sorting function.
 */
const comparatorOf = (column: ColumnDef<JobItem>) => {
  if (typeof column.sortingFn !== 'function') {
    throw new Error('expected a sorting function')
  }
  return column.sortingFn
}

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

  describe('date sorting', () => {
    it('gives the three date columns the same comparator, passed as a function', () => {
      const { result } = renderHook(() => useColumnsDefinition('en_US'))
      const [first, ...others] = result.current.slice(2, 5).map(comparatorOf)
      others.forEach((comparator) => {
        expect(comparator).toBe(first)
      })
    })

    it('orders two dates in opposite directions depending on the operand order', () => {
      const { result } = renderHook(() => useColumnsDefinition('en_US'))
      const compare = comparatorOf(result.current[2])
      const older = rowWith(1_700_000_000)
      const newer = rowWith(1_800_000_000)
      expect(Math.sign(compare(older, newer, 'createdDate'))).toBe(
        -Math.sign(compare(newer, older, 'createdDate'))
      )
      expect(compare(older, newer, 'createdDate')).not.toBe(0)
    })

    it('treats the same instant in seconds and in milliseconds as equal', () => {
      const { result } = renderHook(() => useColumnsDefinition('en_US'))
      const compare = comparatorOf(result.current[2])
      expect(
        compare(
          rowWith(1_700_000_000),
          rowWith(1_700_000_000_000),
          'createdDate'
        )
      ).toBe(0)
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
