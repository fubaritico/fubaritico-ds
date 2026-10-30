import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Colour scheme of the MultiSelect — `'dark'` for a field on an inverse panel (a dark admin). */
export type MultiSelectVariant = 'light' | 'dark'

/** Size of the MultiSelect control — drives its minimum height and font size. */
export type MultiSelectSize = 'sm' | 'md' | 'lg'

/**
 * Resolves the MultiSelect root props into the BEM class names of the native skin
 * (`@fubaritico/styles` → `.ui-multi-select`, `.ui-multi-select--dark`, …). The root is mixed onto
 * the `.ui-field` layer ({@link inputFieldVariants}), which owns the label and the message.
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike.
 *
 * @param props - MultiSelect options (all optional — CVA defaults apply).
 * @param props.variant - Colour scheme; defaults to `'light'`.
 * @param props.size - Control size; defaults to `'md'`.
 * @param props.invalid - Error state (destructive border + ring); defaults to `false`.
 * @param props.disabled - Dimmed, non-interactive control; defaults to `false`.
 * @returns The space-separated BEM class string for the resolved props.
 */
export const multiSelectVariants = cva('ui-multi-select', {
  variants: {
    variant: {
      light: '', // default — fully defined by the `.ui-multi-select` base; no modifier emitted
      dark: 'ui-multi-select--dark',
    },
    size: {
      sm: 'ui-multi-select--sm',
      md: '', // default size — base
      lg: 'ui-multi-select--lg',
    },
    invalid: {
      true: 'ui-multi-select--invalid',
      false: '',
    },
    disabled: {
      true: 'ui-multi-select--disabled',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'light',
    size: 'md',
    invalid: false,
    disabled: false,
  },
})

/** Variant props inferred from {@link multiSelectVariants}. */
export type MultiSelectVariantProps = VariantProps<typeof multiSelectVariants>

/** BEM element class for the bordered box holding the badges and the input (`.ui-multi-select__control`). */
export const MULTI_SELECT_CONTROL_CLASS = 'ui-multi-select__control'

/** BEM element class for the borderless search input — the combobox (`.ui-multi-select__input`). */
export const MULTI_SELECT_INPUT_CLASS = 'ui-multi-select__input'

/**
 * BEM element class for the menu (`.ui-multi-select__menu`) — a `popover="manual"` listbox in the top
 * layer, anchored under the control by the skin.
 */
export const MULTI_SELECT_MENU_CLASS = 'ui-multi-select__menu'

/** BEM element class for an option's content: the label, then the check (`.ui-multi-select__option`). */
export const MULTI_SELECT_OPTION_CLASS = 'ui-multi-select__option'

/** BEM element class for the check glyph of a chosen option (`.ui-multi-select__check`). */
export const MULTI_SELECT_CHECK_CLASS = 'ui-multi-select__check'

/** BEM element class for the "no results" row (`.ui-multi-select__empty`). */
export const MULTI_SELECT_EMPTY_CLASS = 'ui-multi-select__empty'

/** BEM element class for the matched-substring `<mark>` (`.ui-multi-select__mark`). */
export const MULTI_SELECT_MARK_CLASS = 'ui-multi-select__mark'

/** BEM element class for the visually hidden polite live region (`.ui-multi-select__live`). */
export const MULTI_SELECT_LIVE_CLASS = 'ui-multi-select__live'

/**
 * Custom property carrying the CSS anchor name that ties the menu to the control
 * (`anchor-name` / `position-anchor`). The component sets it, unique per instance.
 */
export const MULTI_SELECT_ANCHOR_VAR = '--ui-multi-select-anchor'
