import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/**
 * Resolves a sort-arrow chevron's state into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-sort-arrows__icon`, `--dimmed`).
 *
 * Pure string output (framework-agnostic). The dimmed chevron is the one pointing the OPPOSITE way to
 * the current sort direction (e.g. when sorted ascending, the down chevron is dimmed).
 *
 * @param props - Chevron options (all optional — CVA defaults apply).
 * @param props.dimmed - Whether this chevron is the inactive direction.
 * @returns The space-separated BEM class string for the resolved state.
 */
export const sortArrowVariants = cva('ui-sort-arrows__icon', {
  variants: {
    dimmed: {
      true: 'ui-sort-arrows__icon--dimmed',
      false: '',
    },
  },
  defaultVariants: {
    dimmed: false,
  },
})

/** Variant props inferred from {@link sortArrowVariants}. */
export type SortArrowVariantProps = VariantProps<typeof sortArrowVariants>

/** BEM class for the sort-arrows button (`.ui-sort-arrows` — the stacked up/down chevron control). */
export const SORT_ARROWS_CLASS = 'ui-sort-arrows'
