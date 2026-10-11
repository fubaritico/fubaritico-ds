import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/**
 * Resolves the Dropdown floating menu's alignment into the BEM class names of the native skin
 * (`@fubaritico/styles` → `.ui-dropdown__menu`, `--right`).
 *
 * The menu is a top-layer popover anchored to the control in CSS (anchor positioning): the browser
 * flips it above the trigger when there is no room below, so there is no placement state to resolve
 * beyond the edge it aligns to.
 *
 * @param props - Alignment options (all optional — CVA defaults apply).
 * @param props.align - Edge of the trigger the menu aligns to; defaults to `'left'` (inline start),
 *   which emits the base class only. `'right'` takes effect where CSS anchor positioning is
 *   supported; elsewhere the menu is centred in the viewport and alignment does not apply.
 * @returns The space-separated BEM class string for the resolved alignment.
 */
export const dropdownMenuVariants = cva('ui-dropdown__menu', {
  variants: {
    align: {
      left: '',
      right: 'ui-dropdown__menu--right',
    },
  },
  defaultVariants: {
    align: 'left',
  },
})

/** Variant props inferred from {@link dropdownMenuVariants}. */
export type DropdownMenuVariantProps = VariantProps<typeof dropdownMenuVariants>

/**
 * Resolves the trigger caret's open state into the BEM class names of the native skin
 * (`@fubaritico/styles` → `.ui-dropdown__caret`, `--open` rotates it 180°).
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

/**
 * Custom property carrying the CSS anchor name that ties the menu to its control
 * (`anchor-name` / `position-anchor`). The component sets it, unique per instance, on the root.
 */
export const DROPDOWN_ANCHOR_VAR = '--ui-dropdown-anchor'

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
