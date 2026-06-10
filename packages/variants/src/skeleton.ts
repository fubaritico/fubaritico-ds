import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Shape variant of the Skeleton — controls the corner radius. */
export type SkeletonShape = 'rectangle' | 'circle' | 'line'

/**
 * Resolves Skeleton shape/rounded props into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-skeleton`, `.ui-skeleton--circle`, …).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * Only the look (radius) is resolved here — dimensions (width/height/aspect-ratio) are
 * per-instance inline styles, not skin classes.
 *
 * @param props - Skeleton options (all optional — CVA defaults apply).
 * @param props.variant - Shape variant; defaults to `'rectangle'` (base radius, no modifier).
 * @param props.rounded - Whether to round the corners; defaults to `true`. Ignored for `circle`
 *   (always fully round). When `false` on `rectangle`/`line`, the corners are squared off.
 * @returns The space-separated BEM class string for the resolved shape.
 */
export const skeletonVariants = cva('ui-skeleton', {
  variants: {
    variant: {
      rectangle: '', // base radius — fully defined by `.ui-skeleton`; no modifier emitted
      circle: 'ui-skeleton--circle',
      line: 'ui-skeleton--line',
    },
    rounded: {
      true: '', // base — rounding is the default; no extra class needed
      false: '', // squaring is applied per-shape via compoundVariants below (never on circle)
    },
  },
  compoundVariants: [
    // `circle` is intentionally absent: it stays fully round regardless of `rounded`.
    { variant: 'rectangle', rounded: false, class: 'ui-skeleton--square' },
    { variant: 'line', rounded: false, class: 'ui-skeleton--square' },
  ],
  defaultVariants: {
    variant: 'rectangle',
    rounded: true,
  },
})

/** Variant props inferred from {@link skeletonVariants}. */
export type SkeletonVariantProps = VariantProps<typeof skeletonVariants>
