import { clsx } from 'clsx'

import type { ClassValue } from 'clsx'

/**
 * Joins conditional class names (thin `clsx` wrapper used by the DataTable table primitives).
 *
 * The original used `tailwind-merge` to dedupe conflicting Tailwind utilities; the DS skin is BEM with
 * `@layer` override-first, so class conflicts are resolved by the cascade, not by merging — plain
 * `clsx` is sufficient (and drops the `tailwind-merge` dependency).
 *
 * @param inputs - Class values (strings, arrays, conditional objects).
 * @returns The joined class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}
