import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Size of the Avatar — controls the square footprint and the initials scale. */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

/** BEM class for the avatar image element. */
export const AVATAR_IMAGE_CLASS = 'ui-avatar__image'

/** BEM class for the avatar initials element. */
export const AVATAR_INITIALS_CLASS = 'ui-avatar__initials'

/** BEM class for the avatar fallback-icon element. */
export const AVATAR_ICON_CLASS = 'ui-avatar__icon'

/**
 * Resolves Avatar size props into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-avatar`, `.ui-avatar--sm`, …).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * Only the look (footprint + initials scale) is resolved here. The fallback icon's pixel size is
 * NOT a class (the Icon takes a numeric prop), so it is resolved in the React component, not here.
 *
 * @param props - Avatar options (all optional — CVA defaults apply).
 * @param props.size - Avatar size; defaults to `'md'` (base footprint, no modifier emitted).
 * @returns The space-separated BEM class string for the resolved size.
 */
export const avatarVariants = cva('ui-avatar', {
  variants: {
    size: {
      xs: 'ui-avatar--xs',
      sm: 'ui-avatar--sm',
      md: '', // default size — fully defined by the `.ui-avatar` base; no modifier emitted
      lg: 'ui-avatar--lg',
      xl: 'ui-avatar--xl',
      '2xl': 'ui-avatar--2xl',
      '3xl': 'ui-avatar--3xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant props inferred from {@link avatarVariants}. */
export type AvatarVariantProps = VariantProps<typeof avatarVariants>
