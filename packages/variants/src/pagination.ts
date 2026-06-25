import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/**
 * Resolves a Pagination page-number button's state into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-pagination__page`, `.ui-pagination__page--active`).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike.
 *
 * @param props - Page button options (all optional — CVA defaults apply).
 * @param props.active - Whether this button is the current page.
 * @returns The space-separated BEM class string for the resolved state.
 */
export const paginationPageVariants = cva('ui-pagination__page', {
  variants: {
    active: {
      true: 'ui-pagination__page--active',
      false: '',
    },
  },
  defaultVariants: {
    active: false,
  },
})

/** Variant props inferred from {@link paginationPageVariants}. */
export type PaginationPageVariantProps = VariantProps<
  typeof paginationPageVariants
>

/** BEM class for the Pagination root (`.ui-pagination` — the flex row of controls). */
export const PAGINATION_CLASS = 'ui-pagination'

/** BEM element class for the page-number group (`.ui-pagination__pages`). */
export const PAGINATION_PAGES_CLASS = 'ui-pagination__pages'

/** BEM element class for a previous/next/first/last arrow button (`.ui-pagination__nav`). */
export const PAGINATION_NAV_CLASS = 'ui-pagination__nav'

/**
 * BEM element class for the double-chevron wrapper (`.ui-pagination__double`) — overlaps two single
 * chevrons to render a "jump to first/last" glyph (the icon set has no double-chevron).
 */
export const PAGINATION_DOUBLE_CHEVRON_CLASS = 'ui-pagination__double'
