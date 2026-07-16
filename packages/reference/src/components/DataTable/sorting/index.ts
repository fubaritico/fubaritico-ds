import type { Row, RowData, SortingFn } from '@tanstack/react-table'

/**
 * Will sort values as number, if the values are strings it will try to parse them as number.
 * Otherwise, it will return 0 for the value to be sorted at the end.
 *
 * @template T - Type of the value to sort
 *
 * @param rowA - First row whose value will be compared
 * @param rowB - Second row whose value will be compared
 * @param columnId - Column id (property name) to sort
 */
export const sortNumbers =
  <T extends RowData>(): SortingFn<T> =>
  (rowA: Row<T>, rowB: Row<T>, columnId: string): number => {
    const valueA = rowA.getValue<T>(columnId)
    const valueB = rowB.getValue<T>(columnId)

    const recordsA = valueA
      ? isNaN(Number(valueA))
        ? parseInt((valueA as string).replace(/,|\s|\./g, ''), 10)
        : Number(valueA)
      : 0

    const recordsB = valueB
      ? isNaN(Number(valueB))
        ? parseInt((valueB as string).replace(/,|\s|\./g, ''), 10)
        : Number(valueB)
      : 0

    return recordsA < recordsB ? 1 : -1
  }
