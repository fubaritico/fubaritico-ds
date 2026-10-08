import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/**
 * Colour intent of the ProgressBar indicator.
 *
 * A CLOSED set on purpose: the ported source took an open `color: string` and interpolated it into
 * `var(--color-base-${color})`, which no type system can check and which yields a transparent bar
 * when the token does not exist. Anything outside this set is a surgical override of
 * `--ui-progress-bar-indicator-color`, not a new prop value.
 */
export type ProgressBarVariant = 'default' | 'success' | 'destructive'

/** Size of the ProgressBar — drives the track thickness only. */
export type ProgressBarSize = 'sm' | 'md' | 'lg'

/**
 * Resolves the ProgressBar's variant/size props into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-progress-bar`, `.ui-progress-bar--success`, …).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * The fill extent is NOT a class: it is passed per-instance as the `--ui-progress-bar-value` custom
 * property so the skin keeps ownership of the fill direction (RTL).
 *
 * @param props - ProgressBar options (all optional — CVA defaults apply).
 * @param props.variant - Colour intent; defaults to `'default'` (base — no modifier emitted).
 * @param props.size - Track thickness; defaults to `'md'` (base — no modifier emitted).
 * @returns The space-separated BEM class string for the resolved props.
 */
export const progressBarVariants = cva('ui-progress-bar', {
  variants: {
    variant: {
      default: '', // neutral emphasis — fully defined by the base; no modifier emitted
      success: 'ui-progress-bar--success',
      destructive: 'ui-progress-bar--destructive',
    },
    size: {
      sm: 'ui-progress-bar--sm',
      md: '', // default size — fully defined by the base; no modifier emitted
      lg: 'ui-progress-bar--lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

/** Variant props inferred from {@link progressBarVariants}. */
export type ProgressBarVariantProps = VariantProps<typeof progressBarVariants>

/** BEM element class for the groove that carries `role="progressbar"` (`.ui-progress-bar__track`). */
export const PROGRESS_BAR_TRACK_CLASS = 'ui-progress-bar__track'

/** BEM element class for the fill (`.ui-progress-bar__indicator`). */
export const PROGRESS_BAR_INDICATOR_CLASS = 'ui-progress-bar__indicator'

/** BEM element class for the optional legend row under the bar (`.ui-progress-bar__meta`). */
export const PROGRESS_BAR_META_CLASS = 'ui-progress-bar__meta'

/** BEM element class for the leading legend slot (`.ui-progress-bar__meta-start`). */
export const PROGRESS_BAR_META_START_CLASS = 'ui-progress-bar__meta-start'

/** BEM element class for the trailing legend slot (`.ui-progress-bar__meta-end`). */
export const PROGRESS_BAR_META_END_CLASS = 'ui-progress-bar__meta-end'

/**
 * Custom property carrying the fill extent to the skin (a 0–100% length).
 *
 * The component computes the percentage and sets ONLY this; the skin turns it into a logical
 * `inline-size`, so the fill direction (and its RTL flip) stays out of the framework layer.
 */
export const PROGRESS_BAR_VALUE_VAR = '--ui-progress-bar-value'
