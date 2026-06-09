import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Visual variant of the Badge. */
export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'

/** Size of the Badge. */
export type BadgeSize = 'sm' | 'md' | 'lg'

/**
 * Resolves Badge variant/size props into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-badge`, `.ui-badge--secondary`, …).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * @param props - Badge options (all optional — CVA defaults apply).
 * @param props.variant - Visual variant; defaults to `'default'`.
 * @param props.size - Badge size; defaults to `'md'`.
 * @returns The space-separated BEM class string for the resolved variant and size.
 */
export const badgeVariants = cva('ui-badge', {
  variants: {
    variant: {
      default: '',
      secondary: 'ui-badge--secondary',
      outline: 'ui-badge--outline',
      destructive: 'ui-badge--destructive',
    },
    size: {
      sm: 'ui-badge--sm',
      md: '', // default size — fully defined by the `.ui-badge` base; no modifier emitted
      lg: 'ui-badge--lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

/** Variant props inferred from {@link badgeVariants}. */
export type BadgeVariantProps = VariantProps<typeof badgeVariants>

/**
 * BEM element class for the Badge's optional leading-icon slot (`.ui-badge__icon` in the skin).
 * Centralised here so every framework renderer references the same class name as the skin.
 */
export const BADGE_ICON_CLASS = 'ui-badge__icon'
