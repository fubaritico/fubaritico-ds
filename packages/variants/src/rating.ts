import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Visual look of the Rating — a progress ring (`circle`) or a row of stars (`stars`). */
export type RatingVariant = 'circle' | 'stars'

/** Size of the Rating — drives the value font-size (the SVG/icon px are per-instance inline values). */
export type RatingSize = 'sm' | 'md' | 'lg'

/**
 * Resolves the Rating's look/size props into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-rating`, `.ui-rating--circle`, `.ui-rating--lg`, …).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * The resolver is deliberately thin — Rating is mostly computed geometry (SVG dash arrays, the stars
 * `clip-path`) which stays inline on the element, not in classes. There is no score-level modifier:
 * the skin is grayscale, so the indicator colour is uniform regardless of the value.
 *
 * @param props - Rating options (all optional — CVA defaults apply).
 * @param props.variant - Visual look; defaults to `'circle'` (base — no modifier emitted).
 * @param props.size - Size; defaults to `'md'` (base — no modifier emitted).
 * @returns The space-separated BEM class string for the resolved props.
 */
export const ratingVariants = cva('ui-rating', {
  variants: {
    variant: {
      circle: '', // default look — the base `.ui-rating` IS the circle; no modifier emitted
      stars: 'ui-rating--stars',
    },
    size: {
      sm: 'ui-rating--sm',
      md: '', // default size — fully defined by `.ui-rating`; no modifier emitted
      lg: 'ui-rating--lg',
    },
  },
  defaultVariants: {
    variant: 'circle',
    size: 'md',
  },
})

/** Variant props inferred from {@link ratingVariants}. */
export type RatingVariantProps = VariantProps<typeof ratingVariants>

/** BEM element class for the shared numeric value (`.ui-rating__value`). */
export const RATING_VALUE_CLASS = 'ui-rating__value'

/**
 * BEM modifier class centring the value over the ring (`.ui-rating__value--centered`).
 * Mix onto {@link RATING_VALUE_CLASS} for the `circle` look only.
 */
export const RATING_VALUE_CENTERED_CLASS = 'ui-rating__value--centered'

/** BEM element class for the relative stars wrapper (`.ui-rating__stars`). */
export const RATING_STARS_CLASS = 'ui-rating__stars'

/** BEM element class for the empty (baseline) stars row (`.ui-rating__stars-track`). */
export const RATING_STARS_TRACK_CLASS = 'ui-rating__stars-track'

/** BEM element class for the filled (clipped, overlaid) stars row (`.ui-rating__stars-fill`). */
export const RATING_STARS_FILL_CLASS = 'ui-rating__stars-fill'

/** BEM element class for the relative circle wrapper (`.ui-rating__circle`). */
export const RATING_CIRCLE_CLASS = 'ui-rating__circle'

/** BEM element class for the rotated SVG ring (`.ui-rating__svg`). */
export const RATING_SVG_CLASS = 'ui-rating__svg'

/** BEM element class for the background track arc of the ring (`.ui-rating__track`). */
export const RATING_TRACK_CLASS = 'ui-rating__track'

/** BEM element class for the foreground progress arc of the ring (`.ui-rating__indicator`). */
export const RATING_INDICATOR_CLASS = 'ui-rating__indicator'
