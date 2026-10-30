import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Visual variant of the Badge. */
export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'secondary-dark'
  | 'outline'
  | 'destructive'

/** Size of the Badge. */
export type BadgeSize = 'sm' | 'md' | 'lg'

/**
 * Resolves Badge variant/size props into the BEM class names of the native skin
 * (`@fubaritico/styles` → `.ui-badge`, `.ui-badge--secondary`, …).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * @param props - Badge options (all optional — CVA defaults apply).
 * @param props.variant - Visual variant; defaults to `'default'`.
 * @param props.size - Badge size; defaults to `'md'`.
 * @param props.canTruncate - When `true`, caps the badge width to its container and lets the label
 *   ellipsis-truncate (paired with the `.ui-badge__label` wrapper); defaults to `false`.
 * @returns The space-separated BEM class string for the resolved variant and size.
 */
export const badgeVariants = cva('ui-badge', {
  variants: {
    variant: {
      default: '',
      secondary: 'ui-badge--secondary',
      // The neutral chip on an inverse panel (a dark field), named after IconButton's `ghost-dark`.
      'secondary-dark': 'ui-badge--secondary-dark',
      outline: 'ui-badge--outline',
      destructive: 'ui-badge--destructive',
    },
    size: {
      sm: 'ui-badge--sm',
      md: '', // default size — fully defined by the `.ui-badge` base; no modifier emitted
      lg: 'ui-badge--lg',
    },
    canTruncate: {
      true: 'ui-badge--truncate',
      false: '', // default — the badge sizes to its content, no width cap
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
    canTruncate: false,
  },
})

/** Variant props inferred from {@link badgeVariants}. */
export type BadgeVariantProps = VariantProps<typeof badgeVariants>

/**
 * BEM element class for the Badge's optional leading-icon slot (`.ui-badge__icon` in the skin).
 * Centralised here so every framework renderer references the same class name as the skin.
 */
export const BADGE_ICON_CLASS = 'ui-badge__icon'

/**
 * BEM element class for the Badge's label slot (`.ui-badge__label` in the skin). Used ONLY when the
 * badge truncates (`canTruncate`): the label is wrapped so it can ellipsis-clip while the leading icon
 * stays visible. Centralised so every framework renderer references the same class as the skin.
 */
export const BADGE_LABEL_CLASS = 'ui-badge__label'

/**
 * BEM element class for the Badge's remove button (`.ui-badge__remove`) — rendered when the badge is
 * removable (`onRemove`). A native `<button>` with a 24px hit area around a 16px glyph.
 */
export const BADGE_REMOVE_CLASS = 'ui-badge__remove'
