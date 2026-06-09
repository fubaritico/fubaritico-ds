import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Size of the Spinner. */
export type SpinnerSize = 'sm' | 'md' | 'lg'

/**
 * Resolves Spinner size props into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-spinner`, `.ui-spinner--sm`, …).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * @param props - Spinner options (all optional — CVA defaults apply).
 * @param props.size - Spinner size; defaults to `'md'`.
 * @returns The space-separated BEM class string for the resolved size.
 */
export const spinnerVariants = cva('ui-spinner', {
  variants: {
    size: {
      sm: 'ui-spinner--sm',
      md: '', // default size — fully defined by the `.ui-spinner` base; no modifier emitted
      lg: 'ui-spinner--lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant props inferred from {@link spinnerVariants}. */
export type SpinnerVariantProps = VariantProps<typeof spinnerVariants>
