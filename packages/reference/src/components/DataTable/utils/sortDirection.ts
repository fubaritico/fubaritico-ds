/** Current sort direction of a column, as returned by the table state manager. */
export type SortDirection = 'asc' | 'desc' | false

/**
 * Canonical mapping from a sort direction to its **ARIA wording**.
 *
 * Single source of truth for the two places that must agree: the `aria-sort` attribute on the header
 * cell and the accessible-label suffix on the sort toggle. Keyed on the sorted directions only — the
 * unsorted case (`false`) is `aria-sort="none"` / an empty suffix, which is the caller's concern.
 */
export const SORT_DIRECTION_TO_ARIA: Record<
  Exclude<SortDirection, false>,
  'ascending' | 'descending'
> = {
  asc: 'ascending',
  desc: 'descending',
}
