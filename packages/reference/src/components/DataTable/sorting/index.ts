import { toSortableNumber } from '../utils'

import type { Row, RowData, SortingFn } from '@tanstack/react-table'

/**
 * Sorts two rows on a column read as a number.
 *
 * Both values go through {@link toSortableNumber}, so formatted strings (`"1,234"`) compare as
 * numbers and unparseable values fall back to `0` instead of `NaN`. Equal values return `0` so the
 * comparator stays consistent and the sort remains stable.
 *
 * @template T - Row data shape.
 *
 * @param rowA - First row whose value will be compared.
 * @param rowB - Second row whose value will be compared.
 * @param columnId - Column id (property name) to sort on.
 * @returns A negative number, `0`, or a positive number, per the comparator contract.
 */
export const sortNumbers =
  <T extends RowData>(): SortingFn<T> =>
  (rowA: Row<T>, rowB: Row<T>, columnId: string): number => {
    const recordsA = toSortableNumber(rowA.getValue<T>(columnId))
    const recordsB = toSortableNumber(rowB.getValue<T>(columnId))

    if (recordsA === recordsB) return 0

    return recordsA < recordsB ? 1 : -1
  }
