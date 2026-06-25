import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/**
 * Resolves the Dropdown floating-menu wrapper's placement into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-dropdown__menu`, `--flipped`, `--right`).
 *
 * Only used in the NON-portalled mode (the menu is absolutely positioned relative to the trigger). In
 * portalled mode the consumer applies computed fixed coordinates inline instead.
 *
 * @param props - Placement options (all optional — CVA defaults apply).
 * @param props.flipped - Whether the menu opens above the trigger (not enough room below).
 * @param props.align - Horizontal edge alignment with the trigger; defaults to `'left'`.
 * @returns The space-separated BEM class string for the resolved placement.
 */
export const dropdownMenuVariants = cva('ui-dropdown__menu', {
  variants: {
    flipped: {
      true: 'ui-dropdown__menu--flipped',
      false: '',
    },
    align: {
      left: '',
      right: 'ui-dropdown__menu--right',
    },
  },
  defaultVariants: {
    flipped: false,
    align: 'left',
  },
})

/** Variant props inferred from {@link dropdownMenuVariants}. */
export type DropdownMenuVariantProps = VariantProps<typeof dropdownMenuVariants>

/**
 * Resolves the trigger caret's open state into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-dropdown__caret`, `--open` rotates it 180°).
 *
 * @param props - Caret options.
 * @param props.open - Whether the dropdown is open.
 * @returns The space-separated BEM class string for the resolved state.
 */
export const dropdownCaretVariants = cva('ui-dropdown__caret', {
  variants: {
    open: {
      true: 'ui-dropdown__caret--open',
      false: '',
    },
  },
  defaultVariants: {
    open: false,
  },
})

/** Variant props inferred from {@link dropdownCaretVariants}. */
export type DropdownCaretVariantProps = VariantProps<
  typeof dropdownCaretVariants
>

/** BEM class for the Dropdown root (`.ui-dropdown` — inline row: optional label + control). */
export const DROPDOWN_CLASS = 'ui-dropdown'

/** BEM element class for the positioning wrapper around the trigger (`.ui-dropdown__control`). */
export const DROPDOWN_CONTROL_CLASS = 'ui-dropdown__control'

/** BEM element class for the trigger's inner content row (`.ui-dropdown__trigger-content`). */
export const DROPDOWN_TRIGGER_CONTENT_CLASS = 'ui-dropdown__trigger-content'

/** BEM element class for a menu item's content row — dot + icon + label (`.ui-dropdown__item`). */
export const DROPDOWN_ITEM_CLASS = 'ui-dropdown__item'

/** BEM element class for the leading colour dot (`.ui-dropdown__dot`). */
export const DROPDOWN_DOT_CLASS = 'ui-dropdown__dot'

/** BEM element class for a separator inserted before an item (`.ui-dropdown__divider`). */
export const DROPDOWN_DIVIDER_CLASS = 'ui-dropdown__divider'

/** BEM modifier marking a destructive (red) menu item (`.ui-dropdown__item--destructive`). */
export const DROPDOWN_ITEM_DESTRUCTIVE_CLASS = 'ui-dropdown__item--destructive'
