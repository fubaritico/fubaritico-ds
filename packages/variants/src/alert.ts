import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Intent of an Alert — what kind of message it carries. */
export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

/**
 * Resolves an Alert's intent into BEM class names
 * (`.ui-alert`, `+ --success` / `--warning` / `--error`).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * The intent colours only the border and the glyph — never the surface — so the message text keeps
 * full foreground contrast. There is no `size` axis: an alert is a block of prose, sized by its
 * content and its container.
 *
 * @param props - Alert options (all optional — CVA defaults apply).
 * @param props.variant - Message intent; defaults to `'info'` (base — no modifier emitted).
 * @returns The space-separated BEM class string for the resolved props.
 */
export const alertVariants = cva('ui-alert', {
  variants: {
    variant: {
      info: '', // neutral default — fully defined by the base; no modifier emitted
      success: 'ui-alert--success',
      warning: 'ui-alert--warning',
      error: 'ui-alert--error',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
})

/** Variant props inferred from {@link alertVariants}. */
export type AlertVariantProps = VariantProps<typeof alertVariants>

/** BEM element class for the leading intent glyph (`.ui-alert__icon`). */
export const ALERT_ICON_CLASS = 'ui-alert__icon'

/** BEM element class for the text column (`.ui-alert__content`). */
export const ALERT_CONTENT_CLASS = 'ui-alert__content'

/** BEM element class for the optional heading (`.ui-alert__title`). */
export const ALERT_TITLE_CLASS = 'ui-alert__title'

/** BEM element class for the message body (`.ui-alert__description`). */
export const ALERT_DESCRIPTION_CLASS = 'ui-alert__description'

/** BEM element class for the trailing dismiss control (`.ui-alert__dismiss`). */
export const ALERT_DISMISS_CLASS = 'ui-alert__dismiss'
