import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Size of the IconButton — mirrors Button sizes; drives the square geometry only. */
export type IconButtonSize = 'sm' | 'md' | 'lg'

/**
 * Resolves IconButton's **shape-extension** BEM classes for the native skin
 * (`@fubaritico-ds/styles` → `.ui-icon-button`, `.ui-icon-button--sm`, …).
 *
 * IconButton is Button **extended, not modified** (Open/Closed): the colour/variant classes come
 * from `buttonVariants`; this resolver only emits the icon-fitting shape layer mixed onto
 * `.ui-button` (square, circular, zero padding) plus the IconButton-only `ghost-dark` on-dark
 * variant, which redefines the reused `--ui-button-*` vars — Button itself is never touched.
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike.
 *
 * @param props - Shape options (all optional — CVA defaults apply).
 * @param props.size - Button size; defaults to `'md'`.
 * @param props.ghostDark - Whether the on-dark variant is active; defaults to `false`.
 * @returns The space-separated BEM class string for the resolved shape props.
 */
export const iconButtonVariants = cva('ui-icon-button', {
  variants: {
    size: {
      sm: 'ui-icon-button--sm',
      md: '', // default size — fully defined by the `.ui-icon-button` base; no modifier emitted
      lg: 'ui-icon-button--lg',
    },
    ghostDark: {
      true: 'ui-icon-button--ghost-dark',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    ghostDark: false,
  },
})

/** Variant props inferred from {@link iconButtonVariants}. */
export type IconButtonVariantProps = VariantProps<typeof iconButtonVariants>
