import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Colour scheme of the Typeahead dropdown — mirrors the Listbox surface it composes. */
export type TypeaheadVariant = 'light' | 'dark'

/**
 * Resolves the Typeahead dropdown wrapper into BEM class names
 * (`.ui-typeahead__menu`, `+ --portal`).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * @param props - Menu options (all optional — CVA defaults apply).
 * @param props.portal - Whether the menu is rendered outside the Typeahead subtree; defaults to
 *   `false` (anchored under the field by the skin).
 * @returns The space-separated BEM class string for the resolved props.
 */
export const typeaheadMenuVariants = cva('ui-typeahead__menu', {
  variants: {
    portal: {
      false: '', // anchored — fully defined by the base; no modifier emitted
      true: 'ui-typeahead__menu--portal',
    },
  },
  defaultVariants: {
    portal: false,
  },
})

/** Variant props inferred from {@link typeaheadMenuVariants}. */
export type TypeaheadMenuVariantProps = VariantProps<
  typeof typeaheadMenuVariants
>

/**
 * Resolves the Typeahead "no results" row into BEM class names
 * (`.ui-typeahead__empty`, `+ --dark`).
 *
 * @param props - Empty-row options (all optional — CVA defaults apply).
 * @param props.variant - Colour scheme; defaults to `'light'` (base — no modifier emitted).
 * @returns The space-separated BEM class string for the resolved props.
 */
export const typeaheadEmptyVariants = cva('ui-typeahead__empty', {
  variants: {
    variant: {
      light: '', // default — fully defined by the base; no modifier emitted
      dark: 'ui-typeahead__empty--dark',
    },
  },
  defaultVariants: {
    variant: 'light',
  },
})

/** Variant props inferred from {@link typeaheadEmptyVariants}. */
export type TypeaheadEmptyVariantProps = VariantProps<
  typeof typeaheadEmptyVariants
>

/** BEM block class for the Typeahead root — the positioning context (`.ui-typeahead`). */
export const TYPEAHEAD_CLASS = 'ui-typeahead'

/** BEM element class for the matched-substring `<mark>` (`.ui-typeahead__mark`). */
export const TYPEAHEAD_MARK_CLASS = 'ui-typeahead__mark'
