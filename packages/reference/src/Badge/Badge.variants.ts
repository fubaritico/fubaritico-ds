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
 * Pure string output (framework-agnostic) — to be promoted to `@fubaritico-ds/shared`
 * when the variant logic is shared across React / Web Components / Angular / Vue.
 *
 * @returns The space-separated BEM class string for the given props.
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
      md: 'ui-badge--md',
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
