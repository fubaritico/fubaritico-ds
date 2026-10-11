import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Colour scheme of the Typeahead dropdown — mirrors the Listbox surface it composes. */
export type TypeaheadVariant = 'light' | 'dark'

/**
 * BEM element class for the Typeahead dropdown (`.ui-typeahead__menu`) — a `popover="manual"`
 * listbox in the top layer, anchored to the field by the skin (CSS anchor positioning). Portalled or
 * not, it is placed the same way, so it carries no modifier.
 */
export const TYPEAHEAD_MENU_CLASS = 'ui-typeahead__menu'

/**
 * Custom property carrying the CSS anchor name that ties the dropdown to its field
 * (`anchor-name` / `position-anchor`). The component sets it, unique per instance.
 */
export const TYPEAHEAD_ANCHOR_VAR = '--ui-typeahead-anchor'

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
