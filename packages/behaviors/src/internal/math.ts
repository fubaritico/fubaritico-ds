/**
 * Restricts a number to a closed interval. Internal — not part of the package's public API.
 *
 * @param value - The number to restrict.
 * @param min - Lower bound (inclusive).
 * @param max - Upper bound (inclusive).
 * @returns `value`, or the nearest bound when it lies outside.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
