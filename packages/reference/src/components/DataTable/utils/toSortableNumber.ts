/**
 * Coerces an arbitrary cell value to a number usable by a numeric sort comparator.
 *
 * Plain numeric values (and numeric strings) go through `Number`. A value that is not directly
 * numeric is treated as a **formatted** number string — thousands separators (`,`), spaces and dots
 * are stripped before parsing, so `"1,234.00"` reads as `123400`. Anything falsy or unparseable
 * yields `0` so it sorts at the end rather than poisoning the comparison with `NaN`.
 *
 * @param value - Raw cell value, of any shape the table may hold.
 * @returns A finite number; `0` when the value is falsy or cannot be parsed.
 */
export const toSortableNumber = (value: unknown): number => {
  if (!value) return 0

  const asNumber = Number(value)
  if (!Number.isNaN(asNumber)) return asNumber

  const parsed = Number.parseInt(String(value).replace(/,|\s|\./g, ''), 10)

  return Number.isNaN(parsed) ? 0 : parsed
}
