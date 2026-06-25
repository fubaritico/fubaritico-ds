import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Size of the Checkbox — drives the box dimension and the label/message font sizes. */
export type CheckboxSize = 'sm' | 'md'

/**
 * Resolves the Checkbox label-row props into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-checkbox`, `.ui-checkbox--sm`, `.ui-checkbox--invalid`).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * Only the look axes are resolved here (size + error). The interactive STATE
 * (checked / indeterminate / disabled / focus) is intentionally NOT a variant: the skin reads it
 * straight from the native `<input>` via `:has(.ui-checkbox__input:checked)` etc., so the control
 * works identically controlled or uncontrolled, with the DOM as the single source of truth.
 *
 * @param props - Checkbox options (all optional — CVA defaults apply).
 * @param props.size - Box size; defaults to `'md'`.
 * @param props.invalid - Whether the control is in an error state (destructive box border).
 * @returns The space-separated BEM class string for the resolved props.
 */
export const checkboxVariants = cva('ui-checkbox', {
  variants: {
    size: {
      sm: 'ui-checkbox--sm',
      md: '', // default size — fully defined by the `.ui-checkbox` base; no modifier emitted
    },
    invalid: {
      true: 'ui-checkbox--invalid',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    invalid: false,
  },
})

/** Variant props inferred from {@link checkboxVariants}. */
export type CheckboxVariantProps = VariantProps<typeof checkboxVariants>

/**
 * BEM class for the outer wrapper that stacks the checkbox row and the error message in a column
 * (`.ui-checkbox-field`).
 */
export const CHECKBOX_FIELD_CLASS = 'ui-checkbox-field'

/**
 * BEM element class for the visually-hidden native `<input type="checkbox">`
 * (`.ui-checkbox__input` — sr-only, still focusable; the box mirrors its state via `:has`).
 */
export const CHECKBOX_INPUT_CLASS = 'ui-checkbox__input'

/** BEM element class for the visual box (`.ui-checkbox__box` — border/background/check glyph host). */
export const CHECKBOX_BOX_CLASS = 'ui-checkbox__box'

/** BEM element class for the check / indeterminate glyph wrapper (`.ui-checkbox__icon`). */
export const CHECKBOX_ICON_CLASS = 'ui-checkbox__icon'

/** BEM element class for the label text (`.ui-checkbox__label`). */
export const CHECKBOX_LABEL_CLASS = 'ui-checkbox__label'

/**
 * BEM element class for the error message — reuses the GENERIC field message skin
 * (`.ui-field__message`, defined in `field.css`) so the error treatment is identical across controls.
 */
export const CHECKBOX_MESSAGE_CLASS = 'ui-field__message'

/**
 * BEM modifier toggling the message into its error colour + inline icon layout
 * (`.ui-field__message--error`). Mix onto {@link CHECKBOX_MESSAGE_CLASS} when the message is an error.
 */
export const CHECKBOX_MESSAGE_ERROR_CLASS = 'ui-field__message--error'
