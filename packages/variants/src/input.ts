import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Size of the Input — drives the control geometry, icon inset and field font sizes. */
export type InputSize = 'sm' | 'md' | 'lg'

/** Colour scheme of the Input — `'dark'` for a field on an inverse panel (a dark admin). */
export type InputVariant = 'light' | 'dark'

/**
 * Resolves the Input control's size/state props into the BEM class names of the native skin
 * (`@fubaritico/styles` → `.ui-input`, `.ui-input--sm`, …).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * Only the control (the `<input>`) is resolved here. The icon-positioning wrapper and the field
 * layer have their own resolvers ({@link inputAffixVariants}, {@link inputFieldVariants}) because
 * each can render independently; the static label/message/icon element classes are exported below.
 *
 * @param props - Input control options (all optional — CVA defaults apply).
 * @param props.size - Control size; defaults to `'md'`.
 * @param props.variant - Colour scheme; defaults to `'light'`.
 * @param props.invalid - Whether the control is in an error state (destructive border + ring).
 * @param props.hasIcon - Whether a trailing icon reserves end padding.
 * @returns The space-separated BEM class string for the resolved props.
 */
export const inputVariants = cva('ui-input', {
  variants: {
    size: {
      sm: 'ui-input--sm',
      md: '', // default size — fully defined by the `.ui-input` base; no modifier emitted
      lg: 'ui-input--lg',
    },
    variant: {
      light: '', // default — fully defined by the `.ui-input` base; no modifier emitted
      dark: 'ui-input--dark',
    },
    invalid: {
      true: 'ui-input--invalid',
      false: '',
    },
    hasIcon: {
      true: 'ui-input--has-icon',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'light',
    invalid: false,
    hasIcon: false,
  },
})

/** Variant props inferred from {@link inputVariants}. */
export type InputVariantProps = VariantProps<typeof inputVariants>

/**
 * Resolves the icon-positioning wrapper's size into the BEM class names of the native skin
 * (`@fubaritico/styles` → `.ui-input-affix`, `.ui-input-affix--sm`, …). Only rendered when the
 * Input carries a trailing icon; the size only adjusts the icon inset.
 *
 * @param props - Affix options (all optional — CVA defaults apply).
 * @param props.size - Wrapper size; defaults to `'md'`.
 * @param props.variant - Colour scheme (the icon colour); defaults to `'light'`.
 * @returns The space-separated BEM class string for the resolved size and scheme.
 */
export const inputAffixVariants = cva('ui-input-affix', {
  variants: {
    size: {
      sm: 'ui-input-affix--sm',
      md: '', // default — base inset
      lg: 'ui-input-affix--lg',
    },
    variant: {
      light: '', // default — base icon colour
      dark: 'ui-input-affix--dark',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'light',
  },
})

/** Variant props inferred from {@link inputAffixVariants}. */
export type InputAffixVariantProps = VariantProps<typeof inputAffixVariants>

/**
 * Resolves the field layer's size into the BEM class names of the native skin
 * (`@fubaritico/styles` → `.ui-field`, `.ui-field--sm`, …). The size only sets the label/message
 * font-size vars; the slot element classes are static (see below).
 *
 * @param props - Field options (all optional — CVA defaults apply).
 * @param props.size - Field size; defaults to `'md'`.
 * @param props.variant - Colour scheme of the label and message; defaults to `'light'`.
 * @returns The space-separated BEM class string for the resolved size and scheme.
 */
export const inputFieldVariants = cva('ui-field', {
  variants: {
    size: {
      sm: 'ui-field--sm',
      md: '', // default — base font sizes
      lg: 'ui-field--lg',
    },
    variant: {
      light: '', // default — base colours
      dark: 'ui-field--dark',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'light',
  },
})

/** Variant props inferred from {@link inputFieldVariants}. */
export type InputFieldVariantProps = VariantProps<typeof inputFieldVariants>

/**
 * BEM element class for the decorative trailing icon inside `.ui-input-affix`
 * (`.ui-input-affix__icon` — absolutely positioned, non-interactive, muted).
 */
export const INPUT_ICON_CLASS = 'ui-input-affix__icon'

/** BEM element class for the field's label (`.ui-field__label`). */
export const INPUT_LABEL_CLASS = 'ui-field__label'

/** BEM element class for the field's helper/error message (`.ui-field__message`). */
export const INPUT_MESSAGE_CLASS = 'ui-field__message'

/**
 * BEM modifier class toggling the message into its error colour (`.ui-field__message--error`).
 * Mix onto {@link INPUT_MESSAGE_CLASS} when the message is an error.
 */
export const INPUT_MESSAGE_ERROR_CLASS = 'ui-field__message--error'
