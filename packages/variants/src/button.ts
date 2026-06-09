import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Visual variant of the Button. */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'

/** Size of the Button. */
export type ButtonSize = 'sm' | 'md' | 'lg'

/** Placement of the optional leading/trailing icon relative to the label. */
export type ButtonIconPosition = 'left' | 'right'

/**
 * Resolves Button variant/size/icon-position props into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-button`, `.ui-button--secondary`, …).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * @param props - Button options (all optional — CVA defaults apply).
 * @param props.variant - Visual variant; defaults to `'primary'`.
 * @param props.size - Button size; defaults to `'md'`.
 * @param props.iconPosition - Icon side; defaults to `'left'`.
 * @returns The space-separated BEM class string for the resolved props.
 */
export const buttonVariants = cva('ui-button', {
  variants: {
    variant: {
      primary: '',
      secondary: 'ui-button--secondary',
      destructive: 'ui-button--destructive',
      outline: 'ui-button--outline',
      ghost: 'ui-button--ghost',
    },
    size: {
      sm: 'ui-button--sm',
      md: '', // default size — fully defined by the `.ui-button` base; no modifier emitted
      lg: 'ui-button--lg',
    },
    iconPosition: {
      left: '', // default — base is already row direction
      right: 'ui-button--icon-right',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    iconPosition: 'left',
  },
})

/** Variant props inferred from {@link buttonVariants}. */
export type ButtonVariantProps = VariantProps<typeof buttonVariants>
