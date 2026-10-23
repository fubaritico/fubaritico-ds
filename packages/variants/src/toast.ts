import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Where the toast stack sits — an edge and a logical inline alignment. */
export type ToasterPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end'

/** Intent of a toast — what kind of message it carries; `neutral` is the default. */
export type ToastVariant = 'neutral' | 'info' | 'success' | 'warning' | 'error'

/** The position modifiers, one per {@link ToasterPosition}. */
const POSITION_CLASSES: Record<ToasterPosition, string> = {
  'top-start': 'ui-toaster--top-start',
  'top-center': 'ui-toaster--top-center',
  'top-end': 'ui-toaster--top-end',
  'bottom-start': 'ui-toaster--bottom-start',
  'bottom-center': 'ui-toaster--bottom-center',
  'bottom-end': 'ui-toaster--bottom-end',
}

/** The intent modifiers, one per {@link ToastVariant}. */
const VARIANT_CLASSES: Record<ToastVariant, string> = {
  neutral: '', // the base — no modifier emitted
  info: '', // the base look, its glyph set by the adapter
  success: 'ui-toast--success',
  warning: 'ui-toast--warning',
  error: 'ui-toast--error',
}

/**
 * Resolves the toast stack's position into BEM class names (`.ui-toaster` + one of the six
 * `--top-start` … `--bottom-end` modifiers). Logical: `start` / `end` follow the text direction.
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike.
 *
 * @param props - Toaster options (all optional — CVA defaults apply).
 * @param props.position - Where the stack sits; defaults to `'bottom-end'`.
 * @returns The space-separated BEM class string for the resolved props.
 */
export const toasterVariants = cva('ui-toaster', {
  variants: {
    position: POSITION_CLASSES,
  },
  defaultVariants: {
    position: 'bottom-end',
  },
})

/** Variant props inferred from {@link toasterVariants}. */
export type ToasterVariantProps = VariantProps<typeof toasterVariants>

/**
 * Resolves one toast's intent and shell into BEM class names (`.ui-toast`, `+ --success` /
 * `--warning` / `--error`, `+ --bare`).
 *
 * As on the Alert, the intent colours only the border and the glyph, never the surface. `neutral`
 * and `info` share the base look: they differ by their glyph only (none / an information circle),
 * which the adapter picks.
 *
 * @param props - Toast options (all optional — CVA defaults apply).
 * @param props.variant - Message intent; defaults to `'neutral'` (base — no modifier emitted).
 * @param props.bare - Drops the surface (padding, border, background) for free content that brings
 *   its own — an `Alert`; the shadow and the corners stay. Defaults to `false`.
 * @returns The space-separated BEM class string for the resolved props.
 */
export const toastVariants = cva('ui-toast', {
  variants: {
    variant: VARIANT_CLASSES,
    bare: {
      true: 'ui-toast--bare',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'neutral',
    bare: false,
  },
})

/** Variant props inferred from {@link toastVariants}. */
export type ToastVariantProps = VariantProps<typeof toastVariants>

/** BEM element class for the stack's list (`.ui-toaster__list`). */
export const TOASTER_LIST_CLASS = 'ui-toaster__list'

/** BEM element class for a visually hidden live region (`.ui-toaster__announcer`). */
export const TOASTER_ANNOUNCER_CLASS = 'ui-toaster__announcer'

/** BEM element class for the leading intent glyph (`.ui-toast__icon`). */
export const TOAST_ICON_CLASS = 'ui-toast__icon'

/** BEM element class for the text column (`.ui-toast__content`). */
export const TOAST_CONTENT_CLASS = 'ui-toast__content'

/** BEM element class for the headline (`.ui-toast__title`). */
export const TOAST_TITLE_CLASS = 'ui-toast__title'

/** BEM element class for the text under the headline (`.ui-toast__description`). */
export const TOAST_DESCRIPTION_CLASS = 'ui-toast__description'

/** BEM element class for the trailing close control (`.ui-toast__close`). */
export const TOAST_CLOSE_CLASS = 'ui-toast__close'
