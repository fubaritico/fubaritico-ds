import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Visual style of the Tooltip bubble. */
export type TooltipVariant = 'dark' | 'light'

/** Primary axis of a tooltip placement — drives the arrow's triangle direction. */
export type TooltipArrowAxis = 'top' | 'bottom' | 'left' | 'right'

/**
 * Resolves the Tooltip bubble's variant into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-tooltip`, `.ui-tooltip--light`).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike. `dark` is the base — its modifier is never emitted.
 *
 * @param props - Tooltip options (all optional — CVA defaults apply).
 * @param props.variant - Visual style; defaults to `'dark'`.
 * @returns The space-separated BEM class string for the resolved variant.
 */
export const tooltipVariants = cva('ui-tooltip', {
  variants: {
    variant: {
      dark: '', // default — fully defined by the `.ui-tooltip` base; no modifier emitted
      light: 'ui-tooltip--light',
    },
  },
  defaultVariants: {
    variant: 'dark',
  },
})

/** Variant props inferred from {@link tooltipVariants}. */
export type TooltipVariantProps = VariantProps<typeof tooltipVariants>

/**
 * Resolves the tooltip arrow's primary axis into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-tooltip__arrow`, `.ui-tooltip__arrow--top`, …). The axis sets which
 * border edge carries the bubble colour so the CSS triangle points back at the target.
 *
 * @param props - Arrow options.
 * @param props.axis - Primary placement axis; defaults to `'bottom'`.
 * @returns The space-separated BEM class string for the resolved axis.
 */
export const tooltipArrowVariants = cva('ui-tooltip__arrow', {
  variants: {
    axis: {
      top: 'ui-tooltip__arrow--top',
      bottom: 'ui-tooltip__arrow--bottom',
      left: 'ui-tooltip__arrow--left',
      right: 'ui-tooltip__arrow--right',
    },
  },
  defaultVariants: {
    axis: 'bottom',
  },
})

/** Variant props inferred from {@link tooltipArrowVariants}. */
export type TooltipArrowVariantProps = VariantProps<typeof tooltipArrowVariants>
