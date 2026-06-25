import type { FilterFn, Row } from '@tanstack/react-table'

/** Reads a column's raw value from a row's original data object. */
const readCell = (row: Row<unknown>, columnId: string): unknown =>
  (row.original as Record<string, unknown>)[columnId]

/**
 * Numeric range filter — keeps rows whose numeric cell value is over/under the threshold.
 *
 * @param row - The row being tested.
 * @param columnId - The column whose value is compared.
 * @param filterValue - `{ type: 'over' | 'under'; value }` — the comparison direction and threshold.
 * @returns `true` when the row passes the numeric comparison, `false` otherwise.
 */
export const assertNumberFilter: FilterFn<unknown> = (
  row,
  columnId,
  filterValue: { type: 'over' | 'under'; value: string }
) => {
  const threshold = parseInt(filterValue.value, 10)
  if (Number.isNaN(threshold)) {
    return false
  }
  const cellValue = parseInt(String(readCell(row, columnId) ?? 0), 10)

  return filterValue.type === 'over'
    ? cellValue >= threshold
    : cellValue < threshold
}

/**
 * Exclusion filter — keeps rows whose cell value does NOT contain any of the given substrings.
 *
 * @param row - The row being tested.
 * @param columnId - The column whose value is inspected.
 * @param filterValue - Substrings to exclude; when omitted, all rows pass.
 * @returns `true` when the cell value contains none of the substrings.
 */
export const doesNotContainString: FilterFn<unknown> = (
  row,
  columnId,
  filterValue?: string[]
) => {
  if (!filterValue) {
    return true
  }
  const cellValue = String(readCell(row, columnId) ?? '')
  return !filterValue.some((value) => cellValue.includes(value))
}
